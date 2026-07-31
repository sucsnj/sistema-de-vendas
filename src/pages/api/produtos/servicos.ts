import { NextApiRequest, NextApiResponse } from 'next';
import { getServicos, getServicoById, insertServico, updateServico, deleteServico } from '../../../database/produtosDb';

const normalizeServicoPayload = (body: any) => {
    const payload = body && typeof body === 'object' ? body : {};

    const nome = typeof payload.nome === 'string' ? payload.nome.trim() : '';
    const descricao = typeof payload.descricao === 'string' ? payload.descricao.trim() : '';
    const categoria_id = Number(payload.categoria_id);
    const preco_venda = Number(payload.preco_venda ?? payload.preco ?? 0);
    const codigo_interno = typeof payload.codigo_interno === 'string' ? payload.codigo_interno.trim() : '';
    const referencia = typeof payload.referencia === 'string' ? payload.referencia.trim() : '';
    const duracao_minutos = Number(payload.duracao_minutos ?? 0);

    return {
        nome,
        descricao: descricao || undefined,
        categoria_id: Number.isFinite(categoria_id) && categoria_id > 0 ? categoria_id : 0,
        preco_venda: Number.isFinite(preco_venda) ? preco_venda : 0,
        codigo_interno: codigo_interno || undefined,
        referencia: referencia || undefined,
        duracao_minutos: Number.isFinite(duracao_minutos) ? duracao_minutos : 0,
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            if (req.query.id) {
                const servico = getServicoById(Number(req.query.id));
                return res.status(200).json(servico);
            }

            const servicos = getServicos({
                search: req.query.search as string,
                categoria_id: req.query.categoria_id ? Number(req.query.categoria_id) : undefined,
                page: req.query.page ? Number(req.query.page) : undefined,
                pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
            });
            return res.status(200).json(servicos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar serviços' });
        }
    }

    if (req.method === 'POST') {
        try {
            const payload = normalizeServicoPayload(req.body);

            if (!payload.nome) {
                return res.status(400).json({ error: 'O nome do serviço é obrigatório' });
            }

            if (!payload.categoria_id) {
                return res.status(400).json({ error: 'A categoria é obrigatória' });
            }

            const id = insertServico(payload);
            const servico = getServicoById(Number(id));
            return res.status(201).json(servico ?? { id });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar serviço' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const id = Number(req.query.id);
            const payload = normalizeServicoPayload(req.body);

            if (!id) {
                return res.status(400).json({ error: 'ID do serviço é obrigatório' });
            }

            updateServico(id, payload);
            const servico = getServicoById(id);
            return res.status(200).json(servico ?? { id });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar serviço' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const id = Number(req.query.id);
            if (!id) {
                return res.status(400).json({ error: 'ID do serviço é obrigatório' });
            }

            const servico = deleteServico(id);
            return res.status(200).json(servico);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar serviço' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido' });
}
