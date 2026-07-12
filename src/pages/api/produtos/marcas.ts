import type { NextApiRequest, NextApiResponse } from 'next';
import { getMarcas, insertMarca } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const brands = getMarcas();
      return res.status(200).json(brands);
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
      return res.status(500).json({ error: 'Erro ao buscar marcas.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome } = req.body;
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
      }

      const brands = getMarcas();
      if (brands.some(b => b.nome.toLowerCase() === nome.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Esta marca já existe.' });
      }

      const result = insertMarca(nome.trim());
      return res.status(201).json({ id: result.lastInsertRowid, message: 'Marca cadastrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar marca:', error);
      return res.status(500).json({ error: 'Erro ao salvar marca.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
