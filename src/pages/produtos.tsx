import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/produtos.module.css';
import Toast from '../components/Toast';
import {
  buscarProdutos,
  registrarProduto,
  atualizarProduto,
  excluirProduto,
  toggleStatusProduto,
  buscarCategorias,
  buscarMarcas,
  buscarFornecedores,
  buscarUnidadesMedida,
  buscarMovimentacoesEstoque,
  registrarMovimentacaoEstoque,
  registrarServico,
  atualizarServico,
  ItemData,
  BarcodeData,
  MovimentacaoEstoqueData,
} from '../services/produtosService';
import { parseNumber } from '../utils/number';
import ProdutosList from '@/components/ProdutosList';
import Filtros from '@/components/Filtros';
import BarcodeManager from '@/components/BarcodeManager';
import FormularioItem from '@/components/FormularioItem';
import ModalCategoria from '@/components/ModalCategoria';
import ModalMarca from '@/components/ModalMarca';
import ModalProdExclusao from '@/components/ModalProdExclusao';
import ModalCategoriaEdit from '@/components/ModalCategoriaEdit';
import ModalMarcaEdit from '@/components/ModalMarcaEdit';
import ModalFornecedor from '@/components/ModalFornecedor';
import ModalFornecedorEdit from '@/components/ModalFornecedorEdit';
import ModalUnidadeMedida from '@/components/ModalUnidadeMedida';
import ModalUnidadeMedidaEdit from '@/components/ModalUnidadeMedidaEdit';
import ModalAjusteEstoque from '@/components/ModalAjusteEstoque';
import { ProdutoFormData, ProdutoOptions } from '@/components/FormularioProduto';
import { FiltrosState } from '@/components/Filtros';
import { useCategoria } from '@/hooks/useCategoria';
import { useMarca } from '@/hooks/useMarca';
import { useFornecedor } from '@/hooks/useFornecedor';
import { useUnidadeMedida } from '@/hooks/useUnidadeMedida';

