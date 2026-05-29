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
  maiorVenda: number;
  qtdVendas: number;
  total: number;
}

let consolidado = false;

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

export const verificarConsolidado = async (): Promise<boolean> => {
  const [day, month, year] = dateToArray() || [];
  if (!day || !month || !year) return false;

  if (consolidado) return true;
  if (day > 2) return false;

  consolidado = false;
  return false;
};

export const autoConsolidar = async () => {
  if (consolidado) return;

  let [day, month, year] = dateToArray() || [];
  if (!day || !month || !year) return;

  let mesAnterior = month - 1;
  if (month === 1) {
    year = year - 1;
    mesAnterior = 12;
  } else {
    mesAnterior = month - 1;
  }

  if (day > 2) {
    await consolidarMensal(mesAnterior, year);
    consolidado = true;
  }
};

export const fazerBackup = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};