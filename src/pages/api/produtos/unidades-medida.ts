import type { NextApiRequest, NextApiResponse } from 'next';
import { getUnidadesMedida } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const uoms = getUnidadesMedida();
      return res.status(200).json(uoms);
    } catch (error) {
      console.error('Erro ao buscar unidades de medida:', error);
      return res.status(500).json({ error: 'Erro ao buscar unidades de medida.' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
