import { useState } from 'react';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from '../services/produtosService';
import { CategoriaFormData } from '@/types/categoria';
import { ProdutoFormData } from '@/components/products/ProductForm';
import { ProdutoOptions } from '@/components/products/ProductForm';
import { validateRequired } from '../utils/validation';

interface UseCategoriaParams {
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

export const useCategory = ({
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
}: UseCategoriaParams) => {
  // Modais de cadastro rápido
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [catForm, setCatForm] = useState<CategoriaFormData>({ nome: '', descricao: '' });

  // Modais de Edição
  const [modalCategoriaEditOpen, setModalCategoriaEditOpen] = useState(false);

  // Cadastro de Categoria Inline
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeCategoria = validateRequired(catForm.nome, 'O nome da categoria');
    if (!nomeCategoria.ok) {
      showToast(nomeCategoria.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await createCategory(catForm.nome.trim(), catForm.descricao.trim());
      showToast(response.message || 'Categoria criada com sucesso.', 'success');

      // Re-carrega lista de categorias e seleciona a criada
      const cats = await fetchCategories();
      setOptions(prev => ({ ...prev, categorias: cats }));
      setForm(prev => ({ ...prev, categoriaId: response.id }));

      // Fecha modal
      setModalCategoriaOpen(false);
      setCatForm({ nome: '', descricao: '' });
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao criar categoria.', 'error');
    }
  };

  // Handler para abrir modal de edição de categoria
  const handleOpenEditModal = (category: { id: number; nome: string; descricao?: string }) => {
    setForm(prev => ({ ...prev, categoriaId: category.id }));
    setCatForm({ nome: category.nome, descricao: category.descricao || '' });
    setModalCategoriaEditOpen(true);
  };

  // Ediçao de categoria
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeCategoria = validateRequired(catForm.nome, 'O nome da categoria');
    if (!nomeCategoria.ok) {
      showToast(nomeCategoria.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await updateCategory(form.categoriaId, catForm.nome.trim(), catForm.descricao.trim());

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
      loadItems();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar categoria.', 'error');
    }
  };

  // Handle para deletar categoria
  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(form.categoriaId);
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
        loadItems();
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao deletar categoria.', 'error');
    }
  };

  return {
    // Estados
    modalCategoriaOpen,
    setModalCategoriaOpen,
    catForm,
    setCatForm,
    modalCategoriaEditOpen,
    setModalCategoriaEditOpen,

    // Handlers
    handleSaveCategory,
    handleOpenEditModal,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
