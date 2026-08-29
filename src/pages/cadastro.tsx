import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/produtos.module.css';
import Toast from '../components/Toast';
import {
    buscarProdutos,
    buscarServicos,
    registrarProduto,
    atualizarProduto,
    excluirProduto,
    buscarCategorias,
    buscarMarcas,
    buscarFornecedores,
    buscarUnidadesMedida,
    buscarMovimentacoesEstoque,
    registrarServico,
    atualizarServico,
    excluirServico,
    ItemData,
    ServicoData,
    BarcodeData,
    MovimentacaoEstoqueData,
} from '../services/produtosService';
import { parseNumber } from '../utils/number';
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
import ModalImportItens from '@/components/ModalImportItens';
import { ProdutoFormData, ProdutoOptions } from '@/components/FormularioProduto';
import { useCategoria } from '@/hooks/useCategoria';
import { useMarca } from '@/hooks/useMarca';
import { useFornecedor } from '@/hooks/useFornecedor';
import { useUnidadeMedida } from '@/hooks/useUnidadeMedida';
import ConfirmDialog from '@/components/ConfirmDialog';

const CadastroPage: React.FC = () => {

    const router = useRouter();

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
        multiplicadorUnidade: '1',
        unidadeMedidaId: 1,
        codigoInterno: '',
        referencia: '',
        duracaoMinutos: '',
        ativo: 1,
        unidadesMedida: [{ unidadeMedidaId: 1, multiplicadorUnidade: '1', principal: true }],
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

    // Modal de Importação XML
    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    // Toast notifications
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

    // Controle de alterações não salvas
    const [isDirty, setIsDirty] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const pendingNavUrl = useRef<string | null>(null);
    // Flag para ignorar o guard durante redirecionamento pós-salvo
    const skipDirtyGuard = useRef(false);

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

    // Carrega item pelo ID (vindo da query ?id=X) para pré-preencher o formulário de edição
    const carregarItemParaEdicao = async (id: number) => {
        try {
            // Tenta buscar como produto primeiro, depois como serviço
            const [produtosData, servicosData] = await Promise.all([
                buscarProdutos({ page: 1, pageSize: 10000 }),
                buscarServicos({ page: 1, pageSize: 10000 }),
            ]);

            const todosProdutos: ItemData[] = produtosData?.items || [];
            const todosServicos: ItemData[] = (servicosData?.items || []).map((servico: ServicoData) => ({
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

            const item = [...todosProdutos, ...todosServicos].find((i) => i.id === id);
            if (!item) {
                showToast('Item não encontrado para edição.', 'error');
                return;
            }

            preencherFormComItem(item);
        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar item para edição.', 'error');
        }
    };

    // Preenche o formulário com os dados de um item existente
    const preencherFormComItem = (item: ItemData) => {
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
            multiplicadorUnidade: String(item.multiplicador_unidade ?? 1),
            unidadeMedidaId: item.unidade_medida_id,
            codigoInterno: item.codigo_interno || '',
            referencia: item.referencia || '',
            duracaoMinutos: String(item.duracao_minutos ?? ''),
            ativo: item.ativo ?? 1,
            unidadesMedida: item.unidades_medida ? item.unidades_medida.map(u => ({
                unidadeMedidaId: u.unidade_medida_id,
                multiplicadorUnidade: String(u.multiplicador_unidade),
                principal: u.principal === 1,
            })) : [{ unidadeMedidaId: item.unidade_medida_id, multiplicadorUnidade: String(item.multiplicador_unidade ?? 1), principal: true }],
        });
        setFormCodigosBarras(item.codigos_barras || []);
        setNovoCodigoBarras('');
        setAjusteQuantidade('');
        setAjusteDescricao('');
        setMovimentacoesEstoque([]);
        setModalAjusteOpen(false);
        setIsDirty(false);
        nomeInputRef.current?.focus();
    };

    useEffect(() => {
        carregarAuxiliares();
    }, []);

    // Lê o ?id da query e pré-carrega o item para edição
    useEffect(() => {
        if (!router.isReady) return;
        const idParam = router.query.id;
        if (idParam) {
            const id = Number(idParam);
            if (!isNaN(id) && id > 0) {
                carregarItemParaEdicao(id);
            }
        }
    }, [router.isReady, router.query.id]);

    // Marca formulário como dirty quando o nome é preenchido (proxy de "usuário começou a editar")
    useEffect(() => {
        if (form.nome.trim() !== '') {
            setIsDirty(true);
        }
    }, [form, formCodigosBarras]);

    // Guard: aviso nativo do browser ao fechar aba ou recarregar página
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Guard: intercepta navegações do Next.js router (Links, router.push, etc.)
    const handleRouteChangeStart = useCallback((url: string) => {
        if (skipDirtyGuard.current || !isDirty) return;
        // Aborta a navegação
        router.events.emit('routeChangeError');
        pendingNavUrl.current = url;
        setDiscardDialogOpen(true);
        // Lança erro para cancelar o routeChange (padrão Next.js Pages Router)
        throw 'routeChange aborted by unsaved changes guard';
    }, [isDirty, router.events]);

    useEffect(() => {
        router.events.on('routeChangeStart', handleRouteChangeStart);
        return () => router.events.off('routeChangeStart', handleRouteChangeStart);
    }, [handleRouteChangeStart, router.events]);

    // Reseta Formulário
    const resetForm = () => {
        setIsDirty(false);
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
            multiplicadorUnidade: '1',
            unidadeMedidaId: 1,
            codigoInterno: '',
            referencia: '',
            duracaoMinutos: '',
            ativo: 1,
            unidadesMedida: [{ unidadeMedidaId: 1, multiplicadorUnidade: '1', principal: true }],
        });
        setFormCodigosBarras([]);
        setNovoCodigoBarras('');
        setAjusteQuantidade('');
        setAjusteDescricao('');
        setMovimentacoesEstoque([]);
        setModalAjusteOpen(false);
        // Remove o ?id da URL sem recarregar a página
        router.replace('/cadastro', undefined, { shallow: true });
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
        if (form.tipo === 'PRODUTO') {
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
        }

        const precoCompraRaw = parseNumber(form.precoCompra);
        const margemLucroRaw = parseNumber(form.margemLucro);
        const precoVendaRaw = parseNumber(form.precoVenda);
        const estoqueRaw = parseNumber(form.estoque);
        const multiplicadorRaw = parseNumber(form.multiplicadorUnidade);

        const precoCompraValor = Number.isFinite(precoCompraRaw) ? precoCompraRaw : 0;
        const margemLucroValor = Number.isFinite(margemLucroRaw) ? margemLucroRaw : 0;
        const precoVendaValor = Number.isFinite(precoVendaRaw) ? precoVendaRaw : 0;
        const estoqueValor = Number.isFinite(estoqueRaw) ? estoqueRaw : 0;
        const multiplicadorValor = Number.isFinite(multiplicadorRaw) && multiplicadorRaw > 0 ? multiplicadorRaw : 1;

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
            marca_id: Number(form.marcaId || 1),
            fornecedor_id: Number(form.fornecedorId || 1),
            preco_compra: precoCompraValor,
            margem_lucro: margemLucroValor,
            preco_venda: precoVendaValor,
            estoque: estoqueValor,
            multiplicador_unidade: multiplicadorValor,
            unidade_medida_id: Number(form.unidadeMedidaId || 1),
            codigo_interno: form.codigoInterno.trim() || undefined,
            referencia: form.referencia.trim(),
            duracao_minutos: Number(form.duracaoMinutos) || 0,
            ativo: form.ativo,
            codigos_barras: formCodigosBarras,
            unidades_medida: form.unidadesMedida.map(u => ({
                unidade_medida_id: Number(u.unidadeMedidaId),
                multiplicador_unidade: parseNumber(u.multiplicadorUnidade) || 1,
                principal: u.principal ? 1 : 0
            })),
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
                    showToast('Serviço atualizado com sucesso. Redirecionando...', 'success');
                } else {
                    await registrarServico(servicePayload);
                    showToast('Serviço cadastrado com sucesso. Redirecionando...', 'success');
                }
            } else {
                if (editingId) {
                    await atualizarProduto(editingId, payload);
                    showToast('Item atualizado com sucesso. Redirecionando...', 'success');
                } else {
                    await registrarProduto(payload);
                    showToast('Item cadastrado com sucesso. Redirecionando...', 'success');
                }
            }
            // Limpa dirty antes de navegar para não disparar o guard
            setIsDirty(false);
            skipDirtyGuard.current = true;
            setTimeout(() => router.push('/produtos'), 2000);
        } catch (error: any) {
            showToast(error.message || 'Erro ao salvar o item.', 'error');
        }
    };

    // Confirma exclusão
    const handleConfirmExcluir = async () => {
        if (!itemParaExcluir) return;
        try {
            if (itemParaExcluir.tipo === 'SERVICO') {
                await excluirServico(itemParaExcluir.id);
            } else {
                await excluirProduto(itemParaExcluir.id);
            }
            showToast('Item excluído com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemParaExcluir(null);
            resetForm();
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
        carregarItens: () => { },
        items: [],
        page: 1,
        setPage: () => { },
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
        carregarItens: () => { },
        items: [],
        page: 1,
        setPage: () => { },
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
        carregarItens: () => { },
        items: [],
        page: 1,
        setPage: () => { },
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
        carregarItens: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemParaExcluir,
    });

    // Função para importação de XML
    const handleImportXML = (file?: File) => {
        setImportFile(file || null);
        setModalImportOpen(true);
    };

    return (
        <>
            <Head>
                <title>Produtos e Serviços | Cadastro e Edição</title>
                <meta
                    name="description"
                    content="Cadastro/Edição de produtos e serviços, suporte a múltiplos códigos de barras."
                />
            </Head>

            <div className={styles.produtosPage}>

                <div>
                    <h1 id="page-title">Produtos e Serviços</h1>
                    <p>Cadastro/Edição de produtos e serviços, suporte a múltiplos códigos de barras.</p>
                </div>

                <div className={styles.cadastroEdicaoGrid}>
                    {/* Formulário de Cadastro/Edição */}
                    <div className={styles.produtosGridRight}>
                        <section className="glass-form" aria-labelledby="form-title">
                            <h2 id="form-title" style={{ marginBottom: '15px' }}>
                                {editingId ? 'Editar Item' : 'Cadastrar Item'}
                            </h2>

                            <form onSubmit={handleSubmitForm}>
                                <FormularioItem
                                    onImportXML={handleImportXML}
                                    editarProdutoId={editingId}
                                    form={form}
                                    setForm={setForm}
                                    options={options}
                                    inputRef={nomeInputRef}
                                    actions={{
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
                                {form.tipo === 'PRODUTO' && (
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
                                )}

                                {/* Botões de Ação */}
                                <div className={styles.actionButtons}>
                                    <button type="submit"
                                        className={styles.primaryButton}
                                        id="submit-item-btn"
                                    >
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

                {/* Modal: Cadastro de Unidade de Medida */}
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

                {/* Modal: Edição de Unidade de Medida */}
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
                        itemEstoque={parseNumber(form.estoque) * (parseNumber(form.multiplicadorUnidade) || 1)}
                        quantidade={ajusteQuantidade}
                        descricao={ajusteDescricao}
                        setQuantidade={setAjusteQuantidade}
                        setDescricao={setAjusteDescricao}
                        movimentacoes={movimentacoesEstoque}
                        movimentacoesLoading={movimentacoesLoading}
                        onSave={() => {
                            const quantidadeAjusteNumero = parseNumber(ajusteQuantidade);
                            if (isNaN(quantidadeAjusteNumero)) {
                                showToast('Ajuste de estoque deve ser um número válido.', 'error');
                                return;
                            }

                            setForm((prev) => {
                                const estoqueAtual = parseNumber(prev.estoque) || 0;
                                return { ...prev, estoque: String(estoqueAtual + quantidadeAjusteNumero) };
                            });

                            showToast('Ajuste aplicado no formulário. Lembre-se de "Salvar Alterações"!', 'info');
                            setModalAjusteOpen(false);
                            setAjusteQuantidade('');
                            setAjusteDescricao('');
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

                {/* Modal: Importação XML */}
                {modalImportOpen && (
                    <ModalImportItens
                        initialFile={importFile}
                        onClose={() => {
                            setModalImportOpen(false);
                            setImportFile(null);
                        }}
                        onImportSuccess={() => {
                            showToast('Itens importados com sucesso!', 'success');
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

                {/* Diálogo de confirmação: descartar alterações não salvas */}
                <ConfirmDialog
                    open={discardDialogOpen}
                    title="Descartar alterações?"
                    message="Você tem alterações não salvas. Se continuar, elas serão perdidas."
                    confirmText="Descartar e sair"
                    cancelText="Continuar editando"
                    onConfirm={() => {
                        setDiscardDialogOpen(false);
                        setIsDirty(false);
                        skipDirtyGuard.current = true;
                        if (pendingNavUrl.current) {
                            router.push(pendingNavUrl.current);
                            pendingNavUrl.current = null;
                        }
                    }}
                    onCancel={() => {
                        setDiscardDialogOpen(false);
                        pendingNavUrl.current = null;
                    }}
                />
            </div >
        </>
    );
};

export default CadastroPage;
