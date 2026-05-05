import type { NextApiRequest, NextApiResponse } from 'next';
import { getMonthlyTotal, getAllMonthly, consolidateMonthly } from '../../database/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { mes, ano } = req.query;
    if (mes && ano) {
      try {
        const total = getMonthlyTotal(parseInt(mes as string), parseInt(ano as string));
        res.status(200).json(total);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar total mensal' });
      }
    } else {
      try {
        const all = getAllMonthly();
        res.status(200).json(all);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar totais mensais' });
      }
    }
  } else if (req.method === 'POST') {
    const { mes, ano } = req.body;
    try {
      consolidateMonthly(mes, ano);
      res.status(200).json({ message: 'Consolidação realizada' });
    } catch (error) {
      res.status(500).json({ error: 'Erro na consolidação' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}