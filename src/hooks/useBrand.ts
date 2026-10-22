import { useState } from "react";
import { fetchBrands, createBrand, deleteBrand, updateBrand } from "../services/produtosService";
import { MarcaFormData } from "@/components/catalog/BrandEditModal";
import { ProdutoFormData } from "@/components/products/ProductForm";
import { ProdutoOptions } from "@/components/products/ProductForm";
import { validateRequired } from "../utils/validation";

interface UseMarcaParams {
    form: ProdutoFormData;
    setForm: React.Dispatch<React.SetStateAction<ProdutoFormData>>;
    setOptions: React.Dispatch<React.SetStateAction<ProdutoOptions>>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    loadItems: () => void;
    items: unknown[];
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setItemParaExcluir: (value: null) => void;
}

export const useBrand = ({
    form,
    setForm,
    setOptions,
    showToast,
    loadItems,
    items,
    page,
    setPage,
    setDeleteConfirmOpen,
    setItemParaExcluir,
}: UseMarcaParams) => {
    // Modais de cadastro rápido
    const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
    const [marcaForm, setMarcaForm] = useState<MarcaFormData>({ nome: '' });
    const [novaMarcaNome, setNovaMarcaNome] = useState('');

    // Modais de Edição
    const [modalMarcaEditOpen, setModalMarcaEditOpen] = useState(false);

    // Cadastro de Marca Inline
    const handleSaveBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeMarca = validateRequired(novaMarcaNome, "O nome da marca");
        if (!nomeMarca.ok) {
            showToast(nomeMarca.message ?? "Campo obrigatório.", "error");
            return;
        }
        try {
            const response = await createBrand(novaMarcaNome.trim());
            showToast(response.message || 'Marca criada com sucesso.', 'success');

            // Re-carrega lista de marcas e seleciona a criada
            const brands = await fetchBrands();
            setOptions(prev => ({ ...prev, marcas: brands }));
            setForm(prev => ({ ...prev, marcaId: response.id }));

            // Fecha modal
            setModalMarcaOpen(false);
            setNovaMarcaNome('');
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao criar marca.', 'error');
        }
    };

    // Handler para abrir modal de edição de marca
    const handleOpenEditBrandModal = (brand: { id: number; nome: string }) => {
        setForm(prev => ({ ...prev, marcaId: brand.id }));
        setMarcaForm({ nome: brand.nome });
        setModalMarcaEditOpen(true);
    };

    // Edição de marca
    const handleUpdateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeMarca = validateRequired(marcaForm.nome, "O nome da marca");
        if (!nomeMarca.ok) {
            showToast(nomeMarca.message ?? "Campo obrigatório.", "error");
            return;
        }
        try {
            const response = await updateBrand(form.marcaId, marcaForm.nome.trim());

            // Atualiza na interface após confirmação da API
            setOptions(prev => ({
                ...prev, marcas: prev.marcas.map(brand =>
                    brand.id === form.marcaId ?
                        { ...brand, nome: marcaForm.nome.trim() } : brand
                )
            }));

            showToast(response.message || 'Marca atualizada com sucesso.', 'success');
            setModalMarcaEditOpen(false);
            setMarcaForm({ nome: '' });
            loadItems();
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao atualizar marca.', 'error');
        }
    };

    // Handle para deletar marca
    const handleDeleteBrand = async () => {
        try {
            await deleteBrand(form.marcaId);
            showToast('Marca deletada com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemParaExcluir(null);

            // Atualiza a interface após confirmação da API
            setOptions(prev => ({
                ...prev,
                marcas: prev.marcas.filter(brand => brand.id !== form.marcaId)
            }));

            // Fecha o modal após a exclusão
            setModalMarcaOpen(false);
            setMarcaForm({ nome: '' });

            // Coloca o Id para 1
            setForm(prev => ({ ...prev, marcaId: 1 }));

            if (items.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                loadItems();
            }
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao deletar marca.', 'error');
        }
    };

    return {
        // Estados
        modalMarcaOpen,
        setModalMarcaOpen,
        marcaForm,
        setMarcaForm,
        modalMarcaEditOpen,
        setModalMarcaEditOpen,
        novaMarcaNome,
        setNovaMarcaNome,

        // Handlers
        handleSaveBrand,
        handleOpenEditBrandModal,
        handleUpdateBrand,
        handleDeleteBrand,
    };
};