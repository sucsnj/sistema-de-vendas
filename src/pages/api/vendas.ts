import type { NextApiRequest, NextApiResponse } from 'next';
import { insertDailySale, insertSpecialSale, getDailySales, updateDailySale, getDailySaleById, deleteDailySale } from '../../database/db';
import { validateCurrency, validateDate, isEditableDate } from '../../utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { data, valor, observacoes, criado_em } = req.body;
    try {
      // Validar data e valor
      const validDate = validateDate(data);
      const validValue = typeof valor === 'number' ? valor : validateCurrency(String(valor));
      if (!validDate || validValue == null) {
        return res.status(400).json({ error: 'Dados inválidos: data ou valor inválidos' });
      }

      if (!criado_em) {
        if (valor > 0) {
          insertDailySale(data, validValue, observacoes);
        } else {
          insertSpecialSale(data, validValue, observacoes);
        }
      } else {
        if (valor > 0) {
          insertDailySale(data, validValue, observacoes, criado_em);
        } else {
          insertSpecialSale(data, validValue, observacoes, criado_em);
        }
      }
      res.status(200).json({ message: 'Venda registrada com sucesso' });
    } catch (error) {
      console.error('Erro na API POST /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao registrar venda', details: String(error) });
    }
  } else if (req.method === 'PUT') {
    const { id, data, valor, observacoes } = req.body;
    const validDate = validateDate(data);
    const validValue = typeof valor === 'number' ? valor : validateCurrency(String(valor));
    if (!id || !validDate || validValue == null) {
      return res.status(400).json({ error: 'Dados inválidos para atualização' });
    }

    try {
      const originalSale = getDailySaleById(id) as { data?: string } | null;
      if (!originalSale || typeof originalSale.data !== 'string') {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      if (!isEditableDate(originalSale.data)) {
        return res.status(403).json({ error: 'Atualização permitida apenas para vendas dos últimos 2 dias' });
      }

      updateDailySale(id, data, validValue, observacoes);
      res.status(200).json({ message: 'Venda atualizada com sucesso' });
    } catch (error) {
      console.error('Erro na API PUT /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao atualizar venda', details: String(error) });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID da venda é obrigatório para exclusão' });
    }

    try {
      const originalSale = getDailySaleById(id) as { data?: string } | null;
      if (!originalSale || typeof originalSale.data !== 'string') {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      if (!isEditableDate(originalSale.data)) {
        return res.status(403).json({ error: 'Exclusão permitida apenas para vendas dos últimos 2 dias' });
      }

      deleteDailySale(id);
      res.status(200).json({ message: 'Venda excluída com sucesso' });
    } catch (error) {
      console.error('Erro na API DELETE /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao excluir venda', details: String(error) });
    }
  } else if (req.method === 'GET') {
    const { mes, ano } = req.query;
    try {
      const sales = getDailySales(parseInt(mes as string), parseInt(ano as string));
      res.status(200).json(sales);
    } catch (error) {
      console.error('Erro na API GET /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas', details: String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
