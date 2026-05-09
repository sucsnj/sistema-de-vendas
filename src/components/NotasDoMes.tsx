import { useEffect, useState } from 'react';
import { buscarNotasPorPeriodo, excluirNota, NotaDetalhe } from '../services/notasService';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const NotasDoMes: React.FC = () => {
    const [ano, setAno] = useState(dayjs().year());
    const [mes, setMes] = useState(dayjs().month() + 1);
    const [notas, setNotas] = useState<NotaDetalhe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotas = async () => {
            try {
                const data = await buscarNotasPorPeriodo(ano, mes);
                setNotas(Array.isArray(data) ? data : [data]);
            } catch (error) {
                console.error('Erro ao buscar notas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotas();
    }, [ano, mes]);

    const handleExcluir = async (id: number) => {
        try {
            await excluirNota(id);
            setNotas((prev) => prev.filter((n) => n.id !== id));
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
            </div>

            {loading ? (
                <p>Carregando notas...</p>
            ) : notas.length === 0 ? (
                <p>Nenhuma nota encontrada.</p>
            ) : (
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notas.map((n) => (
                            <tr key={n.id}>
                                {/* <td>{dayjs(n.data_emissao).format('MMMM').replace(/^\w/, c => c.toUpperCase())}</td> */}
                                <td>{dayjs(n.data_emissao).format('DD/MM/YYYY')}</td>
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
          gap: 10px;
          margin-bottom: 12px;
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
