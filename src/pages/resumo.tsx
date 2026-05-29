import { useState, useEffect } from 'react';
import {
  buscarTodosMensais,
  VendaMensal,
  // calcularTicketMedio,
  // calcularQuantidadeVendas,
  // calcularMelhorDia,
  // calcularMediaClientes,
  // calcularMaiorVenda
} from '../services/vendasService';
import { formatCurrency } from '../utils/formatter';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { capitalize } from '../utils/captalize';
dayjs.locale('pt-br');

export interface VendaMensalDetalhado extends VendaMensal {
  // ticketMedio: number;
  // qtdVendas: number;
  // melhorDia: string | null;
  // mediaClientes: number;
  // maiorVenda: number;
}

const Resumo: React.FC = () => {
  const [mensais, setMensais] = useState<VendaMensalDetalhado[]>([]);

  useEffect(() => {
    loadMensais();
  }, []);

  const loadMensais = async () => {
    const data = await buscarTodosMensais();
    const enriched = await Promise.all(
      data.map(async (m) => ({
        ...m,
        // ticketMedio: await calcularTicketMedio(m.mes, m.ano),
        // qtdVendas: await calcularQuantidadeVendas(m.mes, m.ano),
        // melhorDia: await calcularMelhorDia(m.mes, m.ano),
        // mediaClientes: await calcularMediaClientes(m.mes, m.ano),
        // maiorVenda: await calcularMaiorVenda(m.mes, m.ano),
      }))
    );
    setMensais(enriched);
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
              <th>Maior venda</th>
              <th>Quantidade de vendas</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {mensais.map((m) => (
              <tr key={m.id}>
                <td>{m.ano}</td>
                <td>{capitalize(dayjs().month(m.mes - 1).format('MMMM'))}</td>
                <td>R$ {formatCurrency(m.ticketMedio, 2)}</td>
                <td>{formatCurrency(m.mediaClientes)}</td>
                <td>
                  {`${dayjs(m.melhorDia).format('D')} - ${capitalize(dayjs(m.melhorDia).locale('pt-br').format('dddd'))}`}
                </td>
                <td>R$ {formatCurrency(m.maiorVenda, 2)}</td>
                <td>{m.qtdVendas}</td>
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