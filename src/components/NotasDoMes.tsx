import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buscarNotasPorPeriodo, excluirNota, NotaDetalhe } from '../services/notasService';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface NotasDoMesProps {
    ano: number;
    mes: number;
    setAno: (ano: number) => void;
    setMes: (mes: number) => void;
}

const NotasDoMes: React.FC<NotasDoMesProps> = ({ ano, mes, setAno, setMes }) => {
    const queryClient = useQueryClient();

    // Hook que busca notas automaticamente
    const { data: notas = [], isLoading } = useQuery<NotaDetalhe[]>({
        queryKey: ['notas', ano, mes],
        queryFn: () => buscarNotasPorPeriodo(ano, mes).then((data) =>
            Array.isArray(data) ? data : [data]
        ),
    });

    // Somatório de notas
    const somaNotas = notas.reduce((sum, nota) => sum + nota.valor_nota, 0);

    const handleExcluir = async (id: number) => {
        try {
            await excluirNota(id);
            // invalida cache e força refetch
            queryClient.invalidateQueries({ queryKey: ['notas', ano, mes] });
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
        }
    };

    return (
        <div className="summary-card small">
            <h3>Notas do mês</h3>

            {/* Seletor de período */}
            <div className="selectors">
                <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                    {meses.map((nome, index) => (
                        <option key={index} value={index + 1}>
                            {nome}
                        </option>
                    ))}
                </select>

                <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
                    {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <div>
                    <h4>Somatório</h4>
                    <span>R$ {somaNotas.toFixed(2)}</span>
                </div>
            </div>

            {isLoading ? (
                <p>Carregando notas...</p>
            ) : notas.length === 0 ? (
                <p>Nenhuma nota encontrada.</p>
            ) : (
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Emissão</th>
                            <th>Distribuidora</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notas.map((n) => (
                            <tr key={n.id}>
                                <td>{dayjs(n.data_emissao).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{n.distribuidora}</td>
                                <td>R$ {Number(n.valor_nota).toFixed(2)}</td>
                                <td>
                                    <button onClick={() => handleExcluir(n.id)} className="delete-btn">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <style jsx>{`
        .summary-card {
          background: var(--surface-strong);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 20px;
          min-height: 220px;
        }

        .summary-card.small {
          padding: 18px;
        }

        .selectors {
            display: flex;
            margin-bottom: 24px;
            gap: 15px;
        }

        select {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--surface-soft);
          color: var(--foreground);
        }

        .summary-table {
          width: 100%;
          border-collapse: collapse;
          color: var(--foreground);
        }

        .summary-table th,
        .summary-table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }

        .summary-table th {
          color: var(--muted);
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
};

export default NotasDoMes;
