import React, { useMemo } from 'react';
import OcrUpload from '@/components/OcrUpload';
import { ContaDetalhe, } from '../services/contasService';

interface AgendaProps {
    contasMes: ContaDetalhe[];
    contasAno: ContaDetalhe[];
}

const Agenda: React.FC<AgendaProps> = ({ contasMes, contasAno }) => {
    const agenda = useMemo(() => {
        const map = new Map<string, { data: string; totalPendente: number }>();
        contasMes.forEach((conta) => {
            const current = map.get(conta.vencimento) ?? { data: conta.vencimento, totalPendente: 0 };
            if (conta.status === 'Pendente') {
                current.totalPendente += conta.valor;
            }
            map.set(conta.vencimento, current);
        });
        return Array.from(map.values()).sort((a, b) => (b.data < a.data ? 1 : -1));
    }, [contasMes]);

    // Lista de contas pendentes que serão pagas na próxima semana
    const proximasContas = useMemo(() => {
        const hoje = new Date().toISOString().split('T')[0];
        return contasAno
            .filter((conta) => conta.status === 'Pendente')
            .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
            .filter((conta) => conta.vencimento >= hoje)
            .slice(0, 12);
    }, [contasAno]);

    return (
        <div>
            <section className="contas-panel agenda-panel">
                <div className="panel-header">
                    <h2>Agenda</h2>
                    <span className="status-chip">Atualização automática</span>
                </div>
                <div className="agenda-card">
                    <h3>Total pendente por vencimento</h3>
                    <div className="agenda-list">
                        {agenda.length === 0 ? (
                            <p>Nenhum vencimento registrado neste mês.</p>
                        ) : (
                            agenda.map((item) => (
                                <div key={item.data} className="agenda-row">
                                    <strong>{item.data}</strong>
                                    <span>R$ {item.totalPendente.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <section className="contas-panel proximas-panel">
                    <div className="panel-header">
                        <h3>Próximas contas a vencer</h3>
                    </div>
                    <div className="proximas-list">
                        {proximasContas.length === 0 ? (
                            <p>Nenhuma conta pendente encontrada.</p>
                        ) : (
                            proximasContas.map((conta) => (
                                <div key={conta.id} className="proxima-row">
                                    <strong>{conta.vencimento}</strong> - {conta.distribuidora} - <span>R$ {conta.valor.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="contas-panel">
                    <div className="panel-header">
                        <h3>Leitura de Contas</h3>
                    </div>
                    <div className="ocr-upload-wrapper">
                        <OcrUpload />
                    </div>
                </section>
            </section>

            <style jsx>{`
                .contas-panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: var(--shadow);
                }

                .agenda-panel,
                    .resumo-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 18px;
                }

                .status-chip {
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: var(--surface-soft);
                    color: var(--muted);
                    font-size: 0.9rem;
                    white-space: nowrap;
                }

                .agenda-card,
                .summary-card {
                    background: var(--surface-strong);
                    border: 1px solid var(--border);
                    border-radius: 22px;
                    padding: 20px;
                    min-height: 220px;
                }

                .agenda-list {
                    display: grid;
                    gap: 14px;
                }

                .agenda-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    border-radius: 18px;
                    background: var(--surface-soft);
                }

                .contas-panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: var(--shadow);
                }

            `}</style>
        </div>
    );
};

export default Agenda;
