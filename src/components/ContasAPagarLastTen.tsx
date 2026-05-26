import React from 'react';
import { ContaDetalhe } from '../services/contasService';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/formatter';
import styles from '../styles/contas.module.css';

interface ContasAPagarLastTenProps {
  ultimasContas: ContaDetalhe[];
  handleView: (conta: ContaDetalhe) => void;
  handleDelete: (id: number) => void;
  handleEditar: (conta: ContaDetalhe) => void;
}

const ContasAPagarLastTen: React.FC<ContasAPagarLastTenProps> = ({
  ultimasContas,
  handleView,
  handleDelete,
  handleEditar,
}) => {
  return (
    <div className={styles.lastTenPanel}>
      <h3>Últimas 10 contas registradas</h3>
      <table className={`${styles.detailTable} ${styles.compactTable}`}>
        <thead>
          <tr>
            <th>Vencimento</th>
            <th>Distribuidora</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ultimasContas.map((conta) => (
            <tr key={conta.id}>
              <td>{formatDate(conta.vencimento, 'DD/MM/YYYY')}</td>
              <td>{conta.distribuidora}</td>
              <td>R$ {formatCurrency(conta.valor, 2)}</td>
              <td className={styles.actionsCell}>
                <button type="button" className={styles.viewButton} onClick={() => handleView(conta)}>
                  Ver
                </button>
                <button type="button" className={styles.deleteButton} onClick={() => handleDelete(conta.id)}>
                  Excluir
                </button>
                <button type="button" className={styles.editButton} onClick={() => handleEditar(conta)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
          {ultimasContas.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.emptyRow}>
                  Nenhuma conta registrada ainda.
                </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default ContasAPagarLastTen;
