export interface NotaDetalhe {
  id: number;
  data_emissao: string;
  valor_nota: number;
}

export const buscarNotasPorPeriodo = async (ano: number, mes?: number): Promise<NotaDetalhe[]> => {
  const params = new URLSearchParams({ ano: String(ano) });
  if (mes !== undefined) {
    params.append('mes', String(mes));
  }

  const response = await fetch(`/api/notas?${params.toString()}`);
  return response.json();
};

export const buscarNotaPorValor = async (valor: number): Promise<NotaDetalhe | null> => {
  const params = new URLSearchParams({ valor: String(valor) });
  const response = await fetch(`/api/notas?${params.toString()}`);
  if (response.status === 404) {
    return null;
  }
  return response.json();
};

export const excluirNota = async (id: number) => {
  const response = await fetch('/api/notas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};
