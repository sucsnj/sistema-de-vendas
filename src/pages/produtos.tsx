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
  buscarUnidadesMedida,
  ItemData,
  BarcodeData,
} from '../services/produtosService';
import ProdutosList from '@/components/ProdutosList';
import Filtros from '@/components/Filtros';
import BarcodeManager from '@/components/BarcodeManager';
import FormularioProduto from '@/components/FormularioProduto';
import ModalCategoria from '@/components/ModalCategoria';
import ModalProdMarca from '@/components/ModalProdMarca';
import ModalProdExclusao from '@/components/ModalProdExclusao';
import ModalCategoriaEdit from '@/components/ModalCategoriaEdit';
import { ProdutoFormData, ProdutoOptions, ProdutoActions } from '@/components/FormularioProduto';
import { CategoriaFormData } from '@/components/ModalCategoria';

const ProdutosPage: React.FC = () => {
  // Lista de itens e paginação
  const [items, setItems] = useState<ItemData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros de busca
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'PRODUTO' | 'SERVICO' | 'TODOS'>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<number | ''>('');
  const [filtroMarca, setFiltroMarca] = useState<number | ''>('');
  const [filtroStatus, setFiltroStatus] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('TODOS');

  // Listas auxiliares para dropdowns
  const [options, setOptions] = useState<ProdutoOptions>({
    categorias: [],
    marcas: [],
    unidadesMedida: [],
  });

  // Estado do formulário de Cadastro/Edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProdutoFormData>({
    tipo: 'PRODUTO',
    nome: '',
    descricao: '',
    categoriaId: 1,
    marcaId: '',
    unidadeMedidaId: '',
    codigoInterno: '',
    ativo: 1,
  });
  const [formCodigosBarras, setFormCodigosBarras] = useState<BarcodeData[]>([]);
  const [novoCodigoBarras, setNovoCodigoBarras] = useState('');

  // Modais de cadastro rápido
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [ catForm, setCatForm] = useState<CategoriaFormData>({ nome: '', descricao: '' });

  // Modais de Edição
  const [modalCategoriaEditOpen, setModalCategoriaEditOpen] = useState(false);

  const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
  const [novaMarcaNome, setNovaMarcaNome] = useState('');

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
      const [cats, brands, uoms] = await Promise.all([
        buscarCategorias(),
        buscarMarcas(),
        buscarUnidadesMedida(),
      ]);
      setOptions({
        categorias: cats,
        marcas: brands,
        unidadesMedida: uoms,
      });
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar dados auxiliares (categorias, marcas, etc.).', 'error');
    }
  };

  // Carrega lista de produtos
  const carregarItens = async () => {
    setLoading(true);
    try {
      const data = await buscarProdutos({
        search: searchQuery || undefined,
        tipo: filtroTipo,
        categoria_id: filtroCategoria || undefined,
        marca_id: filtroMarca || undefined,
        ativo: filtroStatus,
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
  }, [page, searchQuery, filtroTipo, filtroCategoria, filtroMarca, filtroStatus]);

  // Handler de Busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const handleLimparFiltros = () => {
    setSearch('');
    setSearchQuery('');
    setFiltroTipo('TODOS');
    setFiltroCategoria('');
    setFiltroMarca('');
    setFiltroStatus('TODOS');
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
      marcaId: '',
      unidadeMedidaId: '',
      codigoInterno: '',
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
      unidade_medida_id: Number(form.unidadeMedidaId),
      codigo_interno: form.codigoInterno.trim() || undefined,
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
      unidadeMedidaId: item.unidade_medida_id,
      codigoInterno: item.codigo_interno || '',
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

  // Handler para abrir modal de edição
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
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar categoria.', 'error');
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
              search={search}
              setSearch={setSearch}
              filtroTipo={filtroTipo}
              setFiltroTipo={setFiltroTipo}
              filtroCategoria={filtroCategoria}
              setFiltroCategoria={setFiltroCategoria}
              filtroMarca={filtroMarca}
              setFiltroMarca={setFiltroMarca}
              filtroStatus={filtroStatus}
              setFiltroStatus={setFiltroStatus}
              categorias={options.categorias}
              marcas={options.marcas}
              handleSearchSubmit={handleSearchSubmit}
              handleLimparFiltros={handleLimparFiltros}
              onPageChange={setPage}
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
                  editarCategoria: handleOpenEditModal,
                }}
              />

              {/* Códigos de Barras */}
              <BarcodeManager
                formCodigosBarras={formCodigosBarras}
                novoCodigoBarras={novoCodigoBarras}
                setNovoCodigoBarras={setNovoCodigoBarras}
                barcodeInputRef={barcodeInputRef}
                handleAddBarcode={handleAddBarcode}
                handleSetPrincipalBarcode={handleSetPrincipalBarcode}
                handleRemoveBarcode={handleRemoveBarcode}
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
        {/* {modalCategoriaEditOpen && (
          <ModalCategoriaEdit
            setModalCategoriaEditOpen={setModalCategoriaEditOpen}
            novaCatNome={novaCatNome}
            setNovaCatNome={setNovaCatNome}
            novaCatDesc={novaCatDesc}
            setNovaCatDesc={setNovaCatDesc}
            handleAtualizarCategoria={handleAtualizarCategoria}
          />
        )} */}

        {/* Modal: Cadastro de Marca */}
        {modalMarcaOpen && (
          <ModalProdMarca
            setModalMarcaOpen={setModalMarcaOpen}
            novaMarcaNome={novaMarcaNome}
            setNovaMarcaNome={setNovaMarcaNome}
            handleSalvarMarca={handleSalvarMarca}
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
