import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/produtos.module.css';
import { useToast } from '../hooks/useToast';
import {
    fetchProducts,
    fetchServices,
    registerProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchBrands,
    fetchSuppliers,
    fetchUnitsOfMeasure,
    fetchStockMovements,
    registerService,
    updateService,
    deleteService,
    ItemData,
    ServiceData,
    BarcodeData,
    StockMovementData,
} from '../services/produtosService';
import { parseNumber } from '../utils/number';
import { validateNumber, validateRequired } from '../utils/validation';
import BarcodeManager from '@/components/common/BarcodeManager';
import ItemForm from '@/components/products/ItemForm';
import ModalCategoria from '@/components/catalog/CategoryModal';
import BrandModal from '@/components/catalog/BrandModal';
import ProductDeleteModal from '@/components/products/ProductDeleteModal';
import CategoryEditModal from '@/components/catalog/CategoryEditModal';
import BrandEditModal from '@/components/catalog/BrandEditModal';
import SupplierModal from '@/components/catalog/SupplierModal';
import SupplierEditModal from '@/components/catalog/SupplierEditModal';
import ModalUnidadeMedida from '@/components/catalog/UomModal';
import UnitOfMeasureEditModal from '@/components/catalog/UomEditModal';
import StockAdjustModal from '@/components/products/StockAdjustModal';
import ImportItemsModal from '@/components/import/ImportItemsModal';
import { ProductFormData, ProductOptions } from '@/components/products/ProductForm';
import { useCategory } from '@/hooks/useCategory';
import { useBrand } from '@/hooks/useBrand';
import { useSupplier } from '@/hooks/useSupplier';
import { useUnitOfMeasure } from '@/hooks/useUnitOfMeasure';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const RegistrationPage: React.FC = () => {

    const router = useRouter();

    // Listas auxiliares para dropdowns
    const [options, setOptions] = useState<ProductOptions>({
        categories: [],
        brands: [],
        suppliers: [],
        unitsOfMeasure: [],
    });

    // Estado do formulário de Cadastro/Edição
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ProductFormData>({
        type: 'PRODUTO',
        name: '',
        description: '',
        categoryId: 1,
        brandId: 1,
        supplierId: 1,
        purchasePrice: '',
        profitMargin: '',
        salePrice: '',
        stock: '',
        unitMultiplier: '1',
        unitOfMeasureId: 1,
        internalCode: '',
        reference: '',
        durationMinutes: '',
        active: 1,
        unitsOfMeasure: [{ unitOfMeasureId: 1, unitMultiplier: '1', isPrincipal: true }],
    });
    const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
    const [ajusteQuantidade, setAjusteQuantidade] = useState('');
    const [ajusteDescricao, setAjusteDescricao] = useState('');
    const [movimentacoesEstoque, setMovimentacoesEstoque] = useState<StockMovementData[]>([]);
    const [movimentacoesLoading, setMovimentacoesLoading] = useState(false);
    const [formCodigosBarras, setFormCodigosBarras] = useState<BarcodeData[]>([]);
    const [novoCodigoBarras, setNovoCodigoBarras] = useState('');

    // Modal de confirmação de exclusão
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ItemData | null>(null);

    // Modal de Importação XML
    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    // Notificações (toast) do store global
    const { showToast } = useToast();

    // Controle de alterações não salvas
    const [isDirty, setIsDirty] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const pendingNavUrl = useRef<string | null>(null);
    // Flag para ignorar o guard durante redirecionamento pós-salvo
    const skipDirtyGuard = useRef(false);

    // Deriva o estado "dirty": marca o formulário como editado quando o nome sai de vazio
    const [nomeEraVazio, setNomeEraVazio] = useState(true);
    const nomePreenchido = form.name.trim() !== '';
    if (nomePreenchido !== nomeEraVazio) {
        setNomeEraVazio(nomePreenchido);
        if (nomePreenchido) {
            setIsDirty(true);
        }
    }

    // Refs para focar campos
    const nomeInputRef = useRef<HTMLInputElement | null>(null);
    const barcodeInputRef = useRef<HTMLInputElement | null>(null);

    // Carrega opções auxiliares
    const loadAuxiliaryData = useCallback(async () => {
        try {
            const [cats, brands, forns, uoms] = await Promise.all([
                fetchCategories(),
                fetchBrands(),
                fetchSuppliers(),
                fetchUnitsOfMeasure(),
            ]);
            setOptions({
        categories: cats,
        brands: brands,
        suppliers: forns,
                unitsOfMeasure: uoms,
            });
        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar dados auxiliares (categorias, marcas, fornecedores, unidades de medida).', 'error');
        }
    }, [showToast]);

    // Preenche o formulário com os dados de um item existente
    const preencherFormComItem = useCallback((item: ItemData) => {
        setEditingId(item.id);
        setForm({
        type: item.tipo,
        name: item.nome,
        description: item.descricao || '',
            categoryId: item.categoria_id,
            brandId: item.marca_id,
            supplierId: item.fornecedor_id,
            purchasePrice: String(item.preco_compra),
            profitMargin: String(item.margem_lucro),
            salePrice: String(item.preco_venda),
        stock: String(item.estoque),
            unitMultiplier: String(item.multiplicador_unidade ?? 1),
            unitOfMeasureId: item.unidade_medida_id,
            internalCode: item.codigo_interno || '',
        reference: item.referencia || '',
            durationMinutes: String(item.duracao_minutos ?? ''),
        active: item.ativo ?? 1,
            unitsOfMeasure: item.unidades_medida ? item.unidades_medida.map(u => ({
                unitOfMeasureId: u.unidade_medida_id,
                unitMultiplier: String(u.multiplicador_unidade),
        isPrincipal: u.principal === 1,
            })) : [{ unitOfMeasureId: item.unidade_medida_id, unitMultiplier: String(item.multiplicador_unidade ?? 1), isPrincipal: true }],
        });
        setFormCodigosBarras(item.codigos_barras || []);
        setNovoCodigoBarras('');
        setAjusteQuantidade('');
        setAjusteDescricao('');
        setMovimentacoesEstoque([]);
        setModalAjusteOpen(false);
        setIsDirty(false);
        nomeInputRef.current?.focus();
    }, []);

    // Carrega item pelo ID (vindo da query ?id=X) para pré-preencher o formulário de edição
    const loadItemForEditing = useCallback(async (id: number) => {
        try {
            // Tenta buscar como produto primeiro, depois como serviço
            const [produtosData, servicosData] = await Promise.all([
                fetchProducts({ page: 1, pageSize: 10000 }),
                fetchServices({ page: 1, pageSize: 10000 }),
            ]);

            const todosProdutos: ItemData[] = produtosData?.items || [];
            const todosServicos: ItemData[] = (servicosData?.items || []).map((servico: ServiceData) => ({
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
    }, [showToast, preencherFormComItem]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadAuxiliaryData();
        }, 0);
        return () => clearTimeout(timer);
    }, [loadAuxiliaryData]);

    const queryProcessada = useRef(false);

    // Lê a query: pré-carrega para edição (?id=X) ou preenche para cadastro rápido (?novoImport=1...)
    useEffect(() => {
        if (!router.isReady || queryProcessada.current) return;
        const { id, novoImport, nome, purchasePrice, estoque, unidade, ean, internalCode } = router.query;

        if (id) {
            const numId = Number(id);
            if (!isNaN(numId) && numId > 0) {
                queryProcessada.current = true;
                const timer = setTimeout(() => {
                    void loadItemForEditing(numId);
                }, 0);
                return () => clearTimeout(timer);
            }
        } else if (novoImport || nome) {
            queryProcessada.current = true;
            const timer = setTimeout(() => {
                const nomeStr = typeof nome === 'string' ? nome : '';
                const precoCompraStr = typeof purchasePrice === 'string' ? purchasePrice : '';
                const estoqueStr = typeof estoque === 'string' ? estoque : '';
                const unidadeStr = typeof unidade === 'string' ? unidade.trim().toUpperCase() : '';
                const eanStr = typeof ean === 'string' ? ean.trim() : '';
                const codigoInternoStr = typeof internalCode === 'string' ? internalCode.trim() : '';

                let uomId = 1;
                if (unidadeStr && options.unitsOfMeasure.length > 0) {
                    const encontrada = options.unitsOfMeasure.find(
                        u => u.sigla.toUpperCase() === unidadeStr || u.sigla.toUpperCase().includes(unidadeStr)
                    );
                    if (encontrada) uomId = encontrada.id;
                }

                const precoCompraNum = parseNumber(precoCompraStr) || 0;
                const margemPadrao = 50;
                const precoVendaCalculado = precoCompraNum > 0 ? (precoCompraNum * (1 + margemPadrao / 100)).toFixed(2) : '';

                setEditingId(null);
                setForm({
        type: 'PRODUTO',
        name: nomeStr,
        description: 'Importado via XML da NF-e',
                    categoryId: 1,
                    brandId: 1,
                    supplierId: 1,
                    purchasePrice: precoCompraStr,
                    profitMargin: precoCompraNum > 0 ? String(margemPadrao) : '',
                    salePrice: precoVendaCalculado,
        stock: estoqueStr,
                    unitMultiplier: '1',
                    unitOfMeasureId: uomId,
                    internalCode: codigoInternoStr,
        reference: '',
        durationMinutes: '',
        active: 1,
                    unitsOfMeasure: [{ unitOfMeasureId: uomId, unitMultiplier: '1', isPrincipal: true }],
                });

                if (eanStr) {
                    setFormCodigosBarras([{ codigo_barras: eanStr, principal: 1 }]);
                } else {
                    setFormCodigosBarras([]);
                }

                showToast('Dados do item preenchidos para cadastro. Complete as informações e salve.', 'info');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [router.isReady, router.query, options.unitsOfMeasure, loadItemForEditing, showToast]);

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
        queryProcessada.current = false;
        setIsDirty(false);
        setEditingId(null);
        setForm({
        type: 'PRODUTO',
        name: '',
        description: '',
            categoryId: 1,
            brandId: 1,
            supplierId: 1,
            purchasePrice: '',
            profitMargin: '',
            salePrice: '',
        stock: '',
            unitMultiplier: '1',
            unitOfMeasureId: 1,
            internalCode: '',
        reference: '',
        durationMinutes: '',
        active: 1,
            unitsOfMeasure: [{ unitOfMeasureId: 1, unitMultiplier: '1', isPrincipal: true }],
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

    const loadMovements = async (itemId: number) => {
        setMovimentacoesLoading(true);
        try {
            const data = await fetchStockMovements(itemId);
            setMovimentacoesEstoque(data.slice(0, 10));
        } catch (error) {
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
        const barcodeCheck = validateRequired(code, 'Código de barras');
        if (!barcodeCheck.ok) {
            showToast(barcodeCheck.message ?? 'Código de barras é obrigatório.', 'error');
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

        const nomeCheck = validateRequired(form.name, 'O nome do item');
        if (!nomeCheck.ok) {
            showToast(nomeCheck.message ?? 'O nome do item é obrigatório.', 'error');
            nomeInputRef.current?.focus();
            return;
        }
        const categoriaCheck = validateRequired(form.categoryId, 'Categoria');
        if (!categoriaCheck.ok) {
            showToast(categoriaCheck.message ?? 'Selecione uma categoria.', 'error');
            return;
        }
        if (form.type === 'PRODUTO') {
            const marcaCheck = validateRequired(form.brandId, 'Marca');
            if (!marcaCheck.ok) {
                showToast(marcaCheck.message ?? 'Selecione uma marca.', 'error');
                return;
            }
            const fornecedorCheck = validateRequired(form.supplierId, 'Fornecedor');
            if (!fornecedorCheck.ok) {
                showToast(fornecedorCheck.message ?? 'Selecione um fornecedor.', 'error');
                return;
            }
            const unidadeCheck = validateRequired(form.unitOfMeasureId, 'Unidade de medida');
            if (!unidadeCheck.ok) {
                showToast(unidadeCheck.message ?? 'Selecione uma unidade de medida.', 'error');
                return;
            }
        }

        const precoCompraRaw = parseNumber(form.purchasePrice);
        const margemLucroRaw = parseNumber(form.profitMargin);
        const precoVendaRaw = parseNumber(form.salePrice);
        const estoqueRaw = parseNumber(form.stock);
        const multiplicadorRaw = parseNumber(form.unitMultiplier);

        const precoCompraValor = Number.isFinite(precoCompraRaw) ? precoCompraRaw : 0;
        const margemLucroValor = Number.isFinite(margemLucroRaw) ? margemLucroRaw : 0;
        const precoVendaValor = Number.isFinite(precoVendaRaw) ? precoVendaRaw : 0;
        const estoqueValor = Number.isFinite(estoqueRaw) ? estoqueRaw : 0;
        const multiplicadorValor = Number.isFinite(multiplicadorRaw) && multiplicadorRaw > 0 ? multiplicadorRaw : 1;

        // Validação de código principal nos códigos de barras
        let codigosBarrasFinal = formCodigosBarras;
        if (codigosBarrasFinal.length > 0) {
            const temPrincipal = codigosBarrasFinal.some((c) => c.principal === 1);
            if (!temPrincipal) {
                // Força o primeiro como principal se nenhum foi marcado
                codigosBarrasFinal = codigosBarrasFinal.map((c, index) =>
                    index === 0 ? { ...c, principal: 1 } : c
                );
                setFormCodigosBarras(codigosBarrasFinal);
            }
        }

        const payload = {
            tipo: form.type,
            nome: form.name.trim(),
            descricao: form.description.trim() || undefined,
            categoria_id: Number(form.categoryId),
            marca_id: Number(form.brandId || 1),
            fornecedor_id: Number(form.supplierId || 1),
            preco_compra: precoCompraValor,
            margem_lucro: margemLucroValor,
            preco_venda: precoVendaValor,
            estoque: estoqueValor,
            multiplicador_unidade: multiplicadorValor,
            unidade_medida_id: Number(form.unitOfMeasureId || 1),
            codigo_interno: form.internalCode.trim() || undefined,
            referencia: form.reference.trim(),
            duracao_minutos: Number(form.durationMinutes) || 0,
            ativo: form.active,
            codigos_barras: codigosBarrasFinal,
            unidades_medida: form.unitsOfMeasure.map(u => ({
                unidade_medida_id: Number(u.unitOfMeasureId),
                multiplicador_unidade: parseNumber(u.unitMultiplier) || 1,
                principal: u.isPrincipal ? 1 : 0
            })),
        };

        const servicePayload = {
            nome: form.name.trim(),
            descricao: form.description.trim() || undefined,
            categoria_id: Number(form.categoryId),
            preco_venda: precoVendaValor,
            codigo_interno: form.internalCode.trim() || undefined,
            referencia: form.reference.trim(),
            duracao_minutos: Number(form.durationMinutes) || 0,
        };

        try {
            if (form.type === 'SERVICO') {
                if (editingId) {
                    await updateService(editingId, servicePayload);
                    showToast('Serviço atualizado com sucesso. Redirecionando...', 'success');
                } else {
                    await registerService(servicePayload);
                    showToast('Serviço cadastrado com sucesso. Redirecionando...', 'success');
                }
            } else {
                if (editingId) {
                    await updateProduct(editingId, payload);
                    showToast('Item atualizado com sucesso. Redirecionando...', 'success');
                } else {
                    await registerProduct(payload);
                    showToast('Item cadastrado com sucesso. Redirecionando...', 'success');
                }
            }
            // Limpa dirty antes de navegar para não disparar o guard
            setIsDirty(false);
            skipDirtyGuard.current = true;
            setTimeout(() => router.push('/produtos'), 2000);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Erro ao salvar o item.', 'error');
        }
    };

    // Confirma exclusão
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.tipo === 'SERVICO') {
                await deleteService(itemToDelete.id);
            } else {
                await deleteProduct(itemToDelete.id);
            }
            showToast('Item excluído com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            resetForm();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Erro ao excluir item.', 'error');
        }
    };

    // Categorias (hook)
    const {
        categoryModalOpen,
        setCategoryModalOpen,
        categoryForm,
        setCategoryForm,
        categoryEditModalOpen,
        setCategoryEditModalOpen,
        handleSaveCategory,
        handleOpenEditModal,
        handleUpdateCategory,
        handleDeleteCategory,
    } = useCategory({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Marcas (hook)
    const {
        brandModalOpen,
        setBrandModalOpen,
        brandForm,
        setBrandForm,
        brandEditModalOpen,
        setBrandEditModalOpen,
        handleSaveBrand,
        handleOpenEditBrandModal,
        handleUpdateBrand,
        handleDeleteBrand,
        newBrandName,
        setNewBrandName,
    } = useBrand({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Fornecedores (Hooks)
    const {
        supplierModalOpen,
        setSupplierModalOpen,
        supplierForm,
        setSupplierForm,
        supplierEditModalOpen,
        setSupplierEditModalOpen,
        handleSaveSupplier,
        handleOpenEditSupplierModal,
        handleUpdateSupplier,
        handleDeleteSupplier,
        newSupplierName,
        setNewSupplierName,
    } = useSupplier({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Unidades de Medida (hook)
    const {
        unitOfMeasureModalOpen,
        setUnitOfMeasureModalOpen,
        uomForm,
        setUomForm,
        unitOfMeasureEditModalOpen,
        setUnitOfMeasureEditModalOpen,
        handleSaveUnitOfMeasure,
        handleOpenEditUnitOfMeasureModal,
        handleUpdateUnitOfMeasure,
        handleDeleteUnitOfMeasure,
    } = useUnitOfMeasure({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
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
                                <ItemForm
                                    onImportXML={handleImportXML}
                                    editingProductId={editingId}
                                    form={form}
                                    setForm={setForm}
                                    options={options}
                                    inputRef={nomeInputRef}
                                    actions={{
                                        openCategoryModal: () => setCategoryModalOpen(true),
                                        openBrandModal: () => setBrandModalOpen(true),
                                        openSupplierModal: () => setSupplierModalOpen(true),
                                        openUnitOfMeasureModal: () => setUnitOfMeasureModalOpen(true),
                                        openStockAdjustModal: async () => {
                                            if (editingId) {
                                                await loadMovements(editingId);
                                            }
                                            setModalAjusteOpen(true);
                                        },
                                        editCategory: handleOpenEditModal,
                                        editBrand: handleOpenEditBrandModal,
                                        editSupplier: handleOpenEditSupplierModal,
                                        editUnitOfMeasure: handleOpenEditUnitOfMeasureModal,
                                    }}
                                />

                                {/* Códigos de Barras */}
                                {form.type === 'PRODUTO' && (
                                    <BarcodeManager
                                        data={{
                                            barcodes: formCodigosBarras,
                                            newBarcode: novoCodigoBarras,
                                        }}
                                        inputRef={barcodeInputRef}
                                        actions={{
                                            add: handleAddBarcode,
                                            setAsPrincipal: handleSetPrincipalBarcode,
                                            change: setNovoCodigoBarras,
                                            remove: handleRemoveBarcode,
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
                {categoryModalOpen && (
                    <ModalCategoria
                        categoryForm={categoryForm}
                        setCategoryForm={setCategoryForm}
                        options={{
                            openCategoryModal: () => setCategoryModalOpen(false),
                            saveCategory: handleSaveCategory,
                        }}
                    />
                )}

                {/* Modal: Edição de Categoria */}
                {categoryEditModalOpen && (
                    <CategoryEditModal
                        categoryForm={categoryForm}
                        setCategoryForm={setCategoryForm}
                        onDelete={handleDeleteCategory}
                        options={{
                            openCategoryModal: () => setCategoryEditModalOpen(false),
                            saveCategory: handleUpdateCategory,
                        }}
                    />
                )}

                {/* Modal: Cadastro de Marca */}
                {brandModalOpen && (
                    <BrandModal
                        setBrandModalOpen={setBrandModalOpen}
                        newBrandName={newBrandName}
                        setNewBrandName={setNewBrandName}
                        handleSaveBrand={handleSaveBrand}
                    />
                )}

                {/* Modal: Edição de Marca */}
                {brandEditModalOpen && (
                    <BrandEditModal
                        brandForm={brandForm}
                        setBrandForm={setBrandForm}
                        onDelete={handleDeleteBrand}
                        options={{
                            openBrandModal: () => setBrandEditModalOpen(false),
                            saveBrand: handleUpdateBrand,
                        }}
                    />
                )}

                {/* Modal: Cadastro de Fornecedor */}
                {supplierModalOpen && (
                    <SupplierModal
                        setSupplierModalOpen={setSupplierModalOpen}
                        newSupplierName={newSupplierName}
                        setNewSupplierName={setNewSupplierName}
                        handleSaveSupplier={handleSaveSupplier}
                    />
                )}

                {/* Modal: Edição de Fornecedor */}
                {supplierEditModalOpen && (
                    <SupplierEditModal
                        supplierForm={supplierForm}
                        setSupplierForm={setSupplierForm}
                        onDelete={handleDeleteSupplier}
                        options={{
                            openSupplierModal: () => setSupplierEditModalOpen(false),
                            saveSupplier: handleUpdateSupplier,
                        }}
                    />
                )}

                {/* Modal: Cadastro de Unidade de Medida */}
                {unitOfMeasureModalOpen && (
                    <ModalUnidadeMedida
                        uomForm={uomForm}
                        setUomForm={setUomForm}
                        options={{
                            openUnitOfMeasureModal: () => setUnitOfMeasureModalOpen(false),
                            saveUnitOfMeasure: handleSaveUnitOfMeasure,
                        }}
                    />
                )}

                {/* Modal: Edição de Unidade de Medida */}
                {unitOfMeasureEditModalOpen && (
                    <UnitOfMeasureEditModal
                        uomForm={uomForm}
                        setUomForm={setUomForm}
                        onDelete={handleDeleteUnitOfMeasure}
                        options={{
                            openUnitOfMeasureModal: () => setUnitOfMeasureEditModalOpen(false),
                            saveUnitOfMeasure: handleUpdateUnitOfMeasure,
                        }}
                    />
                )}

                {/* Modal: Ajuste de Estoque */}
                {modalAjusteOpen && editingId && (
                    <StockAdjustModal
                        open={modalAjusteOpen}
                        itemName={form.name}
                        itemStock={parseNumber(form.stock) * (parseNumber(form.unitMultiplier) || 1)}
                        quantity={ajusteQuantidade}
                        description={ajusteDescricao}
                        setQuantity={setAjusteQuantidade}
                        setDescription={setAjusteDescricao}
                        movements={movimentacoesEstoque}
                        movementsLoading={movimentacoesLoading}
                        onSave={() => {
                            const quantidadeCheck = validateNumber(ajusteQuantidade);
                            if (!quantidadeCheck.ok) {
                                showToast(quantidadeCheck.message ?? 'Número inválido.', 'error');
                                return;
                            }
                            const quantidadeAjusteNumero = parseNumber(ajusteQuantidade);

                            setForm((prev) => {
                                const estoqueAtual = parseNumber(prev.stock) || 0;
                                return { ...prev, stock: String(estoqueAtual + quantidadeAjusteNumero) };
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
                {deleteConfirmOpen && itemToDelete && (
                    <ProductDeleteModal
                        open={deleteConfirmOpen}
                        item={itemToDelete}
                        onConfirm={handleConfirmDelete}
                        onClose={() => {
                            setDeleteConfirmOpen(false);
                            setItemToDelete(null);
                        }}
                    />
                )}

                {/* Modal: Importação XML */}
                {modalImportOpen && (
                    <ImportItemsModal
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

export default RegistrationPage;
