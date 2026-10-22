import { useState } from 'react';
import {
    fetchSuppliers,
    createSupplier,
    deleteSupplier,
    updateSupplier,
} from '../services/produtosService';
import { FornecedorFormData } from '@/components/catalog/SupplierEditModal'
import { ProdutoFormData } from '@/components/products/ProductForm';
import { ProdutoOptions } from '@/components/products/ProductForm';
import { validateRequired } from '../utils/validation';

interface UseFornecedorParams {
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

export const useSupplier = ({
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
}: UseFornecedorParams) => {
    // Modais de cadastro rápido
    const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false);
    const [fornecedorForm, setFornecedorForm] = useState<FornecedorFormData>({ nome: '' });
    const [novoFornecedorNome, setNovoFornecedorNome] = useState('');

    // Modais de Edição
    const [modalFornecedorEditOpen, setModalFornecedorEditOpen] = useState(false);

    // Cadastro de Fornecedor Inline
    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeFornecedor = validateRequired(novoFornecedorNome, 'O nome do fornecedor');
        if (!nomeFornecedor.ok) {
            showToast(nomeFornecedor.message ?? 'Campo obrigatório.', 'error');
            return;
        }
        try {
            const response = await createSupplier(novoFornecedorNome.trim());
            showToast(response.message || 'Fornecedor criado com sucesso.', 'success');

            // Re-carrega lista de fornecedores e seleciona o criado
            const forns = await fetchSuppliers();
            setOptions(prev => ({ ...prev, fornecedores: forns }));
            setForm(prev => ({ ...prev, fornecedorId: response.id }));

            // Fecha modal
            setModalFornecedorOpen(false);
            setFornecedorForm({ nome: '' });
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao criar fornecedor.', 'error');
        }
    };

    // Handler para abrir modal de edição de fornecedor
    const handleOpenEditSupplierModal = (supplier: { id: number; nome: string }) => {
        setForm(prev => ({ ...prev, fornecedorId: supplier.id }));
        setFornecedorForm({ nome: supplier.nome || '' });
        setModalFornecedorEditOpen(true);
    };

    // Ediçao de fornecedor
    const handleUpdateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeFornecedor = validateRequired(fornecedorForm.nome, 'O nome do fornecedor');
        if (!nomeFornecedor.ok) {
            showToast(nomeFornecedor.message ?? 'Campo obrigatório.', 'error');
            return;
        }
        try {
            const response = await updateSupplier(form.fornecedorId, fornecedorForm.nome.trim());

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
            loadItems();
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao atualizar fornecedor.', 'error');
        }
    };

    // Handle para deletar fornecedor
    const handleDeleteSupplier = async () => {
        try {
            await deleteSupplier(form.fornecedorId);
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
                loadItems();
            }
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao deletar fornecedor.', 'error');
        }
    };

    return {
        // Estados
        modalFornecedorOpen,
        setModalFornecedorOpen,
        fornecedorForm,
        setFornecedorForm,
        modalFornecedorEditOpen,
        setModalFornecedorEditOpen,
        novoFornecedorNome,
        setNovoFornecedorNome,

        // Handlers
        handleSaveSupplier,
        handleOpenEditSupplierModal,
        handleUpdateSupplier,
        handleDeleteSupplier,
    };
};