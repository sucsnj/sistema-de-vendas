import React from 'react';

interface ContasAPagarHeaderProps {
  ano: number;
  mes: number;
  setAno: (ano: number) => void;
  setMes: (mes: number) => void;
  handleBackup: () => Promise<void>;
}

const ContasAPagarHeader: React.FC<ContasAPagarHeaderProps> = ({ ano, mes, setAno, setMes, handleBackup }) => {
  const today = new Date();

  return (
    <header className="contas-header">
      <div>
        <h1>Contas a pagar</h1>
        <p>Cadastro detalhado, agenda automática e resumo analítico de pagamentos.</p>
      </div>
      <div className="contas-actions">
        <label>
          Ano:
          <input
            className="ano-input"
            type="number"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value, 10) || today.getFullYear())}
          />
        </label>
        <label>
          Mês:
          <select className="mes-select" value={mes} onChange={(e) => setMes(parseInt(e.target.value, 10))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={handleBackup} className="backup-button">
          Backup Anual
        </button>
      </div>
    </header>
  );
};

export default ContasAPagarHeader;
