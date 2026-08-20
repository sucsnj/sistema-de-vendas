import type { NextApiRequest, NextApiResponse } from 'next';
import { insertItem, getItemByBarcode, checkDuplicateBarcode, insertMovimentacaoEstoque } from '../../../database/produtosDb';
import { parseNumber } from '../../../utils/number';
import { parseStringPromise } from 'xml2js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { xml, preview, importar, produto } = req.body;

        // MODO 1: Pre-visualizar / parsear o XML e retornar a lista de produtos
        if (preview) {
            if (!xml) {
                return res.status(400).json({ error: 'Arquivo XML não fornecido' });
            }

            const parsed = await parseStringPromise(xml, { explicitArray: true });

            if (!parsed.nfeProc || !parsed.nfeProc.NFe || !parsed.nfeProc.NFe[0].infNFe) {
                return res.status(400).json({ error: 'Formato de XML de NF-e inválido' });
            }

            const infNFe = parsed.nfeProc.NFe[0].infNFe[0];
            const itens = infNFe.det || [];
            const produtos: any[] = [];

            const ide = infNFe.ide?.[0] || {};
            const tpNF = ide.tpNF?.[0]; // 0=entrada, 1=saída do fornecedor
            // Na importação de nota (mesmo sendo saída do fornecedor), para a loja local é um AJUSTE ou ENTRADA para somar no estoque.
            const tipoMovimentacao = 'ENTRADA';

            for (let i = 0; i < itens.length; i++) {
                const prod = itens[i].prod[0];

                const ean = prod.cEAN && prod.cEAN[0] !== 'SEM GTIN' ? prod.cEAN[0] : '';
                const descricao = prod.xProd[0];
                const unidadeMedida = prod.uCom[0];
                const quantidade = parseNumber(prod.qCom[0]);
                const valorUnitario = parseNumber(prod.vUnCom[0]);
                
                // Ignorar os itens duplicados no mesmo XML pelo EAN
                const existe = produtos.find(p => p.ean && p.ean === ean);
                if (!existe || !ean) {
                     produtos.push({
                         ean,
                         descricao,
                         unidadeMedida,
                         quantidade,
                         valorUnitario,
                         tipoMovimentacao
                     });
                } else if (existe && ean) {
                     existe.quantidade += quantidade;
                }
            }

            return res.status(200).json({ produtos });
        }

        // MODO 2: Importar um produto específico
        if (importar && produto) {
            const { ean, descricao, unidadeMedida, quantidade, valorUnitario, tipoMovimentacao } = produto;

            // 1. Verifica se já existe produto com esse EAN (código de barras)
            if (ean) {
                const itemExistente = getItemByBarcode(ean);
                if (itemExistente) {
                    insertMovimentacaoEstoque({
                        item_id: itemExistente.id,
                        tipo: tipoMovimentacao || 'ENTRADA',
                        quantidade,
                        descricao: 'Importação de XML de NF-e',
                    });
                    return res.status(200).json({ sucesso: true, id: itemExistente.id, estoqueAtualizado: true });
                }
                const duplicateInBarcodesTable = checkDuplicateBarcode([ean]);
                if (duplicateInBarcodesTable) {
                     return res.status(400).json({ error: `Código de barras já está cadastrado em outro produto`, duplicado: true });
                }
            }

            // 2. Prepara os dados para inserção (usaremos valores padrão para campos obrigatórios não presentes na NF-e)
            // categoria_id 1 = Geral
            // unidade_medida_id 1 = UN
            // marca_id 1 = Outros
            // fornecedor_id 1 = Sem fornecedor
            const listBarcodes = ean ? [{ codigo_barras: ean.trim(), principal: 1 }] : [];

            const precoCompra = valorUnitario;
            const precoVenda = valorUnitario * 1.5; // Margem padrão de 50%
            const margemLucro = 50;

            const novoItem = {
                tipo: 'PRODUTO' as const,
                nome: descricao.substring(0, 100), // Limita tamanho se necessário
                descricao: `Importado via XML da NF-e`,
                categoria_id: 1, 
                unidade_medida_id: 1, 
                marca_id: 1,
                fornecedor_id: 1,
                preco_compra: precoCompra,
                margem_lucro: margemLucro,
                preco_venda: precoVenda,
                estoque: quantidade,
                multiplicador_unidade: 1,
                referencia: null,
                ativo: 1,
                codigos_barras: listBarcodes,
            };

            const itemId = insertItem(novoItem);

            return res.status(201).json({ sucesso: true, id: itemId });
        }

        return res.status(400).json({ error: 'Modo de operação inválido' });

    } catch (error: any) {
        console.error('Erro na API de importação de itens:', error);
        return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
    }
}
