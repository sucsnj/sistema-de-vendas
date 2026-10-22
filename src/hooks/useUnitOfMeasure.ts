import { useState } from 'react';
import {
  fetchUnitsOfMeasure,
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  updateUnitOfMeasure,
} from '../services/produtosService';
import { ProdutoFormData } from '@/components/products/ProductForm';
import { ProdutoOptions } from '@/components/products/ProductForm';
import { validateRequired } from '../utils/validation';

export interface UnidadeMedidaFormData {
    sigla: string;
    descricao: string;
}

export interface UnidadeMedidaOptions {
    abrirModalUnidadeMedida: () => void;
    salvarUnidadeMedida: React.FormEventHandler<HTMLFormElement>;
}

interface UseUnidadeMedidaParams {
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

export const useUnitOfMeasure = ({
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
}: UseUnidadeMedidaParams) => {
  // Modais de cadastro rápido
  const [modalUnidadeMedidaOpen, setModalUnidadeMedidaOpen] = useState(false);
  const [uomForm, setUomForm] = useState<UnidadeMedidaFormData>({ sigla: '', descricao: '' });

  // Modais de Edição
  const [modalUnidadeMedidaEditOpen, setModalUnidadeMedidaEditOpen] = useState(false);

  // Cadastro de Unidade de Medida Inline
  const handleSaveUnitOfMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    const siglaUnidade = validateRequired(uomForm.sigla, 'A sigla da unidade de medida');
    if (!siglaUnidade.ok) {
      showToast(siglaUnidade.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await createUnitOfMeasure(uomForm.sigla.trim(), uomForm.descricao.trim());
      showToast(response.message || 'Unidade de medida criada com sucesso.', 'success');

      // Re-carrega lista de unidade de medida e seleciona a criada
      const uoms = await fetchUnitsOfMeasure();
      setOptions(prev => ({ ...prev, unidadesMedida: uoms }));
      setForm(prev => ({ ...prev, unidadeMedidaId: response.id }));

      // Fecha modal
      setModalUnidadeMedidaOpen(false);
      setUomForm({ sigla: '', descricao: '' });
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao criar unidade de medida.', 'error');
    }
  };

  // Handler para abrir modal de edição de unidade de medida
  const handleOpenEditUnitOfMeasureModal = (unit: { id: number; sigla: string; descricao?: string }) => {
    setForm(prev => ({ ...prev, unidadeMedidaId: unit.id }));
    setUomForm({ sigla: unit.sigla, descricao: unit.descricao || '' });
    setModalUnidadeMedidaEditOpen(true);
  };

  // Ediçao de unidade de medida
  const handleUpdateUnitOfMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uomForm.sigla.trim()) {
      showToast('A sigla da unidade de medida é obrigatório.', 'error');
      return;
    }
    try {
      const response = await updateUnitOfMeasure(form.unidadeMedidaId, uomForm.sigla.trim(), uomForm.descricao.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, unidadesMedida: prev.unidadesMedida.map(uom =>
          uom.id === form.unidadeMedidaId ?
            { ...uom, sigla: uomForm.sigla.trim(), descricao: uomForm.descricao.trim() } : uom
        )
      }));

      showToast(response.message || 'Unidade de medida atualizada com sucesso.', 'success');
      setModalUnidadeMedidaEditOpen(false);
      setUomForm({ sigla: '', descricao: '' });
      loadItems();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar unidade de medida.', 'error');
    }
  };

  // Handle para deletar unidade de medida
  const handleDeleteUnitOfMeasure = async () => {
    try {
      await deleteUnitOfMeasure(form.unidadeMedidaId);
      showToast('Unidade de medida deletada com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        unidadesMedida: prev.unidadesMedida.filter(uom => uom.id !== form.unidadeMedidaId)
      }));

      // Fecha o modal após a exclusão
      setModalUnidadeMedidaOpen(false);
      setUomForm({ sigla: '', descricao: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, unidadeMedidaId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadItems();
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao deletar unidade de medida.', 'error');
    }
  };

  return {
    // Estados
    modalUnidadeMedidaOpen,
    setModalUnidadeMedidaOpen,
    uomForm,
    setUomForm,
    modalUnidadeMedidaEditOpen,
    setModalUnidadeMedidaEditOpen,

    // Handlers
    handleSaveUnitOfMeasure,
    handleOpenEditUnitOfMeasureModal,
    handleUpdateUnitOfMeasure,
    handleDeleteUnitOfMeasure,
  };
};
