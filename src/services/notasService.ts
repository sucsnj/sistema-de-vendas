export interface NotaDetalhe {
  id: number;
  distribuidora: string;
  chave: string;
  data_emissao: string;
  valor_nota: number;
}

// Função assíncrona exportada.
export const fetchInvoicesByPeriod = async (year: number, month?: number): Promise<NotaDetalhe[]> => {
  const params = new URLSearchParams({ ano: String(year) });
  if (month !== undefined) {
    params.append('mes', String(month));
  }

  const response = await fetch(`/api/notas?${params.toString()}`);
  return response.json();
};

// Função assíncrona exportada.
export const fetchInvoiceByAmount = async (amount: number): Promise<NotaDetalhe | null> => {
  const params = new URLSearchParams({ valor: String(amount) });
  const response = await fetch(`/api/notas?${params.toString()}`);
  if (response.status === 404) {
    return null;
  }
  return response.json();
};

// Função assíncrona exportada.
export const fetchAllInvoices = async (): Promise<NotaDetalhe[]> => {
  const response = await fetch('/api/notas');
  return response.json();
};

// Função assíncrona exportada.
export const deleteInvoice = async (id: number) => {
  const response = await fetch('/api/notas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};
