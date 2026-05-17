import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { VendaDiaria } from '../services/vendasService';

interface SalesChartProps {
  data: VendaDiaria[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [range, setRange] = useState<30 | 7 | 3>(30);

  // Filtra os dados pelo alcance escolhido
  const chartData = data
    .slice(-range) // pega os últimos X dias
    .map((sale) => ({
      data: sale.criado_em,
      valor: sale.valor,
    }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Evolução Diária de Vendas</h2>

        <button
          type="button"
          onClick={() =>
            setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))
          }
        >
          Trocar gráfico
        </button>

        <div className="range-buttons">
          <button onClick={() => setRange(30)}>30 dias</button>
          <button onClick={() => setRange(7)}>7 dias</button>
          <button onClick={() => setRange(3)}>3 dias</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="#8884d8" />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#8884d8" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
