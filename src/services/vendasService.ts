// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.
import dayjs from 'dayjs';
dayjs.locale('pt-br');

export interface VendaDiaria {
  id: number;
  data: string;
  valor: number;
  observacoes?: string;
  criado_em: string;
}

export interface VendaMensal {
  id: number;
  mes: number;
  ano: number;
  total: number;
}

export const registrarVenda = async (data: string, valor: number, observacoes?: string) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor, observacoes }),
  });
  return response.json();
};

export const buscarVendasDiarias = async (mes: number, ano: number): Promise<VendaDiaria[]> => {
  const response = await fetch(`/api/vendas?mes=${mes}&ano=${ano}`);
  return response.json();
};

export const atualizarVenda = async (id: number, data: string, valor: number, observacoes?: string) => {
  const response = await fetch('/api/vendas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, data, valor, observacoes }),
  });
  return response.json();
};

export const excluirVenda = async (id: number) => {
  const response = await fetch('/api/vendas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

export const buscarTotalMensal = async (mes: number, ano: number): Promise<VendaMensal | null> => {
  const response = await fetch(`/api/mensais?mes=${mes}&ano=${ano}`);
  return response.json();
};

export const buscarTodosMensais = async (): Promise<VendaMensal[]> => {
  const response = await fetch('/api/mensais');
  return response.json();
};

export const consolidarMensal = async (mes: number, ano: number) => {
  const response = await fetch('/api/mensais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mes, ano }),
  });
  return response.json();
};

export const calcularTicketMedio = async (mes: number, ano: number): Promise<number> => {
  const vendas = await buscarVendasDiarias(mes, ano);
  const total = vendas.reduce((acc, v) => acc + v.valor, 0);
  return vendas.length > 0 ? total / vendas.length : 0;
};

export const calcularQuantidadeVendas = async (mes: number, ano: number): Promise<number> => {
  const vendas = await buscarVendasDiarias(mes, ano);
  return vendas.length;
};

export const calcularMelhorDia = async (mes: number, ano: number): Promise<string | null> => {
  const vendas = await buscarVendasDiarias(mes, ano);
  const agrupado = vendas.reduce((acc: Record<string, number>, v) => {
    acc[v.data] = (acc[v.data] || 0) + v.valor;
    return acc;
  }, {});
  const melhor = Object.entries(agrupado).sort((a, b) => b[1] - a[1])[0];
  return melhor ? melhor[0] : null;
};

export const calcularMediaClientes = async (mes: number, ano: number): Promise<number> => {
  const vendas = await buscarVendasDiarias(mes, ano);

  if (vendas.length === 0) return 0;

  const diasComVendas = [...new Set(vendas.map((venda) => venda.data))];
  const quantidadeVendas = vendas.length;
  const media = quantidadeVendas > 0 && diasComVendas.length > 0 ? quantidadeVendas / diasComVendas.length : 0;

  return media;
};

export const calcularMaiorVenda = async (mes: number, ano: number): Promise<number> => {
  const vendas = await buscarVendasDiarias(mes, ano);
  const maiorVenda = vendas.reduce((acc, v) => acc > v.valor ? acc : v.valor, 0);
  
  return maiorVenda || 0;
};

export const fazerBackup = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};