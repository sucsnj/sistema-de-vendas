// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.
import { dateToArray } from '../utils/date';
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
  ticketMedio: number;
  mediaClientes: number;
  melhorDia: string | null;
  melhorDiaValor: number;
  maiorVenda: number;
  qtdVendas: number;
  total: number;
}

let consolidado = false;

// Função assíncrona exportada.
export const registrarVenda = async (data: string, valor: number, observacoes?: string) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor, observacoes }),
  });
  return response.json();
};

// Vai ser usado exclusivamente para importar vendas de um arquivo XLSX
export const registrarVendaComCriadoEm = async (
  data: string,
  valor: number,
  observacoes?: string,
  criado_em?: string
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor, observacoes, criado_em }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const buscarVendasDiarias = async (
  mes: number,
  ano: number,
  filtro: 'positivas' | 'negativas' | 'todas' = 'todas'
): Promise<VendaDiaria[]> => {
  const response = await fetch(`/api/vendas?mes=${mes}&ano=${ano}&filtro=${filtro}`);
  return response.json();
};

// Função assíncrona exportada.
export const atualizarVenda = async (id: number, data: string, valor: number, observacoes?: string) => {
  const response = await fetch('/api/vendas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, data, valor, observacoes }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const excluirVenda = async (id: number) => {
  const response = await fetch('/api/vendas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const buscarTotalMensal = async (mes: number, ano: number): Promise<VendaMensal | null> => {
  const response = await fetch(`/api/mensais?mes=${mes}&ano=${ano}`);
  return response.json();
};

// Função assíncrona exportada.
export const buscarTodosMensais = async (): Promise<VendaMensal[]> => {
  const response = await fetch('/api/mensais');
  return response.json();
};

// Função assíncrona exportada.
export const consolidarMensal = async (mes: number, ano: number) => {
  const response = await fetch('/api/mensais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mes, ano }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const verificarConsolidado = async (mes: number, ano: number): Promise<boolean> => {
  const response = await fetch(`/api/mensais?mes=${mes}&ano=${ano}`);

  // Se não houver corpo, retorna false
  if (!response.ok) return false;

  const text = await response.text();
  if (!text) return false;

  const data = JSON.parse(text);
  return !!data && data.total !== undefined;
};

// Função assíncrona exportada.
export const autoConsolidar = async () => {
  let [day, month, year] = dateToArray() || [];
  if (!day || !month || !year) return;

  let mesAnterior = month - 1;
  if (month === 1) {
    year = year - 1;
    mesAnterior = 12;
  }

  const jaConsolidado = await verificarConsolidado(mesAnterior, year);
  if (jaConsolidado) {
    consolidado = true;
    return;
  }

  if (day > 2) {
    await consolidarMensal(mesAnterior, year);
  }
};

// Função assíncrona exportada.
export const excluirMensal = async (id: number) => {
  const response = await fetch('/api/mensais', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const fazerBackup = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};
