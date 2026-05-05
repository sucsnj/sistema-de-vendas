import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VendaDiaria } from '../services/vendasService';

interface SalesChartProps {
  data: VendaDiaria[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const chartData = data.map((sale) => ({
    data: sale.data,
    valor: sale.valor,
  }));

  return (
    <div className="chart-container">
      <h2>Evolução Diária de Vendas</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="valor" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;