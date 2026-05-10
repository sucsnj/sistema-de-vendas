import type { NextApiRequest, NextApiResponse } from 'next';
import { insertConta } from '../../../database/contasDb';
import { insertNota } from '../../../database/notasDb';
import { parseStringPromise } from 'xml2js';

// Nomes de distribuidoras válidos
const nomesValidos = [
  'acripel', 'cimed', 'profarma', 'g1', 'nova',
  'unilever', 'aujo', 'f&f', 'nds', 'mbca', 'plena', 'total', 'pro'
];

// Funções auxiliares para formatar e normalizar dados
const formatarDistribuidora = (nome: string) => {
  const lower = nome.toLowerCase();
  if (lower.includes('f&f')) return 'FF';
  const encontrado = nomesValidos.find(n => lower.includes(n));
  if (encontrado) {
    return encontrado.charAt(0).toUpperCase() + encontrado.slice(1);
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Funções auxiliares para ajustar valores por distribuidora
const ajustarValorPorDistribuidora = (nome: string, valor: number) => {
  if (nome.toLowerCase() === 'cimed') return valor + 3.99;
  if (nome.toLowerCase() === 'pro') return valor + 1.39;
  return valor;
};

// Funções auxiliares para normalizar documentos
const normalizarDocumento = (doc: string) => {
  return doc.replace(/[A-Z]/gi, (letra) => {
    const code = letra.toUpperCase().charCodeAt(0) - 64; // A=1
    return code.toString();
  });
};

// Função principal do endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { xml } = req.body;
    if (!xml) {
      return res.status(400).json({ error: 'Arquivo XML não fornecido' });
    }

    const parsed = await parseStringPromise(xml, { explicitArray: true });

    // Caminho correto dentro do XML
    const infNFe = parsed.nfeProc.NFe[0].infNFe[0];
    const distribuidoraRaw = infNFe.emit[0].xNome[0];
    const nNF = infNFe.ide[0].nNF[0];
    const duplicatas = infNFe.cobr[0].dup;

    const dhSaiEnt = infNFe.ide[0].dhEmi[0]; // emissão
    const vPag = infNFe.cobr[0].fat[0].vOrig[0]; // total

    const data = dhSaiEnt.split('T')[0];

    let distribuidora = formatarDistribuidora(distribuidoraRaw);
    let documentoBase = normalizarDocumento(nNF);

    const registros: any[] = [];

    for (let i = 0; i < duplicatas.length; i++) {
      let valor = parseFloat(duplicatas[i].vDup[0]);
      let vencimento = duplicatas[i].dVenc[0];

      valor = ajustarValorPorDistribuidora(distribuidora, valor);
      const documento = `${documentoBase}${i + 1}`;

      insertConta(distribuidora, valor, vencimento, documento);

      registros.push({ distribuidora, valor, vencimento, documento });
    }

    // Adiciona notas de pagamento
    insertNota(data, vPag);

    return res.status(200).json({ sucesso: true, registros });
  } catch (error) {
    console.error('Erro ao importar XML:', error);
    return res.status(500).json({ error: 'Erro interno ao processar XML' });
  }
}
