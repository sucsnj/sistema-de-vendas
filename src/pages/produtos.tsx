import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/produtos.module.css';
import Toast from '../components/Toast';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import {
  buscarProdutos,
  registrarProduto,
  atualizarProduto,
  excluirProduto,
  toggleStatusProduto,
  buscarCategorias,
  criarCategoria,
  buscarMarcas,
  criarMarca,
  buscarUnidadesMedida,
  ItemData,
  CategoriaData,
  MarcaData,
  UnidadeMedidaData,
  BarcodeData,
} from '../services/produtosService';
import ProdutosList from '@/components/ProdutosList';
import Filtros from '@/components/Filtros';
import BarcodeManager from '@/components/BarcodeManager';

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
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [marcas, setMarcas] = useState<MarcaData[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadeMedidaData[]>([]);

  // Estado do formulário de Cadastro/Edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTipo, setFormTipo] = useState<'PRODUTO' | 'SERVICO'>('PRODUTO');
  const [formNome, setFormNome] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formCategoriaId, setFormCategoriaId] = useState<number | ''>('');
  const [formMarcaId, setFormMarcaId] = useState<number | ''>('');
  const [formUnidadeMedidaId, setFormUnidadeMedidaId] = useState<number | ''>('');
  const [formCodigoInterno, setFormCodigoInterno] = useState('');
  const [formAtivo, setFormAtivo] = useState(1);
  const [formCodigosBarras, setFormCodigosBarras] = useState<BarcodeData[]>([]);
  const [novoCodigoBarras, setNovoCodigoBarras] = useState('');

  // Modais de cadastro rápido
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatDesc, setNovaCatDesc] = useState('');

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
      setCategorias(cats);
      setMarcas(brands);
      setUnidadesMedida(uoms);
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
    setFormTipo('PRODUTO');
    setFormNome('');
    setFormDescricao('');
    setFormCategoriaId('');
    setFormMarcaId('');
    setFormUnidadeMedidaId('');
    setFormCodigoInterno('');
    setFormAtivo(1);
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

    if (!formNome.trim()) {
      showToast('O nome do item é obrigatório.', 'error');
      nomeInputRef.current?.focus();
      return;
    }
    if (!formCategoriaId) {
      showToast('Selecione uma categoria.', 'error');
      return;
    }
    if (!formMarcaId) {
      showToast('Selecione uma marca.', 'error');
      return;
    }
    if (!formUnidadeMedidaId) {
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
      tipo: formTipo,
      nome: formNome.trim(),
      descricao: formDescricao.trim() || undefined,
      categoria_id: Number(formCategoriaId),
      marca_id: Number(formMarcaId),
      unidade_medida_id: Number(formUnidadeMedidaId),
      codigo_interno: formCodigoInterno.trim() || undefined,
      ativo: formAtivo,
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
    setFormTipo(item.tipo);
    setFormNome(item.nome);
    setFormDescricao(item.descricao || '');
    setFormCategoriaId(item.categoria_id);
    setFormMarcaId(item.marca_id);
    setFormUnidadeMedidaId(item.unidade_medida_id);
    setFormCodigoInterno(item.codigo_interno || '');
    setFormAtivo(item.ativo);
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
    if (!novaCatNome.trim()) {
      showToast('O nome da categoria é obrigatório.', 'error');
      return;
    }
    try {
      const response = await criarCategoria(novaCatNome.trim(), novaCatDesc.trim());
      showToast(response.message || 'Categoria criada com sucesso.', 'success');

      // Re-carrega lista de categorias e seleciona a criada
      const cats = await buscarCategorias();
      setCategorias(cats);
      setFormCategoriaId(response.id);

      // Fecha modal
      setModalCategoriaOpen(false);
      setNovaCatNome('');
      setNovaCatDesc('');
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar categoria.', 'error');
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
      setMarcas(brands);
      setFormMarcaId(response.id);

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
              categorias={categorias}
              marcas={marcas}
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
              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-tipo">
                    Tipo:
                  </label>
                  <select
                    id="form-tipo"
                    className={styles.selectField}
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                  >
                    <option value="PRODUTO">Produto</option>
                    <option value="SERVICO">Serviço</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-nome">
                    Nome:*
                  </label>
                  <input
                    id="form-nome"
                    ref={nomeInputRef}
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome do item"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-descricao">
                    Descrição:
                  </label>
                  <textarea
                    id="form-descricao"
                    className={styles.textareaField}
                    placeholder="Detalhes ou especificações"
                    rows={3}
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-categoria">
                    Categoria:*
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="form-categoria"
                      className={styles.selectField}
                      value={formCategoriaId}
                      onChange={(e) =>
                        setFormCategoriaId(e.target.value ? Number(e.target.value) : '')
                      }
                      required>
                      <option value="">Selecione...</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => setModalCategoriaOpen(true)}
                      title="Adicionar Categoria"
                      id="add-categoria-btn"
                    >
                      <AddIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-marca">
                    Marca:*
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="form-marca"
                      className={styles.selectField}
                      value={formMarcaId}
                      onChange={(e) =>
                        setFormMarcaId(e.target.value ? Number(e.target.value) : '')
                      }
                      required>
                      <option value="">Selecione...</option>
                      {marcas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => setModalMarcaOpen(true)}
                      title="Adicionar Marca"
                      id="add-marca-btn"
                    >
                      <AddIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-unidade">
                    Unidade de Medida:*
                  </label>
                  <select
                    id="form-unidade"
                    className={styles.selectField}
                    value={formUnidadeMedidaId}
                    onChange={(e) =>
                      setFormUnidadeMedidaId(e.target.value ? Number(e.target.value) : '')
                    }
                    required
                  >
                    <option value="">Selecione...</option>
                    {unidadesMedida.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.sigla} - {u.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-cod-interno">
                    Código Interno:
                  </label>
                  <input
                    id="form-cod-interno"
                    type="text"
                    className={styles.inputField}
                    placeholder="Ex: PROD-001"
                    value={formCodigoInterno}
                    onChange={(e) => setFormCodigoInterno(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="form-ativo">
                    Ativo:
                  </label>
                  <select
                    id="form-ativo"
                    className={styles.selectField}
                    value={formAtivo}
                    onChange={(e) => setFormAtivo(Number(e.target.value))}
                  >
                    <option value={1}>Sim</option>
                    <option value={0}>Não</option>
                  </select>
                </div>
              </div>

              {/* Códigos de Barras */}
              <BarcodeManager
                formCodigosBarras={formCodigosBarras}
                setFormCodigosBarras={setFormCodigosBarras}
                novoCodigoBarras={novoCodigoBarras}
                setNovoCodigoBarras={setNovoCodigoBarras}
                barcodeInputRef={barcodeInputRef}
                handleAddBarcode={handleAddBarcode}
                handleSetPrincipalBarcode={handleSetPrincipalBarcode}
                handleRemoveBarcode={handleRemoveBarcode}
                showToast={showToast}
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
          <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-cat-title">
            <div className={styles.modalContent}>
              <h3 id="modal-cat-title" className={styles.modalTitle}>Adicionar Categoria</h3>
              <form onSubmit={handleSalvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="new-cat-nome">
                    Nome:*
                  </label>
                  <input
                    id="new-cat-nome"
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome da categoria"
                    value={novaCatNome}
                    onChange={(e) => setNovaCatNome(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="new-cat-desc">
                    Descrição:
                  </label>
                  <input
                    id="new-cat-desc"
                    type="text"
                    className={styles.inputField}
                    placeholder="Descrição opcional"
                    value={novaCatDesc}
                    onChange={(e) => setNovaCatDesc(e.target.value)}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.primaryButton} id="save-new-cat-btn">
                    Salvar
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setModalCategoriaOpen(false);
                      setNovaCatNome('');
                      setNovaCatDesc('');
                    }}
                    id="cancel-new-cat-btn"
                  >
                    Fechar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cadastro de Marca */}
        {modalMarcaOpen && (
          <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-marca-title">
            <div className={styles.modalContent}>
              <h3 id="modal-marca-title" className={styles.modalTitle}>Adicionar Marca</h3>
              <form onSubmit={handleSalvarMarca} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="new-marca-nome">
                    Nome:*
                  </label>
                  <input
                    id="new-marca-nome"
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome da marca"
                    value={novaMarcaNome}
                    onChange={(e) => setNovaMarcaNome(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.primaryButton} id="save-new-marca-btn">
                    Salvar
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setModalMarcaOpen(false);
                      setNovaMarcaNome('');
                    }}
                    id="cancel-new-marca-btn"
                  >
                    Fechar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmação de Exclusão */}
        {deleteConfirmOpen && itemParaExcluir && (
          <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-delete-title">
            <div className={styles.modalContent}>
              <h3 id="modal-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>
                Tem certeza de que deseja excluir o item{' '}
                <strong>{itemParaExcluir.nome}</strong>?
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                Esta ação é irreversível e excluirá todos os códigos de barras associados a ele.
              </p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleConfirmExcluir}
                  style={{ backgroundColor: 'var(--danger)' }}
                  id="confirm-delete-action-btn"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setItemParaExcluir(null);
                  }}
                  id="cancel-delete-action-btn"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
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
