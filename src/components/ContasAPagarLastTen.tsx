import React from 'react';
import { ContaDetalhe } from '../services/contasService';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatter';

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
    <div className="last-ten-panel">
      <h3>Últimas 10 contas registradas</h3>
      <table className="detail-table compact-table">
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
              <td>{dayjs(conta.vencimento).format('DD/MM/YYYY')}</td>
              <td>{conta.distribuidora}</td>
              <td>R$ {formatCurrency(conta.valor, 2)}</td>
              <td className="actions-cell">
                <button type="button" className="view-button" onClick={() => handleView(conta)}>
                  Ver
                </button>
                <button type="button" className="delete-button" onClick={() => handleDelete(conta.id)}>
                  Excluir
                </button>
                <button type="button" className="edit-button" onClick={() => handleEditar(conta)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
          {ultimasContas.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty-row">
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
