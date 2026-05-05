// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.

export interface VendaDiaria {
  id: number;
  data: string;
  valor: number;
  observacoes?: string;
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

export const fazerBackup = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};