const ProdutosPage: React.FC = () => {
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

  // Listas auxiliares para dropdowns
  const [options, setOptions] = useState<ProdutoOptions>({
    categorias: [],
    marcas: [],
    fornecedores: [],
    unidadesMedida: [],
  });

  // Estado do formulário de Cadastro/Edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProdutoFormData>({
    tipo: 'PRODUTO',
    nome: '',
    descricao: '',
    categoriaId: 1,
    marcaId: 1,
    fornecedorId: 1,
    precoCompra: '',
    margemLucro: '',
    precoVenda: '',
    estoque: '',
    unidadeMedidaId: 1,
    codigoInterno: '',
    referencia: '',
    duracaoMinutos: '',
    ativo: 1,
  });
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
  const [ajusteQuantidade, setAjusteQuantidade] = useState('');
  const [ajusteDescricao, setAjusteDescricao] = useState('');
  const [movimentacoesEstoque, setMovimentacoesEstoque] = useState<MovimentacaoEstoqueData[]>([]);
  const [movimentacoesLoading, setMovimentacoesLoading] = useState(false);
  const [formCodigosBarras, setFormCodigosBarras] = useState<BarcodeData[]>([]);
  const [novoCodigoBarras, setNovoCodigoBarras] = useState('');

  // Modal de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<ItemData | null>(null);

  // Toast notifications
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Refs para focar campos
  const nomeInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => setToastOpen(false);

  // Carrega opções auxiliares
  const carregarAuxiliares = async () => {
    try {
      const [cats, brands, forns, uoms] = await Promise.all([
        buscarCategorias(),
        buscarMarcas(),
        buscarFornecedores(),
        buscarUnidadesMedida(),
      ]);
      setOptions({
        categorias: cats,
        marcas: brands,
        fornecedores: forns,
        unidadesMedida: uoms,
      });
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar dados auxiliares (categorias, marcas, fornecedores, unidades de medida).', 'error');
    }
  };

  // Carrega lista de produtos
  const carregarItens = async () => {
    setLoading(true);
    try {
      const data = await buscarProdutos({
        search: searchQuery || undefined,
        tipo: state.tipo,
        categoria_id: state.categoriaId || undefined,
        marca_id: state.marcaId || undefined,
        fornecedor_id: state.fornecedorId || undefined,
        ativo: state.status,
        page,
        pageSize: 10,
      });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar produtos e serviços.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAuxiliares();
  }, []);

  useEffect(() => {
    carregarItens();
  }, [page, searchQuery, state.tipo, state.categoriaId, state.marcaId, state.fornecedorId, state.status]);

  // Handler de Busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(state.search);
  };

  const handleLimparFiltros = () => {
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

  // Reseta Formulário
  const resetForm = () => {
    setEditingId(null);
    setForm({
      tipo: 'PRODUTO',
      nome: '',
      descricao: '',
      categoriaId: 1,
      marcaId: 1,
      fornecedorId: 1,
      precoCompra: '',
      margemLucro: '',
      precoVenda: '',
      estoque: '',
      unidadeMedidaId: 1,
      codigoInterno: '',
      referencia: '',
      duracaoMinutos: '',
      ativo: 1,
    });
    setFormCodigosBarras([]);
    setNovoCodigoBarras('');
    setAjusteQuantidade('');
    setAjusteDescricao('');
    setMovimentacoesEstoque([]);
    setModalAjusteOpen(false);
  };

  const carregarMovimentacoes = async (itemId: number) => {
    setMovimentacoesLoading(true);
    try {
      const data = await buscarMovimentacoesEstoque(itemId);
      setMovimentacoesEstoque(data.slice(0, 10));
    } catch (error: any) {
      console.error(error);
      showToast('Erro ao carregar histórico de movimentações.', 'error');
      setMovimentacoesEstoque([]);
    } finally {
      setMovimentacoesLoading(false);
    }
  };

  // Adiciona Código de Barras ao formulário
  const handleAddBarcode = () => {
    const code = novoCodigoBarras.trim();
    if (!code) {
      showToast('Código de barras não pode ser vazio.', 'error');
      barcodeInputRef.current?.focus();
      return;
    }

    if (formCodigosBarras.some((c) => c.codigo_barras === code)) {
      showToast('Este código de barras já foi adicionado a este item.', 'error');
      barcodeInputRef.current?.focus();
      return;
    }

    // Se for o primeiro, ele será o principal
    const principal = formCodigosBarras.length === 0 ? 1 : 0;
    setFormCodigosBarras([...formCodigosBarras, { codigo_barras: code, principal }]);

    setNovoCodigoBarras('');
    barcodeInputRef.current?.focus();
  };

  // Remove Código de Barras do formulário
  const handleRemoveBarcode = (code: string) => {
    const itemToRemove = formCodigosBarras.find((c) => c.codigo_barras === code);
    const updated = formCodigosBarras.filter((c) => c.codigo_barras !== code);

    // Se o removido era o principal e sobrou algum código, define o primeiro como principal
    if (itemToRemove?.principal === 1 && updated.length > 0) {
      updated[0].principal = 1;
    }

    setFormCodigosBarras(updated);
  };

  // Alterna o Código de Barras Principal
  const handleSetPrincipalBarcode = (code: string) => {
    const updated = formCodigosBarras.map((c) => ({
      ...c,
      principal: c.codigo_barras === code ? 1 : 0,
    }));
    setFormCodigosBarras(updated);
  };

  // Submit do formulário de Cadastro/Edição
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      showToast('O nome do item é obrigatório.', 'error');
      nomeInputRef.current?.focus();
      return;
    }
    if (!form.categoriaId) {
      showToast('Selecione uma categoria.', 'error');
      return;
    }
    if (!form.marcaId) {
      showToast('Selecione uma marca.', 'error');
      return;
    }
    if (!form.fornecedorId) {
      showToast('Selecione um fornecedor.', 'error');
      return;
    }
    if (!form.unidadeMedidaId && form.tipo === 'PRODUTO') {
      showToast('Selecione uma unidade de medida.', 'error');
      return;
    }

    const precoCompraRaw = parseNumber(form.precoCompra);
    const margemLucroRaw = parseNumber(form.margemLucro);
    const precoVendaRaw = parseNumber(form.precoVenda);
    const estoqueRaw = parseNumber(form.estoque);

    const precoCompraValor = Number.isFinite(precoCompraRaw) ? precoCompraRaw : 0;
    const margemLucroValor = Number.isFinite(margemLucroRaw) ? margemLucroRaw : 0;
    const precoVendaValor = Number.isFinite(precoVendaRaw) ? precoVendaRaw : 0;
    const estoqueValor = Number.isFinite(estoqueRaw) ? estoqueRaw : 0;

    // Validação de código principal nos códigos de barras
    if (formCodigosBarras.length > 0) {
      const temPrincipal = formCodigosBarras.some((c) => c.principal === 1);
      if (!temPrincipal) {
        // Força o primeiro como principal se nenhum foi marcado
        formCodigosBarras[0].principal = 1;
      }
    }

    const payload = {
      tipo: form.tipo,
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      categoria_id: Number(form.categoriaId),
      marca_id: Number(form.marcaId),
      fornecedor_id: Number(form.fornecedorId),
      preco_compra: precoCompraValor,
      margem_lucro: margemLucroValor,
      preco_venda: precoVendaValor,
      estoque: estoqueValor,
      unidade_medida_id: Number(form.unidadeMedidaId),
      codigo_interno: form.codigoInterno.trim() || undefined,
      referencia: form.referencia.trim(),
      duracao_minutos: Number(form.duracaoMinutos) || 0,
      ativo: form.ativo,
      codigos_barras: formCodigosBarras,
    };

    const servicePayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      categoria_id: Number(form.categoriaId),
      preco_venda: precoVendaValor,
      codigo_interno: form.codigoInterno.trim() || undefined,
      referencia: form.referencia.trim(),
      duracao_minutos: Number(form.duracaoMinutos) || 0,
    };

    try {
      if (form.tipo === 'SERVICO') {
        if (editingId) {
          await atualizarServico(editingId, servicePayload);
          showToast('Serviço atualizado com sucesso.', 'success');
        } else {
          await registrarServico(servicePayload);
          showToast('Serviço cadastrado com sucesso.', 'success');
        }
      } else {
        if (editingId) {
          await atualizarProduto(editingId, payload);
          showToast('Item atualizado com sucesso.', 'success');
        } else {
          await registrarProduto(payload);
          showToast('Item cadastrado com sucesso.', 'success');
        }
      }
      resetForm();
      carregarItens();
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar o item.', 'error');
    }
  };

  // Carrega item para edição
  const handleEditarClick = async (item: ItemData) => {
    setEditingId(item.id);
    setForm({
      tipo: item.tipo,
      nome: item.nome,
      descricao: item.descricao || '',
      categoriaId: item.categoria_id,
      marcaId: item.marca_id,
      fornecedorId: item.fornecedor_id,
      precoCompra: String(item.preco_compra),
      margemLucro: String(item.margem_lucro),
      precoVenda: String(item.preco_venda),
      estoque: String(item.estoque),
      unidadeMedidaId: item.unidade_medida_id,
      codigoInterno: item.codigo_interno || '',
      referencia: item.referencia || '',
      duracaoMinutos: 'duracao_minutos' in item ? String((item as any).duracao_minutos) : '',
      ativo: item.ativo,
    });
    setFormCodigosBarras(item.codigos_barras || []);
    setNovoCodigoBarras('');
    setAjusteQuantidade('');
    setAjusteDescricao('');
    setMovimentacoesEstoque([]);
    setModalAjusteOpen(false);
    nomeInputRef.current?.focus();
  };

  // Alterna o status Ativo/Inativo
  const handleToggleStatus = async (item: ItemData) => {
    const novoStatus = item.ativo === 1 ? 0 : 1;
    try {
      await toggleStatusProduto(item.id, novoStatus);
      showToast(
        `Item ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso.`,
        'success'
      );
      carregarItens();
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar status.', 'error');
    }
  };

  // Abre confirmação de exclusão
  const handleExcluirClick = (item: ItemData) => {
    setItemParaExcluir(item);
    setDeleteConfirmOpen(true);
  };

  // Confirma exclusão
  const handleConfirmExcluir = async () => {
    if (!itemParaExcluir) return;
    try {
      await excluirProduto(itemParaExcluir.id);
      showToast('Item excluído com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        carregarItens();
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir item.', 'error');
    }
  };

  // Categorias (hook)
  const {
    modalCategoriaOpen,
    setModalCategoriaOpen,
    catForm,
    setCatForm,
    modalCategoriaEditOpen,
    setModalCategoriaEditOpen,
    handleSalvarCategoria,
    handleOpenEditModal,
    handleAtualizarCategoria,
    handleDeletarCategoria,
  } = useCategoria({
    form,
    setForm,
    setOptions,
    showToast,
    carregarItens,
    items,
    page,
    setPage,
    setDeleteConfirmOpen,
    setItemParaExcluir,
  });

  // Marcas (hook)
  const {
    modalMarcaOpen,
    setModalMarcaOpen,
    marcaForm,
    setMarcaForm,
    modalMarcaEditOpen,
    setModalMarcaEditOpen,
    handleSalvarMarca,
    handleOpenEditMarcaModal,
    handleAtualizarMarca,
    handleDeletarMarca,
    novaMarcaNome,
    setNovaMarcaNome,
  } = useMarca({
    form,
    setForm,
    setOptions,
    showToast,
    carregarItens,
    items,
    page,
    setPage,
    setDeleteConfirmOpen,
    setItemParaExcluir,
  });

  // Fornecedores (Hooks)
  const {
    modalFornecedorOpen,
    setModalFornecedorOpen,
    fornecedorForm,
    setFornecedorForm,
    modalFornecedorEditOpen,
    setModalFornecedorEditOpen,
    handleSalvarFornecedor,
    handleOpenEditFornecedorModal,
    handleAtualizarFornecedor,
    handleDeletarFornecedor,
    novoFornecedorNome,
    setNovoFornecedorNome,
  } = useFornecedor({
    form,
    setForm,
    setOptions,
    showToast,
    carregarItens,
    items,
    page,
    setPage,
    setDeleteConfirmOpen,
    setItemParaExcluir,
  });

  // Unidades de Medida (hook)
  const {
    modalUnidadeMedidaOpen,
    setModalUnidadeMedidaOpen,
    uomForm,
    setUomForm,
    modalUnidadeMedidaEditOpen,
    setModalUnidadeMedidaEditOpen,
    handleSalvarUnidadeMedida,
    handleOpenEditUnidadeMedidaModal,
    handleAtualizarUnidadeMedida,
    handleDeletarUnidadeMedida,
  } = useUnidadeMedida({
    form,
    setForm,
    setOptions,
    showToast,
    carregarItens,
    items,
    page,
    setPage,
    setDeleteConfirmOpen,
    setItemParaExcluir,
  });

  return (
    <>
      <Head>
        <title>Produtos e Serviços | Cadastro e Controle</title>
        <meta
          name="description"
          content="Gerenciamento de produtos e serviços, listagem com filtros, paginação e suporte a múltiplos códigos de barras."
        />
      </Head>

      <div className={styles.produtosPage}>

        <div>
          <h1 id="page-title">Produtos e Serviços</h1>
          <p>Cadastro de produtos e serviços, listagem com filtros, paginação e suporte a múltiplos códigos de barras.</p>
        </div>

        <div className={styles.produtosGrid}>
          {/* Coluna Esquerda: Listagem e Filtros */}
          <div className={styles.produtosGridLeft}>
            {/* Filtros */}
            <Filtros
              state={state}
              data={options}
              setFiltros={setState}
              actions={{
                buscar: handleSearchSubmit,
                limpar: handleLimparFiltros,
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
              onEdit={handleEditarClick}
              onDelete={handleExcluirClick}
            />
          </div>

          {/* Botão para adicionar produto/serviço */}
          {/* <div>
            <button
              className={styles.buttonAdd}
              onClick={() => {
                setEditingId(null);
                resetForm();
                nomeInputRef.current?.focus();
                setMostrarFormulario(true);
              }}
            >Novo
            </button>
          </div> */}

          {/* Coluna Direita: Formulário de Cadastro/Edição */}
          <div className={styles.produtosGridRight}>
            <section className="glass-form" aria-labelledby="form-title">
              <h2 id="form-title" style={{ marginBottom: '15px' }}>
                {editingId ? 'Editar Item' : 'Cadastrar Item'}
              </h2>

              <form onSubmit={handleSubmitForm}>
                <FormularioItem
                  editarProdutoId={editingId}
                  form={form}
                  setForm={setForm}
                  options={options}
                  inputRef={nomeInputRef}
                  actions={ {
                    abrirModalCategoria: () => setModalCategoriaOpen(true),
                    abrirModalMarca: () => setModalMarcaOpen(true),
                    abrirModalFornecedor: () => setModalFornecedorOpen(true),
                    abrirModalUnidadeMedida: () => setModalUnidadeMedidaOpen(true),
                    abrirModalAjusteEstoque: async () => {
                      if (editingId) {
                        await carregarMovimentacoes(editingId);
                      }
                      setModalAjusteOpen(true);
                    },
                    editarCategoria: handleOpenEditModal,
                    editarMarca: handleOpenEditMarcaModal,
                    editarFornecedor: handleOpenEditFornecedorModal,
                    editarUnidadeMedida: handleOpenEditUnidadeMedidaModal,
                  }}
                />

                {/* Códigos de Barras */}
                <BarcodeManager
                  data={{
                    codigosBarras: formCodigosBarras,
                    novoCodigoBarras: novoCodigoBarras,
                    inputRef: barcodeInputRef,
                  }}
                  actions={{
                    adicionar: handleAddBarcode,
                    definirPrincipal: handleSetPrincipalBarcode,
                    alterar: setNovoCodigoBarras,
                    remover: handleRemoveBarcode,
                  }}
                />

                {/* Botões de Ação */}
                <div className={styles.actionButtons}>
                  <button type="submit" className={styles.primaryButton} id="submit-item-btn">
                    {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={resetForm}
                    id="cancel-item-btn"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>

        {/* Modal: Cadastro de Categoria */}
        {modalCategoriaOpen && (
          <ModalCategoria
            catForm={catForm}
            setCatForm={setCatForm}
            options={{
              abrirModalCategoria: () => setModalCategoriaOpen(false),
              salvarCategoria: handleSalvarCategoria,
            }}
          />
        )}

        {/* Modal: Edição de Categoria */}
        {modalCategoriaEditOpen && (
          <ModalCategoriaEdit
            catForm={catForm}
            setCatForm={setCatForm}
            onDelete={handleDeletarCategoria}
            options={{
              abrirModalCategoria: () => setModalCategoriaEditOpen(false),
              salvarCategoria: handleAtualizarCategoria,
            }}
          />
        )}

        {/* Modal: Cadastro de Marca */}
        {modalMarcaOpen && (
          <ModalMarca
            setModalMarcaOpen={setModalMarcaOpen}
            novaMarcaNome={novaMarcaNome}
            setNovaMarcaNome={setNovaMarcaNome}
            handleSalvarMarca={handleSalvarMarca}
          />
        )}

        {/* Modal: Edição de Marca */}
        {modalMarcaEditOpen && (
          <ModalMarcaEdit
            marcaForm={marcaForm}
            setMarcaForm={setMarcaForm}
            onDelete={handleDeletarMarca}
            options={{
              abrirModalMarca: () => setModalMarcaEditOpen(false),
              salvarMarca: handleAtualizarMarca,
            }}
          />
        )}

        {/* Modal: Cadastro de Fornecedor */}
        {modalFornecedorOpen && (
          <ModalFornecedor
            setModalFornecedorOpen={setModalFornecedorOpen}
            novoFornecedorNome={novoFornecedorNome}
            setNovoFornecedorNome={setNovoFornecedorNome}
            handleSalvarFornecedor={handleSalvarFornecedor}
          />
        )}

        {/* Modal: Edição de Fornecedor */}
        {modalFornecedorEditOpen && (
          <ModalFornecedorEdit
            fornecedorForm={fornecedorForm}
            setFornecedorForm={setFornecedorForm}
            onDelete={handleDeletarFornecedor}
            options={{
              abrirModalFornecedor: () => setModalFornecedorEditOpen(false),
              salvarFornecedor: handleAtualizarFornecedor,
            }}
          />
        )}

        {/* Modal: Cadastro de Undiade de Medida */}
        {modalUnidadeMedidaOpen && (
          <ModalUnidadeMedida
            uomForm={uomForm}
            setUomForm={setUomForm}
            options={{
              abrirModalUnidadeMedida: () => setModalUnidadeMedidaOpen(false),
              salvarUnidadeMedida: handleSalvarUnidadeMedida,
            }}
          />
        )}

        {/* Modal: Edição de Categoria */}
        {modalUnidadeMedidaEditOpen && (
          <ModalUnidadeMedidaEdit
            uomForm={uomForm}
            setUomForm={setUomForm}
            onDelete={handleDeletarUnidadeMedida}
            options={{
              abrirModalUnidadeMedida: () => setModalUnidadeMedidaEditOpen(false),
              salvarUnidadeMedida: handleAtualizarUnidadeMedida,
            }}
          />
        )}

        {/* Modal: Ajuste de Estoque */}
        {modalAjusteOpen && editingId && (
          <ModalAjusteEstoque
            open={modalAjusteOpen}
            itemName={form.nome}
            itemEstoque={parseNumber(form.estoque)}
            quantidade={ajusteQuantidade}
            descricao={ajusteDescricao}
            setQuantidade={setAjusteQuantidade}
            setDescricao={setAjusteDescricao}
            movimentacoes={movimentacoesEstoque}
            movimentacoesLoading={movimentacoesLoading}
            onSave={async () => {
              const quantidadeAjusteNumero = parseNumber(ajusteQuantidade);
              if (isNaN(quantidadeAjusteNumero)) {
                showToast('Ajuste de estoque deve ser um número válido.', 'error');
                return;
              }

              const movimento = {
                item_id: editingId,
                tipo: 'AJUSTE' as const,
                quantidade: quantidadeAjusteNumero,
                descricao: ajusteDescricao,
              };
              try {
                await registrarMovimentacaoEstoque(movimento);
                showToast('Ajuste de estoque registrado.', 'success');
                setModalAjusteOpen(false);
                setAjusteQuantidade('');
                setAjusteDescricao('');
                carregarItens();
                if (editingId) {
                  const atual = items.find((item) => item.id === editingId);
                  if (atual) {
                    setForm((prev) => ({ ...prev, estoque: String(atual.estoque) }));
                  }
                }
              } catch (error: any) {
                showToast(error.message || 'Erro ao registrar ajuste.', 'error');
              }
            }}
            onClose={() => setModalAjusteOpen(false)}
          />
        )}

        {/* Modal: Confirmação de Exclusão */}
        {deleteConfirmOpen && itemParaExcluir && (
          <ModalProdExclusao
            open={deleteConfirmOpen}
            item={itemParaExcluir}
            onConfirm={handleConfirmExcluir}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setItemParaExcluir(null);
            }}
          />
        )}

        {/* Notificações Toast */}
        <Toast
          open={toastOpen}
          message={toastMessage}
          type={toastType}
          onClose={closeToast}
          position="top-right"
        />
      </div >
    </>
  );
};

export default ProdutosPage;
