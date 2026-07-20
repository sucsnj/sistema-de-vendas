export interface BarcodeData {
  codigo_barras: string;
  principal: number;
}

export interface ItemData {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  descricao?: string;
  categoria_id: number;
  unidade_medida_id: number;
  marca_id: number;
  fornecedor_id: number;
  preco_compra: number;
  margem_lucro: number;
  preco_venda: number;
  estoque: number;
  codigo_interno?: string;
  referencia: string;
  ativo: number;
  data_criacao?: string;
  data_atualizacao?: string;
  categoria_nome?: string;
  marca_nome?: string;
  unidade_medida_sigla?: string;
  unidade_medida_descricao?: string;
  codigos_barras?: BarcodeData[];
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoriaData {
  id: number;
  nome: string;
  descricao?: string;
}

export interface MarcaData {
  id: number;
  nome: string;
}

export interface FornecedorData {
  id: number;
  nome: string;
}

export interface UnidadeMedidaData {
  id: number;
  sigla: string;
  descricao?: string;
}

export const buscarProdutos = async (options: {
  search?: string;
  tipo?: 'PRODUTO' | 'SERVICO' | 'TODOS';
  categoria_id?: number;
  marca_id?: number;
  fornecedor_id?: number;
  preco_venda?: number;
  ativo?: 'ATIVO' | 'INATIVO' | 'TODOS';
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ItemData>> => {
  const params = new URLSearchParams();
  if (options.search) params.append('search', options.search);
  if (options.tipo) params.append('tipo', options.tipo);
  if (options.categoria_id) params.append('categoria_id', String(options.categoria_id));
  if (options.marca_id) params.append('marca_id', String(options.marca_id));
  if (options.fornecedor_id) params.append('fornecedor_id', String(options.fornecedor_id));
  if (options.preco_venda) params.append('preco_venda', String(options.preco_venda));
  if (options.ativo) params.append('ativo', options.ativo);
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));

  const response = await fetch(`/api/produtos?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar produtos.');
  }
  return response.json();
};

export const registrarProduto = async (dados: Omit<ItemData, 'id' | 'ativo'> & { ativo?: number }) => {
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar produto.');
  }
  return response.json();
};

export const atualizarProduto = async (id: number, dados: Omit<ItemData, 'id'>) => {
  const response = await fetch('/api/produtos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...dados }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar produto.');
  }
  return response.json();
};

export const excluirProduto = async (id: number) => {
  const response = await fetch('/api/produtos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir produto.');
  }
  return response.json();
};

export const toggleStatusProduto = async (id: number, ativo: number) => {
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggle-status', id, ativo }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao alterar status do produto.');
  }
  return response.json();
};

// Chamadas de API para Categorias
export const buscarCategorias = async (): Promise<CategoriaData[]> => {
  const response = await fetch('/api/produtos/categorias');
  if (!response.ok) throw new Error('Erro ao buscar categorias.');
  return response.json();
};

export const criarCategoria = async (nome: string, descricao?: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar categoria.');
  }
  return response.json();
};

export const deletarCategoria = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/categorias?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar categoria.');
  }
  return response.json();
};

export const atualizarCategoria = async (id: number, nome: string, descricao?: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/categorias?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar categoria.');
  }
  return response.json();
};

// Chamadas de API para Marcas
export const buscarMarcas = async (): Promise<MarcaData[]> => {
  const response = await fetch('/api/produtos/marcas');
  if (!response.ok) throw new Error('Erro ao buscar marcas.');
  return response.json();
};

export const criarMarca = async (nome: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/marcas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar marca.');
  }
  return response.json();
};

export const deletarMarca = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/marcas?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar marca.');
  }
  return response.json();
};

export const atualizarMarca = async (id: number, nome: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/marcas?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar marca.');
  }
  return response.json();
};

// Chamadas de API para Fornecedores
export const buscarFornecedores = async (): Promise<FornecedorData[]> => {
  const response = await fetch('/api/produtos/fornecedores');
  if (!response.ok) throw new Error('Erro ao buscar fornecedores.');
  return response.json();
};

export const criarFornecedor = async (nome: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/fornecedores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar fornecedor.');
  }
  return response.json();
};

export const deletarFornecedor = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/fornecedores?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar fornecedor.');
  }
  return response.json();
};

export const atualizarFornecedor = async (id: number, nome: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/fornecedores?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar fornecedor.');
  }
  return response.json();
};

// Chamadas de API para Unidade de Medida
export const buscarUnidadesMedida = async (): Promise<UnidadeMedidaData[]> => {
  const response = await fetch('/api/produtos/unidades-medida');
  if (!response.ok) throw new Error('Erro ao buscar unidades de medida.');
  return response.json();
};

export const criarUnidadeMedida = async (nome: string, descricao?: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/unidades-medida', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar unidade de medida.');
  }
  return response.json();
};

export const deletarUnidadeMedida = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/unidades-medida?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar unidade de medida.');
  }
  return response.json();
};

export const atualizarUnidadeMedida = async (id: number, nome: string, descricao?: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/unidades-medida?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar unidade de medida.');
  }
  return response.json();
};