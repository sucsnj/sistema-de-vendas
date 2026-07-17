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
  criarCategoria,
  deletarCategoria,
  atualizarCategoria,
  buscarMarcas,
  criarMarca,
  deletarMarca,
  atualizarMarca,
  buscarFornecedores,
  criarFornecedor,
  deletarFornecedor,
  atualizarFornecedor,
  buscarUnidadesMedida,
  ItemData,
  BarcodeData,
} from '../services/produtosService';
import ProdutosList from '@/components/ProdutosList';
import Filtros from '@/components/Filtros';
import BarcodeManager from '@/components/BarcodeManager';
import FormularioProduto from '@/components/FormularioProduto';
import ModalCategoria from '@/components/ModalCategoria';
import ModalMarca from '@/components/ModalMarca';
import ModalProdExclusao from '@/components/ModalProdExclusao';
import ModalCategoriaEdit from '@/components/ModalCategoriaEdit';
import ModalMarcaEdit from '@/components/ModalMarcaEdit';
import ModalFornecedor from '@/components/ModalFornecedor';
import ModalFornecedorEdit from '@/components/ModalFornecedorEdit';
import { ProdutoFormData, ProdutoOptions } from '@/components/FormularioProduto';
import { CategoriaFormData } from '@/types/categoria';
import { MarcaFormData } from '@/components/ModalMarcaEdit';
import { FiltrosState } from '@/components/Filtros';
import { FornecedorFormData } from '@/components/ModalFornecedorEdit';

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
    tipo: 'PRODUTO',
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
    precoCompra: 0,
    margemLucro: 0,
    precoVenda: 0,
    estoque: 0,
    unidadeMedidaId: '',
    codigoInterno: '',
    referencia: '',
    ativo: 1,
  });
  const [formCodigosBarras, setFormCodigosBarras] = useState<BarcodeData[]>([]);
  const [novoCodigoBarras, setNovoCodigoBarras] = useState('');

  // Modais de cadastro rápido
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [catForm, setCatForm] = useState<CategoriaFormData>({ nome: '', descricao: '' });
  const [marcaForm, setMarcaForm] = useState<MarcaFormData>({ nome: '' });
  const [fornecedorForm, setFornecedorForm] = useState<FornecedorFormData>({ nome: '' });

  // Modais de Edição
  const [modalCategoriaEditOpen, setModalCategoriaEditOpen] = useState(false);
  const [modalMarcaEditOpen, setModalMarcaEditOpen] = useState(false);
  const [modalFornecedorEditOpen, setModalFornecedorEditOpen] = useState(false);

  const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
  const [novaMarcaNome, setNovaMarcaNome] = useState('');

  const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false);
  const [novoFornecedorNome, setNovoFornecedorNome] = useState('');

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
      precoCompra: 0,
      margemLucro: 0,
      precoVenda: 0,
      estoque: 0,
      unidadeMedidaId: '',
      codigoInterno: '',
      referencia: '',
      ativo: 1,
    });
    setFormCodigosBarras([]);
    setNovoCodigoBarras('');
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
    if (!form.unidadeMedidaId) {
      showToast('Selecione uma unidade de medida.', 'error');
      return;
    }

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
      preco_compra: form.precoCompra,
      margem_lucro: form.margemLucro,
      preco_venda: form.precoVenda,
      estoque: form.estoque,
      unidade_medida_id: Number(form.unidadeMedidaId),
      codigo_interno: form.codigoInterno.trim() || undefined,
      referencia: form.referencia.trim(),
      ativo: form.ativo,
      codigos_barras: formCodigosBarras,
    };

    try {
      if (editingId) {
        await atualizarProduto(editingId, payload);
        showToast('Item atualizado com sucesso.', 'success');
      } else {
        await registrarProduto(payload);
        showToast('Item cadastrado com sucesso.', 'success');
      }
      resetForm();
      carregarItens();
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar o item.', 'error');
    }
  };

  // Carrega item para edição
  const handleEditarClick = (item: ItemData) => {
    setEditingId(item.id);
    setForm({
      tipo: item.tipo,
      nome: item.nome,
      descricao: item.descricao || '',
      categoriaId: item.categoria_id,
      marcaId: item.marca_id,
      fornecedorId: item.fornecedor_id,
      precoCompra: item.preco_compra,
      margemLucro: item.margem_lucro,
      precoVenda: item.preco_venda,
      estoque: item.estoque,
      unidadeMedidaId: item.unidade_medida_id,
      codigoInterno: item.codigo_interno || '',
      referencia: item.referencia || '',
      ativo: item.ativo,
    });
    setFormCodigosBarras(item.codigos_barras || []);
    setNovoCodigoBarras('');
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

  // Categorias

  // Cadastro de Categoria Inline
  const handleSalvarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nome.trim()) {
      showToast('O nome da categoria é obrigatório.', 'error');
      return;
    }
    try {
      const response = await criarCategoria(catForm.nome.trim(), catForm.descricao.trim());
      showToast(response.message || 'Categoria criada com sucesso.', 'success');

      // Re-carrega lista de categorias e seleciona a criada
      const cats = await buscarCategorias();
      setOptions(prev => ({ ...prev, categorias: cats }));
      setForm(prev => ({ ...prev, categoriaId: response.id }));

      // Fecha modal
      setModalCategoriaOpen(false);
      setCatForm({ nome: '', descricao: '' });
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar categoria.', 'error');
    }
  };

  // Handler para abrir modal de edição de categoria
  const handleOpenEditModal = (categoria: { id: number; nome: string; descricao?: string }) => {
    setForm(prev => ({ ...prev, categoriaId: categoria.id }));
    setCatForm({ nome: categoria.nome, descricao: categoria.descricao || '' });
    setModalCategoriaEditOpen(true);
  };

  // Ediçao de categoria
  const handleAtualizarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nome.trim()) {
      showToast('O nome da categoria é obrigatório.', 'error');
      return;
    }
    try {
      const response = await atualizarCategoria(form.categoriaId, catForm.nome.trim(), catForm.descricao.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, categorias: prev.categorias.map(cat =>
          cat.id === form.categoriaId ?
            { ...cat, nome: catForm.nome.trim(), descricao: catForm.descricao.trim() } : cat
        )
      }));

      showToast(response.message || 'Categoria atualizada com sucesso.', 'success');
      setModalCategoriaEditOpen(false);
      setCatForm({ nome: '', descricao: '' });
      carregarItens();
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar categoria.', 'error');
    }
  };

  // Handle para deletar categoria
  const handleDeletarCategoria = async () => {
    try {
      await deletarCategoria(form.categoriaId);
      showToast('Marca deletada com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        categorias: prev.categorias.filter(cat => cat.id !== form.categoriaId)
      }));

      // Fecha o modal após a exclusão
      setModalCategoriaOpen(false);
      setCatForm({ nome: '', descricao: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, categoriaId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        carregarItens();
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao deletar categoria.', 'error');
    }
  };

  // Marcas
  // Handler para abrir modal de edição de marca
  const handleOpenEditMarcaModal = (marca: { id: number; nome: string }) => {
    setForm(prev => ({ ...prev, marcaId: marca.id }));
    setMarcaForm({ nome: marca.nome || '' });
    setModalMarcaEditOpen(true);
  };

  // Ediçao de marca
  const handleAtualizarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marcaForm.nome.trim()) {
      showToast('O nome da marca é obrigatório.', 'error');
      return;
    }
    try {
      const response = await atualizarMarca(form.marcaId, marcaForm.nome.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, marcas: prev.marcas.map(mar =>
          mar.id === form.marcaId ?
            { ...mar, nome: marcaForm.nome.trim() } : mar
        )
      }));

      showToast(response.message || 'Marca atualizada com sucesso.', 'success');
      setModalMarcaEditOpen(false);
      setMarcaForm({ nome: '' });
      carregarItens();
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar marca.', 'error');
    }
  };

  // Handle para deletar marca
  const handleDeletarMarca = async () => {
    try {
      await deletarMarca(form.marcaId);
      showToast('Marca deletada com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        marcas: prev.marcas.filter(mar => mar.id !== form.marcaId)
      }));

      // Fecha o modal após a exclusão
      setModalMarcaEditOpen(false);
      setMarcaForm({ nome: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, marcaId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        carregarItens();
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao deletar marca.', 'error');
    }
  };

  // Cadastro de Marca Inline
  const handleSalvarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMarcaNome.trim()) {
      showToast('O nome da marca é obrigatório.', 'error');
      return;
    }
    try {
      const response = await criarMarca(novaMarcaNome.trim());
      showToast(response.message || 'Marca criada com sucesso.', 'success');

      // Re-carrega lista de marcas e seleciona a criada
      const brands = await buscarMarcas();
      setOptions(prev => ({ ...prev, marcas: brands }));
      setForm(prev => ({ ...prev, marcaId: response.id }));

      // Fecha modal
      setModalMarcaOpen(false);
      setNovaMarcaNome('');
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar marca.', 'error');
    }
  };

  // Fornecedores

  // Cadastro de Fornecedor Inline
  const handleSalvarFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoFornecedorNome.trim()) {
      showToast('O nome do fornecedor é obrigatório.', 'error');
      return;
    }
    try {
      const response = await criarFornecedor(novoFornecedorNome.trim());
      showToast(response.message || 'Fornecedor criado com sucesso.', 'success');

      // Re-carrega lista de fornecedores e seleciona o criado
      const forns = await buscarFornecedores();
      setOptions(prev => ({ ...prev, fornecedores: forns }));
      setForm(prev => ({ ...prev, fornecedorId: response.id }));

      // Fecha modal
      setModalFornecedorOpen(false);
      setFornecedorForm({ nome: '' });
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar fornecedor.', 'error');
    }
  };

  // Handler para abrir modal de edição de fornecedor
  const handleOpenEditFornecedorModal = (fornecedor: { id: number; nome: string }) => {
    setForm(prev => ({ ...prev, fornecedorId: fornecedor.id }));
    setFornecedorForm({ nome: fornecedor.nome || '' });
    setModalFornecedorEditOpen(true);
  };

  // Ediçao de fornecedor
  const handleAtualizarFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorForm.nome.trim()) {
      showToast('O nome do fornecedor é obrigatório.', 'error');
      return;
    }
    try {
      const response = await atualizarFornecedor(form.fornecedorId, fornecedorForm.nome.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, fornecedores: prev.fornecedores.map(forn =>
          forn.id === form.fornecedorId ?
            { ...forn, nome: fornecedorForm.nome.trim() } : forn
        )
      }));

      showToast(response.message || 'Fornecedor atualizado com sucesso.', 'success');
      setModalFornecedorEditOpen(false);
      setFornecedorForm({ nome: '' });
      carregarItens();
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar fornecedor.', 'error');
    }
  };

  // Handle para deletar fornecedor
  const handleDeletarFornecedor = async () => {
    try {
      await deletarFornecedor(form.fornecedorId);
      showToast('Fornecedor deletado com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        fornecedores: prev.fornecedores.filter(forn => forn.id !== form.fornecedorId)
      }));

      // Fecha o modal após a exclusão
      setModalFornecedorOpen(false);
      setFornecedorForm({ nome: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, fornecedorId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        carregarItens();
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao deletar fornecedor.', 'error');
    }
  };

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
          <div>
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

          {/* Coluna Direita: Formulário de Cadastro/Edição */}
          <section className="glass-form" aria-labelledby="form-title">
            <h2 id="form-title" style={{ marginBottom: '15px' }}>
              {editingId ? 'Editar Item' : 'Cadastrar Item'}
            </h2>

            <form onSubmit={handleSubmitForm}>
              <FormularioProduto
                form={form}
                setForm={setForm}
                options={options}
                setOptions={setOptions}
                inputRef={nomeInputRef}
                actions={{
                  abrirModalCategoria: () => setModalCategoriaOpen(true),
                  abrirModalMarca: () => setModalMarcaOpen(true),
                  abrirModalFornecedor: () => setModalFornecedorOpen(true),
                  editarCategoria: handleOpenEditModal,
                  editarMarca: handleOpenEditMarcaModal,
                  editarFornecedor: handleOpenEditFornecedorModal,
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
