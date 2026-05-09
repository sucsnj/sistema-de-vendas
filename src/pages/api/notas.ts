import type { NextApiRequest, NextApiResponse } from 'next';
import {
  insertNota,
  getNotasById,
  getNotasByValor,
  getNotasByPeriod,
  deleteNota,
} from '../../database/notasDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { ano, mes, id, valor } = req.query;
    if (id) {
      const nota = getNotasById(parseInt(id as string));
      if (!nota) {
        return res.status(404).json({ error: 'Nota não encontrada' });
      }
      return res.status(200).json(nota);
    }
    // Buscar por valor
    if (valor) {
      const nota = getNotasByValor(parseFloat(valor as string));
      if (!nota) {
        return res.status(404).json({ error: 'Nenhuma nota encontrada com esse valor' });
      }
      return res.status(200).json(nota);
    }

    // Buscar por período (ano/mês)
    if (!ano) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }
    const notas = getNotasByPeriod(
      parseInt(ano as string),
      mes ? parseInt(mes as string) : undefined
    );

    console.log(notas);
    return res.status(200).json(notas);
  }

  if (req.method === 'POST') {
    const { dataEmissao, valorNota } = req.body;
    if (!dataEmissao || !valorNota) {
      return res.status(400).json({ error: 'Data de emissão e valor da nota são obrigatórios' });
    }
    const result = insertNota(dataEmissao, valorNota);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID é obrigatório para exclusão' });
    }
    const result = deleteNota(parseInt(id as string));
    return res.status(200).json({ changes: result.changes });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
