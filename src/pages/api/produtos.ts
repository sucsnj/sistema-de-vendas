import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getItens,
  getItemById,
  getServicoById,
  insertItem,
  updateItem,
  deleteItem,
  toggleItemStatus,
  toggleServicoStatus,
  deleteServico,
  checkDuplicateCodigoInterno,
  checkDuplicateBarcode,
} from '../../database/produtosDb';
import { parseNumber } from '../../utils/number';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, tipo, categoria_id, marca_id, fornecedor_id, preco_venda, ativo, page, pageSize } = req.query;

      const parsedOptions: any = {
        search: search ? String(search) : undefined,
        tipo: tipo ? String(tipo) : undefined,
        categoria_id: categoria_id ? Number(categoria_id) : undefined,
        marca_id: marca_id ? Number(marca_id) : undefined,
        fornecedor_id: fornecedor_id ? Number(fornecedor_id) : undefined,
        preco_venda: preco_venda ? Number(preco_venda) : undefined,
        ativo: ativo !== undefined && ativo !== 'TODOS' ? (ativo === 'ATIVO' ? 1 : 0) : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10,
      };

      const result = getItens(parsedOptions);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return res.status(500).json({ error: 'Erro ao carregar lista de produtos e serviços.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, id, ativo, tipo, nome, descricao, categoria_id, unidade_medida_id, marca_id, fornecedor_id, preco_compra, margem_lucro, preco_venda, estoque, codigo_interno, referencia, codigos_barras } = req.body;

      // Altera status de ativo/inativo
      if (action === 'toggle-status') {
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório para alterar status.' });
        }
        if (ativo === undefined || (ativo !== 0 && ativo !== 1)) {
          return res.status(400).json({ error: 'Valor de status ativo (0 ou 1) é inválido.' });
        }
        
        if (tipo === 'SERVICO') {
          const existing = getServicoById(id);
          if (!existing) {
            return res.status(404).json({ error: 'Serviço não encontrado.' });
          }
          toggleServicoStatus(id, ativo);
          return res.status(200).json({ message: `Serviço ${ativo === 1 ? 'ativado' : 'desativado'} com sucesso.` });
        }

        const existing = getItemById(id);
        if (!existing) {
          return res.status(404).json({ error: 'Item não encontrado.' });
        }

        toggleItemStatus(id, ativo);
        return res.status(200).json({ message: `Item ${ativo === 1 ? 'ativado' : 'desativado'} com sucesso.` });
      }

      // Validação do cadastro básico
      if (!tipo || (tipo !== 'PRODUTO' && tipo !== 'SERVICO')) {
        return res.status(400).json({ error: 'O tipo deve ser PRODUTO ou SERVICO.' });
      }
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }
      if (!categoria_id || isNaN(Number(categoria_id))) {
        return res.status(400).json({ error: 'Selecione uma categoria válida.' });
      }
      if (tipo === 'PRODUTO' && (!unidade_medida_id || isNaN(Number(unidade_medida_id)))) {
        return res.status(400).json({ error: 'Selecione uma unidade de medida válida.' });
      }
      if (!marca_id || isNaN(Number(marca_id))) {
        return res.status(400).json({ error: 'Selecione uma marca válida.' });
      }

      if (!fornecedor_id || isNaN(Number(fornecedor_id))) {
        return res.status(400).json({ error: 'Selecione um fornecedor válido.' });
      }

      // Validação de código interno duplicado
      if (codigo_interno && checkDuplicateCodigoInterno(codigo_interno)) {
        return res.status(400).json({ error: `O código interno "${codigo_interno}" já está cadastrado.` });
      }

      // Validação de códigos de barras
      let listBarcodes: any[] = [];
      if (codigos_barras && Array.isArray(codigos_barras)) {
        listBarcodes = codigos_barras
          .map((cb: any) => ({
            codigo_barras: cb.codigo_barras ? String(cb.codigo_barras).trim() : '',
            principal: cb.principal ? 1 : 0
          }))
          .filter((cb: any) => cb.codigo_barras.length > 0);

        const codes = listBarcodes.map(c => c.codigo_barras);
        const duplicatesInInput = codes.filter((item, index) => codes.indexOf(item) !== index);
        if (duplicatesInInput.length > 0) {
          return res.status(400).json({ error: `Há códigos de barras duplicados no formulário: ${duplicatesInInput.join(', ')}` });
        }

        if (listBarcodes.length > 0) {
          const countPrincipal = listBarcodes.filter(c => c.principal === 1).length;
          if (countPrincipal === 0) {
            listBarcodes[0].principal = 1;
          } else if (countPrincipal > 1) {
            let found = false;
            for (const cb of listBarcodes) {
              if (cb.principal === 1) {
                if (!found) found = true;
                else cb.principal = 0;
              }
            }
          }

          const dbDuplicate = checkDuplicateBarcode(codes);
          if (dbDuplicate) {
            return res.status(400).json({ error: `O código de barras "${dbDuplicate}" já está cadastrado em outro produto.` });
          }
        }
      }

      const precoCompraRaw = parseNumber(preco_compra);
      const margemLucroRaw = parseNumber(margem_lucro);
      const precoVendaRaw = parseNumber(preco_venda);
      const estoqueRaw = parseNumber(estoque);

      const precoCompraNumber = Number.isFinite(precoCompraRaw) ? precoCompraRaw : 0;
      const margemLucroNumber = Number.isFinite(margemLucroRaw) ? margemLucroRaw : 0;
      const precoVendaNumber = Number.isFinite(precoVendaRaw) ? precoVendaRaw : 0;
      const estoqueNumber = Number.isFinite(estoqueRaw) ? estoqueRaw : 0;

      const itemId = insertItem({
        tipo,
        nome: nome.trim(),
        descricao,
        categoria_id: Number(categoria_id),
        unidade_medida_id: tipo === 'PRODUTO' ? Number(unidade_medida_id) : 21,
        marca_id: Number(marca_id),
        fornecedor_id: Number(fornecedor_id),
        preco_compra: precoCompraNumber,
        margem_lucro: margemLucroNumber,
        preco_venda: precoVendaNumber,
        estoque: estoqueNumber,
        codigo_interno: codigo_interno || undefined,
        referencia: referencia || undefined,
        ativo: ativo !== undefined ? Number(ativo) : 1,
        codigos_barras: listBarcodes,
      });

      return res.status(201).json({ id: itemId, message: 'Item cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return res.status(500).json({ error: 'Erro interno ao salvar item.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, tipo, nome, descricao, categoria_id, unidade_medida_id, marca_id, fornecedor_id, preco_compra, margem_lucro, preco_venda, estoque, codigo_interno, referencia, ativo, codigos_barras } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'O ID do item é obrigatório para atualização.' });
      }

      const existing = getItemById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Item não encontrado.' });
      }

      // Validação do cadastro básico
      if (!tipo || (tipo !== 'PRODUTO' && tipo !== 'SERVICO')) {
        return res.status(400).json({ error: 'O tipo deve ser PRODUTO ou SERVICO.' });
      }
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }
      if (!categoria_id || isNaN(Number(categoria_id))) {
        return res.status(400).json({ error: 'Selecione uma categoria válida.' });
      }
      if (tipo === 'PRODUTO' && (!unidade_medida_id || isNaN(Number(unidade_medida_id)))) {
        return res.status(400).json({ error: 'Selecione uma unidade de medida válida.' });
      }
      if (!marca_id || isNaN(Number(marca_id))) {
        return res.status(400).json({ error: 'Selecione uma marca válida.' });
      }

      if (!fornecedor_id || isNaN(Number(fornecedor_id))) {
        return res.status(400).json({ error: 'Selecione um fornecedor válido.' });
      }

      const precoCompraRaw = parseNumber(preco_compra);
      const margemLucroRaw = parseNumber(margem_lucro);
      const precoVendaRaw = parseNumber(preco_venda);
      const estoqueRaw = parseNumber(estoque);

      const precoCompraNumber = Number.isFinite(precoCompraRaw) ? precoCompraRaw : 0;
      const margemLucroNumber = Number.isFinite(margemLucroRaw) ? margemLucroRaw : 0;
      const precoVendaNumber = Number.isFinite(precoVendaRaw) ? precoVendaRaw : 0;
      const estoqueNumber = Number.isFinite(estoqueRaw) ? estoqueRaw : 0;

      // Validação de código interno: não pode ser alterado
      if (codigo_interno && existing.codigo_interno && codigo_interno.trim() !== existing.codigo_interno) {
        return res.status(400).json({ error: 'O código interno não pode ser alterado.' });
      }

      // Validação de códigos de barras
      let listBarcodes: any[] = [];
      if (codigos_barras && Array.isArray(codigos_barras)) {
        listBarcodes = codigos_barras
          .map((cb: any) => ({
            codigo_barras: cb.codigo_barras ? String(cb.codigo_barras).trim() : '',
            principal: cb.principal ? 1 : 0
          }))
          .filter((cb: any) => cb.codigo_barras.length > 0);

        const codes = listBarcodes.map(c => c.codigo_barras);
        const duplicatesInInput = codes.filter((item, index) => codes.indexOf(item) !== index);
        if (duplicatesInInput.length > 0) {
          return res.status(400).json({ error: `Há códigos de barras duplicados no formulário: ${duplicatesInInput.join(', ')}` });
        }

        if (listBarcodes.length > 0) {
          const countPrincipal = listBarcodes.filter(c => c.principal === 1).length;
          if (countPrincipal === 0) {
            listBarcodes[0].principal = 1;
          } else if (countPrincipal > 1) {
            let found = false;
            for (const cb of listBarcodes) {
              if (cb.principal === 1) {
                if (!found) found = true;
                else cb.principal = 0;
              }
            }
          }

          const dbDuplicate = checkDuplicateBarcode(codes, id);
          if (dbDuplicate) {
            return res.status(400).json({ error: `O código de barras "${dbDuplicate}" já está cadastrado em outro produto.` });
          }
        }
      }

      updateItem(id, {
        tipo,
        nome: nome.trim(),
        descricao,
        categoria_id: Number(categoria_id),
        unidade_medida_id: Number(unidade_medida_id),
        marca_id: Number(marca_id),
        fornecedor_id: Number(fornecedor_id),
        preco_compra: precoCompraNumber,
        margem_lucro: margemLucroNumber,
        preco_venda: precoVendaNumber,
        estoque: estoqueNumber,
        codigo_interno: codigo_interno || undefined,
        referencia: referencia || undefined,
        ativo: ativo !== undefined ? Number(ativo) : 1,
        codigos_barras: listBarcodes,
      });

      return res.status(200).json({ message: 'Item atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar item.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, tipo } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório para exclusão.' });
      }

      if (tipo === 'SERVICO') {
        const existing = getServicoById(id);
        if (!existing) {
          return res.status(404).json({ error: 'Serviço não encontrado.' });
        }
        deleteServico(id);
        return res.status(200).json({ message: 'Serviço excluído com sucesso.' });
      }

      const existing = getItemById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Item não encontrado.' });
      }

      deleteItem(id);
      return res.status(200).json({ message: 'Item excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir item.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
