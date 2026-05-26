import React from 'react';
import { ContaDetalhe } from '../services/contasService';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/formatter';
import styles from '../styles/contas.module.css';

interface ContasAPagarFilterPanelProps {
  filtroDistribuidora: string;
  setFiltroDistribuidora: (value: string) => void;
  filtroStatus: 'Todos' | 'Pendente' | 'Pago';
  setFiltroStatus: (value: 'Todos' | 'Pendente' | 'Pago') => void;
  filtroVencimentoDe: string;
  setFiltroVencimentoDe: (value: string) => void;
  filtroVencimentoAte: string;
  setFiltroVencimentoAte: (value: string) => void;
  hoje: string;
  filteredContas: ContaDetalhe[];
  handleView: (conta: ContaDetalhe) => void;
  handleDelete: (id: number) => void;
  handleEditar: (conta: ContaDetalhe) => void;
  handleStartPayment: (conta: ContaDetalhe) => void;
  onClearFilters: () => void;
}

const ContasAPagarFilterPanel: React.FC<ContasAPagarFilterPanelProps> = ({
  filtroDistribuidora,
  setFiltroDistribuidora,
  filtroStatus,
  setFiltroStatus,
  filtroVencimentoDe,
  setFiltroVencimentoDe,
  filtroVencimentoAte,
  setFiltroVencimentoAte,
  hoje,
  filteredContas,
  handleView,
  handleDelete,
  handleEditar,
  handleStartPayment,
  onClearFilters,
}) => {
  return (
    <div className={styles.contasFilterPanel}>
      <div className={styles.panelHeader}>
        <h2>Detalhe</h2>
        <span className={styles.statusChip}>Filtro</span>
      </div>

      <div className={styles.detailTableWrapper}>
        <div className={styles.filterBar}>
          <div>
            <label>
              Distribuidora
              <input
                type="text"
                placeholder="Filtrar por distribuidora"
                value={filtroDistribuidora}
                onChange={(e) => setFiltroDistribuidora(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Vencimento de
              <input
                type="date"
                value={filtroVencimentoDe}
                onChange={(e) => setFiltroVencimentoDe(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              até
              <input
                type="date"
                value={filtroVencimentoAte}
                onChange={(e) => setFiltroVencimentoAte(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Status
              <select className={styles.statusSelect} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Pendente' | 'Pago')}>
                <option value="Todos">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </label>
          </div>
          <div className={styles.filterActions}>
            <button type="button" onClick={onClearFilters}>
              Limpar filtros
            </button>
          </div>
        </div>

        <h3>Contas do mês</h3>
        <table className={styles.detailTable}>
          <thead>
            <tr>
              <th>Distribuidora</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContas.map((conta) => (
              <tr key={conta.id}>
                <td>{conta.distribuidora}</td>
                <td>R$ {formatCurrency(conta.valor, 2)}</td>
                <td>{formatDate(conta.vencimento, 'DD/MM/YYYY')}</td>
                <td>{conta.documento}</td>
                <td>
                  <span className={`${styles.status} ${styles[conta.status.toLowerCase()]}`}>{conta.status}</span>
                </td>
                <td className={styles.actionsCell}>
                  <button type="button" className={styles.viewButton} onClick={() => handleView(conta)}>
                    Ver
                  </button>
                  <button type="button" className={styles.deleteButton} onClick={() => handleDelete(conta.id)}>
                    Excluir
                  </button>
                  {conta.status === 'Pendente' ? (
                    <button
                      type="button"
                      className={styles.payButton}
                      onClick={() => handleStartPayment(conta)}
                    >
                      Pagar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {filteredContas.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  Nenhuma conta encontrada para o período selecionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContasAPagarFilterPanel;

