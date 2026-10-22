import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/produtos.module.css';
import { useToast } from '../hooks/useToast';
import {
  fetchProducts,
  fetchServices,
  deleteProduct,
  toggleProductStatus,
  fetchCategories,
  fetchBrands,
  fetchSuppliers,
  fetchUnitsOfMeasure,
  deleteService,
  ItemData,
  ServicoData,
} from '../services/produtosService';
import { ProdutoOptions } from '@/components/products/ProductForm';
import ProdutosList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import ProductDeleteModal from '@/components/products/ProductDeleteModal';
import { FiltrosState } from '@/components/products/ProductFilters';

const ProductsPage: React.FC = () => {

  const router = useRouter();

  // Lista de itens e paginação
  const [items, setItems] = useState<ItemData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros de busca
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState<FiltrosState>({
    search: '',
    tipo: 'TODOS',
    categoriaId: '',
    marcaId: '',
    fornecedorId: '',
    status: 'TODOS',
  });

  // Listas auxiliares para os dropdowns de filtro
  const [options, setOptions] = useState<ProdutoOptions>({
    categorias: [],
    marcas: [],
    fornecedores: [],
    unidadesMedida: [],
  });

  // Modal de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<ItemData | null>(null);

  // Notificações (toast) do store global
  const { showToast } = useToast();

  // Carrega opções auxiliares para os filtros
  const loadAuxiliaryData = useCallback(async () => {
    try {
      const [cats, brands, forns, uoms] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchSuppliers(),
        fetchUnitsOfMeasure(),
      ]);
      setOptions({
        categorias: cats,
        marcas: brands,
        fornecedores: forns,
        unidadesMedida: uoms,
      });
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar dados auxiliares.', 'error');
    }
  }, [showToast]);

  // Carrega o catálogo a partir das tabelas específicas de cada tipo
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [produtosData, servicosData] = await Promise.all([
        state.tipo === 'SERVICO' ? Promise.resolve(null) : fetchProducts({
          search: searchQuery || undefined,
          categoria_id: state.categoriaId || undefined,
          marca_id: state.marcaId || undefined,
          fornecedor_id: state.fornecedorId || undefined,
          ativo: state.status,
          page: 1,
          pageSize: 10000,
        }),
        state.tipo === 'PRODUTO' || state.status !== 'TODOS' ? Promise.resolve(null) : fetchServices({
          search: searchQuery || undefined,
          categoria_id: state.categoriaId || undefined,
          page: 1,
          pageSize: 10000,
        }),
      ]);

      const produtos = produtosData?.items || [];
      const servicos: ItemData[] = (servicosData?.items || []).map((servico: ServicoData) => ({
        id: servico.id,
        tipo: 'SERVICO',
        nome: servico.nome,
        descricao: servico.descricao,
        categoria_id: servico.categoria_id,
        unidade_medida_id: 21,
        marca_id: 1,
        fornecedor_id: 1,
        preco_compra: 0,
        margem_lucro: 0,
        preco_venda: servico.preco_venda,
        estoque: 0,
        multiplicador_unidade: 1,
        estoque_total: 0,
        codigo_interno: servico.codigo_interno,
        referencia: servico.referencia || '',
        duracao_minutos: servico.duracao_minutos,
        data_criacao: servico.data_criacao,
        data_atualizacao: servico.data_atualizacao,
        categoria_nome: servico.categoria_nome,
      }));

      const catalogo = [...produtos, ...servicos].sort((a, b) => a.nome.localeCompare(b.nome));
      const offset = (page - 1) * 10;
      setItems(catalogo.slice(offset, offset + 10));
      setTotal(catalogo.length);
      setTotalPages(Math.max(1, Math.ceil(catalogo.length / 10)));
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar produtos e serviços.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, state.tipo, state.categoriaId, state.marcaId, state.fornecedorId, state.status, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuxiliaryData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAuxiliaryData]);

  useEffect(() => {
    const timer = setTimeout(() => loadItems(), 0);
    return () => clearTimeout(timer);
  }, [loadItems]);

  // Handler de Busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(state.search);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setState({
      search: '',
      tipo: 'TODOS',
      categoriaId: '',
      marcaId: '',
      fornecedorId: '',
      status: 'TODOS',
    });
    setPage(1);
  };

  // Navega para /cadastro?id=X para editar o item
  const handleEditClick = (item: ItemData) => {
    router.push({
      pathname: '/cadastro',
      query: { id: item.id },
    });
  };

  // Alterna o status Ativo/Inativo
  const handleToggleStatus = async (item: ItemData) => {
    const novoStatus = item.ativo === 1 ? 0 : 1;
    try {
      if (item.tipo === 'PRODUTO') {
        await toggleProductStatus(item.id, novoStatus);
      }
      showToast(
        `Item ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso.`,
        'success'
      );
      loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao alterar status.', 'error');
    }
  };

  // Abre confirmação de exclusão
  const handleDeleteClick = (item: ItemData) => {
    setItemParaExcluir(item);
    setDeleteConfirmOpen(true);
  };

  // Confirma exclusão
  const handleConfirmDelete = async () => {
    if (!itemParaExcluir) return;
    try {
      if (itemParaExcluir.tipo === 'SERVICO') {
        await deleteService(itemParaExcluir.id);
      } else {
        await deleteProduct(itemParaExcluir.id);
      }
      showToast('Item excluído com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadItems();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao excluir item.', 'error');
    }
  };

  return (
    <>
      <Head>
        <title>Listagem</title>
        <meta
          name="description"
          content="Listagem de produtos e serviços com filtros, paginação e controle de status."
        />
      </Head>

      <div className={styles.produtosPage}>

        <div>
          <h1 id="page-title">Listagem</h1>
          <p>Listagem com filtros, paginação e controle de status.</p>
        </div>

        <div className={styles.listagemGrid}>
          {/* Coluna Esquerda: Listagem e Filtros */}
          <div className={styles.produtosGridLeft}>
            {/* Filtros */}
            <ProductFilters
              state={state}
              data={options}
              setFiltros={setState}
              actions={{
                buscar: handleSearchSubmit,
                limpar: handleClearFilters,
                mudarPagina: setPage,
              }}
            />

            {/* Listagem */}
            <ProdutosList
              items={items}
              loading={loading}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>

        {/* Modal: Confirmação de Exclusão */}
        {deleteConfirmOpen && itemParaExcluir && (
          <ProductDeleteModal
            open={deleteConfirmOpen}
            item={itemParaExcluir}
            onConfirm={handleConfirmDelete}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setItemParaExcluir(null);
            }}
          />
        )}

        {/* Botão flutuante: Novo Cadastro */}
        <Link href="/cadastro" className={styles.fab} id="fab-novo-cadastro" title="Novo cadastro">
          <span className={styles.fabIcon}>+</span>
        </Link>
      </div >
    </>
  );
};

export default ProductsPage;
