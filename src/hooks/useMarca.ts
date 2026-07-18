import { useState } from "react";
import { buscarMarcas, criarMarca, deletarMarca, atualizarMarca } from "../services/produtosService";
import { MarcaFormData } from "@/components/ModalMarcaEdit";
import { ProdutoFormData } from "@/components/FormularioProduto";
import { ProdutoOptions } from "@/components/FormularioProduto";

interface UseMarcaParams {
    form: ProdutoFormData;
    setForm: React.Dispatch<React.SetStateAction<ProdutoFormData>>;
    setOptions: React.Dispatch<React.SetStateAction<ProdutoOptions>>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    carregarItens: () => void;
    items: any[];
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setItemParaExcluir: React.Dispatch<React.SetStateAction<any>>;
}

export const useMarca = ({
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
}: UseMarcaParams) => {
    // Modais de cadastro rápido
    const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
    const [marcaForm, setMarcaForm] = useState<MarcaFormData>({ nome: '' });
    const [novaMarcaNome, setNovaMarcaNome] = useState('');

    // Modais de Edição
    const [modalMarcaEditOpen, setModalMarcaEditOpen] = useState(false);

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

    // Handler para abrir modal de edição de marca
    const handleOpenEditMarcaModal = (marca: { id: number; nome: string }) => {
        setForm(prev => ({ ...prev, marcaId: marca.id }));
        setMarcaForm({ nome: marca.nome });
        setModalMarcaEditOpen(true);
    };

    // Edição de marca
    const handleAtualizarMarca = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!marcaForm.nome.trim()) {
            showToast('O nome da marca é obrigatório.', 'error');
            return;
        }
        try {
            const response = await atualizarMarca(form.marcaId, marcaForm.nome.trim());

            // Atualiza na interface após confirmação da API
            setOptions(prev => ({
                ...prev, marcas: prev.marcas.map(marca =>
                    marca.id === form.marcaId ?
                        { ...marca, nome: marcaForm.nome.trim() } : marca
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
                marcas: prev.marcas.filter(marca => marca.id !== form.marcaId)
            }));

            // Fecha o modal após a exclusão
            setModalMarcaOpen(false);
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
        handleSalvarMarca,
        handleOpenEditMarcaModal,
        handleAtualizarMarca,
        handleDeletarMarca,
    };
};