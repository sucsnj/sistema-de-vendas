/**
 * src/hooks/useImportItens.ts
 *
 * Hook que concentra o estado e a lógica do modal de importação de itens
 * via XML de NF-e (preview do arquivo, vínculo com itens do sistema e
 * importação em lote). Lógica extraída de `ModalImportItens` (ver docs).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { importInvoiceItem, previewInvoiceItems } from '../services/produtosService';
import type { ProdutoImportado } from '../services/produtosService';
import type { SugestaoItem } from '../components/ItemNomeDropdown';

export type StatusItem = 'idle' | 'ok' | 'duplicado' | 'estoque_atualizado' | 'erro';

export interface ItemComStatus extends ProdutoImportado {
  status: StatusItem;
  mensagem?: string;
}

interface UseImportItensOptions {
  onImportSuccess: () => void;
  /** Arquivo recebido imediatamente ao abrir o modal (drop externo). */
  initialFile?: File | null;
}

export const useImportItens = ({ onImportSuccess, initialFile }: UseImportItensOptions) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [products, setProducts] = useState<ItemComStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xml')) {
      setError('Selecione um arquivo XML válido de nota fiscal.');
      return;
    }

    setLoading(true);
    setError(null);
    setProducts([]);
    setCompleted(false);
    setFileName(file.name);

    try {
      const text = await file.text();
      const result = await previewInvoiceItems(text);

      if (!result.ok || !result.produtos) {
        setError(result.error || 'Erro ao processar o arquivo XML.');
        return;
      }

      const itemsWithStatus: ItemComStatus[] = result.produtos.map((p) => ({
        ...p,
        descricaoOriginal: p.descricaoOriginal || p.descricao,
        status: 'idle',
      }));
      setProducts(itemsWithStatus);
    } catch (err) {
      setError('Erro inesperado ao ler o arquivo. Verifique se é uma NF-e válida.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFile) {
      const timer = setTimeout(() => processFile(initialFile), 0);
      return () => clearTimeout(timer);
    }
  }, [initialFile, processFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleImport = useCallback(async () => {
    if (products.length === 0) return;
    setImporting(true);
    setError(null);

    const results: ItemComStatus[] = [...products];

    for (let i = 0; i < results.length; i++) {
      const produto = results[i];
      try {
        const result = await importInvoiceItem(produto);

        if (!result.ok) {
          results[i] = {
            ...produto,
            status: result.duplicado ? 'duplicado' : 'erro',
            mensagem: result.error,
          };
        } else if (result.estoqueAtualizado) {
          results[i] = { ...produto, status: 'estoque_atualizado', mensagem: 'Estoque atualizado com sucesso' };
        } else {
          results[i] = { ...produto, status: 'ok' };
        }
      } catch {
        results[i] = { ...produto, status: 'erro', mensagem: 'Falha na requisição' };
      }
      setProducts([...results]);
    }

    setImporting(false);
    setCompleted(true);
    onImportSuccess();
  }, [products, onImportSuccess]);

  const handleItemDescriptionChange = (index: number, novoNome: string) => {
    setProducts((prev) => {
      const copy = [...prev];
      const item = copy[index];
      copy[index] = {
        ...item,
        descricao: novoNome,
        existe: false,
        itemIdExistente: undefined,
      };
      return copy;
    });
  };

  const handleSelectSuggestion = (index: number, sugestao: SugestaoItem) => {
    setProducts((prev) => {
      const copy = [...prev];
      const item = copy[index];
      copy[index] = {
        ...item,
        descricao: sugestao.nome,
        existe: true,
        itemIdExistente: sugestao.id,
        ean: item.ean || sugestao.ean || '',
      };
      return copy;
    });
  };

  const handleEditItem = (item: ProdutoImportado) => {
    if (!item.itemIdExistente) return;
    window.open(`/cadastro?id=${item.itemIdExistente}`, '_blank');
  };

  const handleQuickRegister = (item: ProdutoImportado) => {
    const params = new URLSearchParams();
    params.append('novoImport', '1');
    if (item.descricao) params.append('nome', item.descricao);
    if (item.valorUnitario) params.append('precoCompra', String(item.valorUnitario));
    if (item.quantidade) params.append('estoque', String(item.quantidade));
    if (item.unidadeMedida) params.append('unidade', item.unidadeMedida);
    if (item.ean) params.append('ean', item.ean);
    if (item.cProd) params.append('codigoInterno', item.cProd);

    window.open(`/cadastro?${params.toString()}`, '_blank');
  };

  const resetFile = useCallback(() => {
    setProducts([]);
    setFileName(null);
    setError(null);
    setCompleted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return {
    fileInputRef,
    isDragOver,
    fileName,
    loading,
    importing,
    products,
    error,
    completed,
    processFile,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleImport,
    handleItemDescriptionChange,
    handleSelectSuggestion,
    handleEditItem,
    handleQuickRegister,
    resetFile,
  };
};