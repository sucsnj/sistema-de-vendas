import React, { useMemo } from 'react';
import styles from '../../styles/contas.module.css';
import { AccountDetails } from '../../services/contasService';
import MonthlyConsolidation from './MonthlyConsolidation';
import TotalsByDistributor from './TotalsByDistributor';
import MonthNotes from './MonthNotes';
import { formatCurrency } from '../../utils/formatter';
import { parseDate } from '../../utils/date';

interface SummaryProps {
    accountsYear: AccountDetails[];
    year: number;
    month: number;
    setYear: (year: number) => void;
    setMonth: (month: number) => void;
}

const Summary: React.FC<SummaryProps> = ({ accountsYear, year, month, setYear, setMonth }) => {
    const resumo = useMemo(() => {
        const totalPago = accountsYear.filter((account) => account.status === 'Pago').reduce((sum, account) => sum + account.valor, 0);
        const totalPendente = accountsYear.filter((account) => account.status === 'Pendente').reduce((sum, account) => sum + account.valor, 0);
        
        // Conta a quantidade pendente
        const qtdPendente = accountsYear.filter((account) => account.status === 'Pendente').length;

        // Conta a quantidade de contas pagas
        const qtdPago = accountsYear.filter((account) => account.status === 'Pago').length;

        // Conta o total de contas
        const qtdTotal = accountsYear.length;

        const totalsByDistributor = accountsYear.reduce<Record<string, number>>((acc, account) => {
            if (account.status === 'Pendente') {
                acc[account.distribuidora] = (acc[account.distribuidora] || 0) + account.valor;
            }
            
            return acc;
        }, {});

        const months = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i + 1;
            const contasNoMes = accountsYear.filter((account) => parseDate(`${account.vencimento}T00:00:00`).month() + 1 === monthIndex);
            return {
                month: monthIndex,
                paid: contasNoMes.filter((account) => account.status === 'Pago').reduce((sum, account) => sum + account.valor, 0),
                pending: contasNoMes.filter((account) => account.status === 'Pendente').reduce((sum, account) => sum + account.valor, 0),
            };
        });

        return {
            totalPago,
            totalPendente,
            totalAnual: totalPago + totalPendente,
            months,
            totalsByDistributor,
            qtdPendente,
            qtdPago,
            qtdTotal,
        };
    }, [accountsYear]);

    return (
        <div>
            <section className={`${styles.contasPanel} resumo-panel`}>
                <div className={styles.panelHeader}>
                    <h2>Resumo</h2>
                    <span className={styles.statusChip}>Atualização automática</span>
                </div>
                <div className="summary-card">
                    <table>
                        <thead>
                            <tr>
                                <th><strong>Totais</strong></th>
                                <th><strong>Contadores</strong></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div>
                                        <div className="summary-row">
                                            <strong>Pago</strong>
                                            <span>R$ {formatCurrency(resumo.totalPago, 2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Pendente</strong>
                                            <span>R$ {formatCurrency(resumo.totalPendente, 2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Acumulado anual</strong>
                                            <span>R$ {formatCurrency(resumo.totalAnual, 2)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div className="summary-row">
                                            <strong>Pago</strong>
                                            <span>{resumo.qtdPago}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Pendente</strong>
                                            <span>{resumo.qtdPendente}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Acumulado anual</strong>
                                            <span>{resumo.qtdTotal}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                {/* #Totais por distribuidora */}
                <TotalsByDistributor totalsByDistributor={resumo.totalsByDistributor} />

                { /* #Consolidação mensal */}
                <MonthlyConsolidation months={resumo.months} />

                {/* #Notas do Mês */}
                <MonthNotes year={year} month={month} setYear={setYear} setMonth={setMonth} />

            </section>
            <style jsx>{`
                .contas-panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: var(--shadow);
                }

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

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 18px;
                }

                .panel-header h2 {
                    margin: 0;
                    font-size: 1.4rem;
                }

                .status-chip {
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: var(--surface-soft);
                    color: var(--muted);
                    font-size: 0.9rem;
                    white-space: normal;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    max-width: 100%;
                }

                .summary-card {
                    background: var(--surface-strong);
                    border: 1px solid var(--border);
                    border-radius: 22px;
                    padding: 20px;
                    min-height: 220px;
                }

                .summary-row:last-child {
                  border-bottom: none;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border);
                }

            `}</style>
        </div>
    );
};

export default Summary;
