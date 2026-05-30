import type { NextApiRequest, NextApiResponse } from 'next';
import { insertDailySale, getDailySales, updateDailySale, getDailySaleById, deleteDailySale } from '../../database/db';

const isEditableDate = (dateString: string) => {
  const saleDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  const todayMidnight = new Date(today.toISOString().split('T')[0] + 'T00:00:00');
  const diffMs = todayMidnight.getTime() - saleDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { data, valor, observacoes, criado_em } = req.body;
    try {
      if (!criado_em) {
        insertDailySale(data, valor, observacoes);
      } else {
        insertDailySale(data, valor, observacoes, criado_em);
      }
      res.status(200).json({ message: 'Venda registrada com sucesso' });
    } catch (error) {
      console.error('Erro na API POST /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao registrar venda', details: String(error) });
    }
  } else if (req.method === 'PUT') {
    const { id, data, valor, observacoes } = req.body;
    if (!id || !data || typeof valor !== 'number') {
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

      updateDailySale(id, data, valor, observacoes);
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