import { useState, useEffect } from 'react';
import { buscarTodosMensais, VendaMensal } from '../services/vendasService';

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
      <table className="table-container">
        <thead>
          <tr>
            <th>Mês</th>
            <th>Ano</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {mensais.map((m) => (
            <tr key={m.id}>
              <td>{m.mes}</td>
              <td>{m.ano}</td>
              <td>R$ {m.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Resumo;