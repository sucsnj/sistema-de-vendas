import type { NextApiRequest, NextApiResponse } from 'next';
import {
  cancelAccountPayment,
  deleteAccount,
  getAccountById,
  getAccountsByPeriod,
  getAllAccounts,
  insertAccount,
  payAccount,
  updateAccount,
} from '../../database/contasDb';

// Handler de API ou componente exportado.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { ano, mes } = req.query;
    if (!ano) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }

    const contas = getAccountsByPeriod(parseInt(ano as string), mes ? parseInt(mes as string) : undefined);
    return res.status(200).json(contas);
  }

  if (req.method === 'POST') {
    const { action, id, distribuidora, valor, vencimento, documento, bancoObservacoes } = req.body;

    if (action === 'pagar') {
      if (!id) {
        return res.status(400).json({ error: 'ID da conta é obrigatório para pagar' });
      }
      const originalConta = getAccountById(id);
      if (!originalConta) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      payAccount(id);
      return res.status(200).json({ message: 'Conta marcada como Pago' });
    }

    if (action === 'cancelar') {
      if (!id) {
        return res.status(400).json({ error: 'ID da conta é obrigatório para cancelar o pagamento' });
      }
      const originalConta = getAccountById(id);
      if (!originalConta) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      cancelAccountPayment(id);
      return res.status(200).json({ message: 'Pagamento cancelado e conta voltou a Pendente' });
    }

    if (!distribuidora || typeof valor !== 'number' || !vencimento || !documento) {
      return res.status(400).json({ error: 'Dados inválidos para criação de conta' });
    }

    const allContas = getAllAccounts();
    const contaExistente = allContas.find(c => c.distribuidora === distribuidora && c.documento === documento);
    if (contaExistente) {
      return res.status(400).json({ error: 'Já existe uma conta com a mesma distribuidora e documento' });
    }

    insertAccount(distribuidora, valor, vencimento, documento, bancoObservacoes);
    return res.status(200).json({ message: 'Conta registrada com sucesso' });
  }

  if (req.method === 'PUT') {
    const { id, distribuidora, valor, vencimento, documento, bancoObservacoes } = req.body;
    if (!id || !distribuidora || typeof valor !== 'number' || !vencimento || !documento) {
      return res.status(400).json({ error: 'Dados inválidos para atualização de conta' });
    }

    const originalConta = getAccountById(id);
    if (!originalConta) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    updateAccount(id, distribuidora, valor, vencimento, documento, bancoObservacoes);
    return res.status(200).json({ message: 'Conta atualizada com sucesso' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID da conta é obrigatório para exclusão' });
    }

    const originalConta = getAccountById(id);
    if (!originalConta) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    deleteAccount(id);
    return res.status(200).json({ message: 'Conta excluída com sucesso' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
