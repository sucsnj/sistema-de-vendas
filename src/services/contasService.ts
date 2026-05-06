export interface ContaDetalhe {
  id: number;
  distribuidora: string;
  valor: number;
  valor_nota?: number;
  vencimento: string;
  documento: string;
  status: 'Pendente' | 'Pago';
  banco_observacoes?: string;
  criado_em?: string;
}

export const registrarConta = async (
  distribuidora: string,
  valor: number,
  vencimento: string,
  documento: string,
  bancoObservacoes?: string,
  valorNota?: number,
) => {
  const response = await fetch('/api/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ distribuidora, valor, valorNota, vencimento, documento, bancoObservacoes }),
  });
  return response.json();
};

export const buscarContas = async (ano: number, mes?: number): Promise<ContaDetalhe[]> => {
  const params = new URLSearchParams({ ano: String(ano) });
  if (mes !== undefined) {
    params.append('mes', String(mes));
  }

  const response = await fetch(`/api/contas?${params.toString()}`);
  return response.json();
};

export const pagarConta = async (id: number) => {
  const response = await fetch('/api/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pagar', id }),
  });
  return response.json();
};

export const cancelarPagamentoConta = async (id: number) => {
  const response = await fetch('/api/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cancelar', id }),
  });
  return response.json();
};

export const atualizarConta = async (
  id: number,
  distribuidora: string,
  valor: number,
  vencimento: string,
  documento: string,
  bancoObservacoes?: string,
  valorNota?: number,
) => {
  const response = await fetch('/api/contas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, distribuidora, valor, valorNota, vencimento, documento, bancoObservacoes }),
  });
  return response.json();
};

export const excluirConta = async (id: number) => {
  const response = await fetch('/api/contas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

export const fazerBackupContas = async () => {
  const response = await fetch('/api/contas/backup', {
    method: 'POST',
  });
  return response.json();
};
