import { useState, useEffect } from 'react';
import {
  buscarTodosMensais,
  VendaMensal,
  excluirMensal,
} from '../services/vendasService';
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/formatter';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { capitalize } from '../utils/captalize';
import ConfirmDialog from '@/components/ConfirmDialog';
dayjs.locale('pt-br');

const Resumo: React.FC = () => {
  const [mensais, setMensais] = useState<VendaMensal[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const [duration, setToastDuration] = useState<number | null>(3000);

  // estado para o diálogo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Função utilitária para abrir toast
  function showToast(message: string, type: "success" | "error" | "info", duration: number | null = 3000) {
    setToastMessage(message);
    setToastType(type);
    setToastDuration(duration);
    setToastOpen(true);
  }

  useEffect(() => {
    loadMensais();
  }, []);

  const loadMensais = async () => {
    const data = await buscarTodosMensais();
    setMensais(data);
  };

  const handleDelete = async (id: number) => {
    try {
      await excluirMensal(id);
      loadMensais();
      showToast('Mês excluído com sucesso.', 'success', 3000);
    } catch (error) {
      showToast('Erro ao excluir mês.', 'error', 3000);
    }
  };

  const openConfirm = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  return (
    <div className="container-padding">
      <h1>Resumo Mensal</h1>
      <div className="glass-form">
        <table className="table-container">
          <thead>
            <tr>
              <th>Data</th>
              <th>Ticket Médio</th>
              <th>Média de clientes</th>
              <th>Melhor dia</th>
              <th>Maior venda</th>
              <th>Quantidade de vendas</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {mensais.map((m) => (
              <tr key={m.id}>
                <td>{capitalize(dayjs().month(m.mes - 1).format('MMMM'))} - {m.ano}</td>
                <td>R$ {formatCurrency(m.ticketMedio, 2)}</td>
                <td>{formatCurrency(m.mediaClientes)}</td>
                <td>
                  {`${dayjs(m.melhorDia).format('D')} - ${capitalize(dayjs(m.melhorDia).locale('pt-br').format('dddd'))}`}
                </td>
                <td>R$ {formatCurrency(m.maiorVenda, 2)}</td>
                <td>{m.qtdVendas}</td>
                <td>R$ {formatCurrency(m.total, 2)}</td>
                <td>
                  <button type="button" onClick={() => openConfirm(m.id)} className="delete-btn">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir este mês?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => {
          if (selectedId !== null) {
            handleDelete(selectedId);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        duration={duration}
        onClose={() => setToastOpen(false)}
        position="top-right"
      />
      <style jsx>{`
        .delete-btn {
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .delete-btn:hover {
          color: white;
          opacity: 0.95;
          box-shadow: 0 0 0 4px var(--danger-dark);
          transition: all 0.2s ease;
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  );
};

export default Resumo;