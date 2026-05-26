import { useState, useEffect } from 'react';
import { buscarTodosMensais, VendaMensal } from '../services/vendasService';
import { formatCurrency } from '../utils/formatter';
import dayjs from 'dayjs';

const Resumo: React.FC = () => {
  const [mensais, setMensais] = useState<VendaMensal[]>([]);

  useEffect(() => {
    loadMensais();
  }, []);

  const loadMensais = async () => {
    const data = await buscarTodosMensais();
    setMensais(data);
  };

  return (
    <div className="container-padding">
      <h1>Resumo Mensal</h1>
      <div className="glass-form">
        <table className="table-container">
          <thead>
            <tr>
              <th>Ano</th>
              <th>Mês</th>
              <th>Ticket Médio</th>
              <th>Média de clientes</th>
              <th>Melhor dia</th>
              <th>Quantidade de vendas</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {mensais.map((m) => (
              <tr key={m.id}>
                <td>{m.ano}</td>
                <td>{m.mes}</td>
                <td>R$ {formatCurrency(m.total, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Resumo;