import { useEffect, useMemo, useRef, useState } from 'react';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import {
  buscarContas,
  atualizarConta,
  cancelarPagamentoConta,
  excluirConta,
  fazerBackupContas,
  pagarConta,
  registrarConta,
  ContaDetalhe,
} from '../services/contasService';

const hoje = dayjs().format('YYYY-MM-DD');

const ContasAPagar: React.FC = () => {
  const today = new Date();
  const [ano, setAno] = useState(today.getFullYear());
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [contasMes, setContasMes] = useState<ContaDetalhe[]>([]);
  const [contasAno, setContasAno] = useState<ContaDetalhe[]>([]);
  const [distribuidora, setDistribuidora] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState(today.toISOString().split('T')[0]);
  const [documento, setDocumento] = useState('');
  const [bancoObservacoes, setBancoObservacoes] = useState('');
  const [editingConta, setEditingConta] = useState<ContaDetalhe | null>(null);
  const [selectedConta, setSelectedConta] = useState<ContaDetalhe | null>(null);
  const [filtroDistribuidora, setFiltroDistribuidora] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [filtroVencimentoDe, setFiltroVencimentoDe] = useState(hoje);
  const [filtroVencimentoAte, setFiltroVencimentoAte] = useState(hoje);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const distribuidoraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadContasMes();
  }, [mes, ano]);

  useEffect(() => {
    loadContasAno();
  }, [ano]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => setToastOpen(false);

  const loadContasMes = async () => {
    try {
      const data = await buscarContas(ano, mes);
      setContasMes(data);
    } catch (error) {
      showToast('Não foi possível carregar as contas do mês.', 'error');
    }
  };

  const loadContasAno = async () => {
    try {
      const data = await buscarContas(ano);
      setContasAno(data);
    } catch (error) {
      showToast('Não foi possível carregar o resumo anual.', 'error');
    }
  };

  const resetForm = () => {
    setDistribuidora('');
    setValor('');
    setVencimento(today.toISOString().split('T')[0]);
    setDocumento('');
    setBancoObservacoes('');
    setEditingConta(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!distribuidora || !valor || !vencimento || !documento) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const numericValor = parseFloat(valor);
    if (Number.isNaN(numericValor) || numericValor <= 0) {
      showToast('Valor deve ser um número maior que zero.', 'error');
      return;
    }

    try {
      if (editingConta) {
        await atualizarConta(
          editingConta.id,
          distribuidora,
          numericValor,
          vencimento,
          documento,
          bancoObservacoes,
        );
        showToast('Conta atualizada com sucesso.', 'success');
      } else {
        await registrarConta(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        showToast('Conta registrada com sucesso.', 'success');
      }

      resetForm();
      loadContasMes();
      loadContasAno();
    } catch (error) {
      showToast('Erro ao salvar a conta.', 'error');
    }
  };

  const handleEditar = (conta: ContaDetalhe) => {
    setEditingConta(conta);
    setDistribuidora(conta.distribuidora);
    setValor(conta.valor.toFixed(2));
    setVencimento(conta.vencimento);
    setDocumento(conta.documento);
    setBancoObservacoes(conta.banco_observacoes ?? '');
    distribuidoraInputRef.current?.focus();
  };

  const handleCancelarEdicao = () => resetForm();

  const handleView = (conta: ContaDetalhe) => setSelectedConta(conta);

  const handleDelete = async (id: number) => {
    try {
      await excluirConta(id);
      showToast('Conta excluída com sucesso.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta((current) => (current?.id === id ? null : current));
    } catch (error) {
      showToast('Erro ao excluir a conta.', 'error');
    }
  };

  const handlePagar = async (id: number) => {
    try {
      await pagarConta(id);
      showToast('Conta marcada como paga.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta(null);
    } catch (error) {
      showToast('Erro ao pagar a conta.', 'error');
    }
  };

  const handleCancelarPagamento = async (id: number) => {
    try {
      await cancelarPagamentoConta(id);
      showToast('Pagamento cancelado e conta voltou a Pendente.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta(null);
    } catch (error) {
      showToast('Erro ao cancelar o pagamento.', 'error');
    }
  };

  const handleBackup = async () => {
    try {
      const result = await fazerBackupContas();
      showToast(result.message || 'Backup criado com sucesso.', 'success');
    } catch (error) {
      showToast('Erro ao fazer backup das contas.', 'error');
    }
  };

  // Função reservada para futura implementação de importação XML
  const handleImportXML = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xml';
      fileInput.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const text = await file.text();

        const response = await fetch('/api/contas/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xml: text }),
        });

        const result = await response.json();

        if (result.sucesso) {
          showToast(`Importação concluída: ${result.registros.length} registros inseridos`, 'success');
          // Atualiza imediatamente a UI
          await loadContasMes();
          await loadContasAno();
        } else {
          showToast(`Erro: ${result.error || 'Falha ao importar XML'}`, 'error');
        }
      };
      fileInput.click();
    } catch (error) {
      showToast('Erro ao importar XML', 'error');
      console.error(error);
    }
  };

  const filteredContas = useMemo(() => {
    return contasAno.filter((conta) => {
      const matchesDistribuidora = conta.distribuidora
        .toLowerCase()
        .includes(filtroDistribuidora.toLowerCase());
      const matchesStatus = filtroStatus === 'Todos' || conta.status === filtroStatus;
      const matchesVencimentoDe = filtroVencimentoDe ? conta.vencimento >= filtroVencimentoDe : true;
      const matchesVencimentoAte = filtroVencimentoAte ? conta.vencimento <= filtroVencimentoAte : true;
      return matchesDistribuidora && matchesStatus && matchesVencimentoDe && matchesVencimentoAte;
    });
  }, [contasAno, filtroDistribuidora, filtroStatus, filtroVencimentoDe, filtroVencimentoAte]);

  const ultimasContas = useMemo(() => {
    return [...contasAno]
      .sort((a, b) => {
        const dateA = new Date(a.criado_em || '1970-01-01T00:00:00').getTime();
        const dateB = new Date(b.criado_em || '1970-01-01T00:00:00').getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [contasAno]);

  const agenda = useMemo(() => {
    const map = new Map<string, { data: string; totalPendente: number }>();
    contasMes.forEach((conta) => {
      const current = map.get(conta.vencimento) ?? { data: conta.vencimento, totalPendente: 0 };
      if (conta.status === 'Pendente') {
        current.totalPendente += conta.valor;
      }
      map.set(conta.vencimento, current);
    });

    return Array.from(map.values()).sort((a, b) => (a.data < b.data ? 1 : -1));
  }, [contasMes]);

  // Lista de contas pendentes que serão pagas na próxima semana
  const proximasContas = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    return contasAno
      .filter((conta) => conta.status === 'Pendente' && conta.vencimento >= '1970-01-01') // só pendentes
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()) // ordenar por vencimento
      .filter((conta) => conta.vencimento >= hoje) // apenas vencimentos futuros ou iguais a hoje
      .slice(0, 12); // pegar só as 12 primeiras
  }, [contasAno]);

  const resumo = useMemo(() => {
    const totalPago = contasAno.filter((conta) => conta.status === 'Pago').reduce((sum, conta) => sum + conta.valor, 0);
    const totalPendente = contasAno.filter((conta) => conta.status === 'Pendente').reduce((sum, conta) => sum + conta.valor, 0);
    const totaisPorDistribuidora = contasAno.reduce<Record<string, number>>((acc, conta) => {
      if (conta.status === 'Pendente') {
        acc[conta.distribuidora] = (acc[conta.distribuidora] || 0) + conta.valor;
      }
      return acc;
    }, {});

    const meses = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      const contasNoMes = contasAno.filter((conta) => new Date(`${conta.vencimento}T00:00:00`).getMonth() + 1 === monthIndex);
      return {
        mes: monthIndex,
        pago: contasNoMes.filter((conta) => conta.status === 'Pago').reduce((sum, conta) => sum + conta.valor, 0),
        pendente: contasNoMes.filter((conta) => conta.status === 'Pendente').reduce((sum, conta) => sum + conta.valor, 0),
      };
    });

    return {
      totalPago,
      totalPendente,
      totalAnual: totalPago + totalPendente,
      meses,
      totaisPorDistribuidora,
    };
  }, [contasAno]);

  return (
    <div className="contas-page">
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

      <main className="contas-grid">
        <section className="contas-panel detail-panel">
          <div className="panel-header">
            <h2>Detalhe</h2>
            <span className="status-chip">Filtro</span>
          </div>

          <div className="detail-table-wrapper">
            <div className="filter-bar">
              <div>
                <label>
                  Distribuidora
                  <input
                    type="text"
                    placeholder="Filtrar por distribuidora"
                    value={filtroDistribuidora}
                    onChange={(e) => setFiltroDistribuidora(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Status
                  <select className="status-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Pendente' | 'Pago')}>
                    <option value="Todos">Todos</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Vencimento de
                  <input
                    type="date"
                    value={filtroVencimentoDe}
                    onChange={(e) => setFiltroVencimentoDe(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  até
                  <input
                    type="date"
                    value={filtroVencimentoAte}
                    onChange={(e) => setFiltroVencimentoAte(e.target.value)}
                  />
                </label>
              </div>
              <div className="filter-actions">
                <button type="button" onClick={() => {
                  setFiltroDistribuidora('');
                  setFiltroStatus('Todos');
                  setFiltroVencimentoDe(hoje);
                  setFiltroVencimentoAte(hoje);
                }}>
                  Limpar filtros
                </button>
              </div>
            </div>
            <h3>Contas do mês</h3>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Distribuidora</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Documento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContas.map((conta) => (
                  <tr key={conta.id}>
                    <td>{conta.distribuidora}</td>
                    <td>R$ {conta.valor.toFixed(2)}</td>
                    <td>{conta.vencimento}</td>
                    <td>{conta.documento}</td>
                    <td>
                      <span className={`status ${conta.status.toLowerCase()}`}>{conta.status}</span>
                    </td>
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
                      {conta.status === 'Pendente' ? (
                        <button type="button" className="pay-button" onClick={() => handlePagar(conta.id)}>
                          Pagar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {filteredContas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      Nenhuma conta encontrada para o período selecionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleSubmit} className="contas-form">
            <div className="form-row">
              <label>
                Distribuidora
                <input
                  ref={distribuidoraInputRef}
                  type="text"
                  value={distribuidora}
                  onChange={(e) => setDistribuidora(e.target.value)}
                  required
                />
              </label>
              <label>
                Valor
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </label>
              <label>
                Vencimento
                <input
                  type="date"
                  value={hoje} // data atual
                  onChange={(e) => setVencimento(e.target.value)}
                  required
                />
              </label>
              <label>
                Documento
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Banco / Observações
              <textarea
                rows={4}
                value={bancoObservacoes}
                onChange={(e) => setBancoObservacoes(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">{editingConta ? 'Salvar Alteração' : 'Cadastrar Conta'}</button>
              <button type="button" className="secondary" onClick={resetForm}>
                Limpar Campos
              </button>
              <button type="button" className="secondary" onClick={handleImportXML}>
                Importar XML
              </button>
              {editingConta ? (
                <button type="button" className="secondary" onClick={handleCancelarEdicao}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="last-ten-panel">
            <h3>Últimas 10 contas registradas</h3>
            <table className="detail-table compact-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Distribuidora</th>
                  <th>Valor</th>
                  <th>Status</th>
                  {/* nova coluna */}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ultimasContas.map((conta) => (
                  <tr key={conta.id}>
                    <td>{conta.criado_em?.split('T')[0] || conta.vencimento}</td>
                    <td>{conta.distribuidora}</td>
                    <td>R$ {conta.valor.toFixed(2)}</td>
                    <td>
                      <span className={`status ${conta.status.toLowerCase()}`}>{conta.status}</span>
                    </td>
                    <td className="actions-cell">
                      <button type="button" className="view-button" onClick={() => handleView(conta)}>Ver</button>
                      <button type="button" className="delete-button" onClick={() => handleDelete(conta.id)}>Excluir</button>
                      <button type="button" className="edit-button" onClick={() => handleEditar(conta)}>Editar</button>
                    </td>
                  </tr>
                ))}
                {ultimasContas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      Nenhuma conta registrada ainda.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="contas-panel agenda-panel">
          <div className="panel-header">
            <h2>Agenda</h2>
            <span className="status-chip">Atualização automática</span>
          </div>
          <div className="agenda-card">
            <h3>Total pendente por vencimento</h3>
            <div className="agenda-list">
              {agenda.length === 0 ? (
                <p>Nenhum vencimento registrado neste mês.</p>
              ) : (
                agenda.map((item) => (
                  <div key={item.data} className="agenda-row">
                    <strong>{item.data}</strong>
                    <span>R$ {item.totalPendente.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <section className="contas-panel proximas-panel">
            <div className="panel-header">
              <h3>Próximas contas a vencer</h3>
            </div>
            <div className="proximas-list">
              {proximasContas.length === 0 ? (
                <p>Nenhuma conta pendente encontrada.</p>
              ) : (
                proximasContas.map((conta) => (
                  <div key={conta.id} className="proxima-row">
                    <strong>{conta.vencimento}</strong> - {conta.distribuidora} - <span>R$ {conta.valor.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>

        <section className="contas-panel resumo-panel">
          <div className="panel-header">
            <h2>Resumo</h2>
            <span className="status-chip">Atualização automática</span>
          </div>
          <div className="summary-card">
            <div className="summary-row">
              <strong>Total pago</strong>
              <span>R$ {resumo.totalPago.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <strong>Total pendente</strong>
              <span>R$ {resumo.totalPendente.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <strong>Total acumulado anual</strong>
              <span>R$ {resumo.totalAnual.toFixed(2)}</span>
            </div>
          </div>
          <div className="summary-card small">
            <h3>Totais por distribuidora</h3>
            {Object.keys(resumo.totaisPorDistribuidora).length === 0 ? (
              <p>Sem pendências por distribuidora.</p>
            ) : (
              <ul>
                {Object.entries(resumo.totaisPorDistribuidora).map(([nome, valor]) => (
                  <li key={nome}>
                    {nome}: R$ {valor.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="summary-card small">
            <h3>Consolidação mensal</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Pago</th>
                  <th>Pendente</th>
                </tr>
              </thead>
              <tbody>
                {resumo.meses.map((m) => (
                  <tr key={m.mes}>
                    <td>{new Date(0, m.mes - 1).toLocaleString('pt-BR', { month: 'short' })}</td>
                    <td>R$ {m.pago.toFixed(2)}</td>
                    <td>R$ {m.pendente.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />

      {selectedConta ? (
        <div className="modal-overlay" onClick={() => setSelectedConta(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2>Detalhes da conta</h2>
            <div className="modal-row">
              <strong>Distribuidora:</strong>
              <span>{selectedConta.distribuidora}</span>
            </div>
            <div className="modal-row">
              <strong>Valor:</strong>
              <span>R$ {selectedConta.valor.toFixed(2)}</span>
            </div>
            <div className="modal-row">
              <strong>Vencimento:</strong>
              <span>{selectedConta.vencimento}</span>
            </div>
            <div className="modal-row">
              <strong>Documento:</strong>
              <span>{selectedConta.documento}</span>
            </div>
            <div className="modal-row">
              <strong>Status:</strong>
              <span>{selectedConta.status}</span>
            </div>
            <div className="modal-row">
              <strong>Banco / Observações:</strong>
              <span>{selectedConta.banco_observacoes || 'Sem observações'}</span>
            </div>
            <div className="modal-actions">
              {selectedConta.status === 'Pendente' ? (
                <button type="button" className="pay-button" onClick={() => handlePagar(selectedConta.id)}>
                  Pagar conta
                </button>
              ) : (
                <button type="button" className="cancel-button" onClick={() => handleCancelarPagamento(selectedConta.id)}>
                  Cancelar pagamento
                </button>
              )}
              <button type="button" className="close-button" onClick={() => setSelectedConta(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .contas-page {
          padding: 24px;
          min-height: 100vh;
          background: var(--background);
          color: var(--foreground);
        }

        .contas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .contas-header h1 {
          margin: 0 0 8px;
          font-size: 2.2rem;
          letter-spacing: -0.04em;
        }

        .contas-header p {
          margin: 0;
          max-width: 560px;
          color: var(--muted);
        }

        .contas-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-end; /* Alinha os itens ao final para melhor alinhamento visual do label Ano, Mês e botão Backup */
        }

        .contas-actions label,
        .contas-actions button {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--foreground);
          min-height: 46px;
        }

        .contas-actions label select,
        .contas-actions label input,
        .contas-actions .backup-button {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface-soft);
          color: var(--foreground);
          min-width: 130px;
          height: 42px;
        }

        .contas-actions .backup-button {
          border: none;
          background: var(--accent);
          color: white;
          margin-bottom: 8px;
          cursor: pointer;
          font-weight: 700;
          min-width: auto;
        }

        .ano-input {
          margin-top: 0px; /* Remove margem excessiva do input do ano para melhor alinhamento */
        }

        .mes-select {
          margin-bottom: 8px; /* Ajuste para alinhar o select do mês com os outros elementos */
        }

        .backup-button {
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          background: var(--accent);
          color: white;
          cursor: pointer;
          font-weight: 700;
        }

        .contas-grid {
          display: grid;
          grid-template-columns: minmax(0, 2.4fr) minmax(300px, 1fr);
          gap: 22px;
          align-items: start;
        }

        .filter-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          align-items: start;
          margin-bottom: 20px;
        }

        .filter-bar label {
          margin-bottom: 0;
          align-items: flex-start;
        }

        .status-select {
          margin-top: 8px; /* Ajuste para alinhar o select de Status com os outros campos de filtro */
        }

        .filter-bar input,
        .filter-bar select {
          width: 100%;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .form-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .modal-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 10px;
          align-items: center;
        }

        .filter-actions button {
          width: 100%;
          margin-top: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--foreground);
        }

        .last-ten-panel {
          margin-top: 24px;
        }

        .compact-table th,
        .compact-table td {
          padding: 10px 8px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          width: min(560px, calc(100% - 32px));
          background: var(--surface-strong);
          color: var(--foreground);
          border-radius: 20px;
          padding: 28px;
          box-shadow: var(--shadow);
        }

        .modal-row {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .modal-row strong {
          color: var(--muted);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .modal-actions button {
          padding: 12px 18px;
          border-radius: 12px;
          border: none;
          background: var(--accent);
          color: white;
          cursor: pointer;
        }

        .contas-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 22px;
          box-shadow: var(--shadow);
        }

        .detail-panel {
          grid-column: 1 / 2;
        }

        .agenda-panel,
        .resumo-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.4rem;
        }

        .status-chip {
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--surface-soft);
          color: var(--muted);
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .contas-form {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.95rem;
          color: var(--foreground);
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface-strong);
          color: var(--foreground);
          padding: 12px 14px;
          outline: none;
        }

        textarea {
          min-height: 50px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .form-actions button {
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          cursor: pointer;
          font-weight: 700;
        }

        .form-actions button:first-of-type {
          background: var(--success);
          color: white;
        }

        .form-actions .secondary {
          background: var(--surface-soft);
          color: var(--foreground);
        }

        .detail-table-wrapper {
          overflow-x: auto;
        }

        .detail-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 860px;
          margin-bottom: 24px;
        }

        .detail-table th,
        .detail-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          color: var(--foreground);
        }

        .detail-table th {
          color: var(--muted);
          font-weight: 600;
        }

        .actions-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .detail-table button {
          border: none;
          border-radius: 12px;
          padding: 10px 12px;
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .detail-table button:hover {
          opacity: 0.95;
        }

        .detail-table button:nth-of-type(1) {
          background: var(--accent);
        }

        .detail-table button:nth-of-type(2) {
          background: var(--danger);
        }

        .pay-button {
          background: var(--success);
        }

        .cancel-button {
          background-color: #3498db;
          color: #fff;
        }

        .close-button {
          background-color: #dfaea9;
          color: #fff;
        }

        .view-button {
          background-color: #27cd6c;
          color: #fff;
        }

        .edit-button {
          background-color: #ecd165;
          color: #fff;
        }

        .delete-button {
          background-color: #ed8a34;
          color: #fff;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .status.pendente {
          background: rgba(248, 113, 113, 0.18);
          color: #b91c1c;
        }

        .status.pago {
          background: rgba(34, 197, 94, 0.18);
          color: #166534;
        }

        .agenda-card,
        .summary-card {
          background: var(--surface-strong);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 20px;
          min-height: 220px;
        }

        .agenda-list {
          display: grid;
          gap: 14px;
        }

        .agenda-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 18px;
          background: var(--surface-soft);
        }

        .summary-card.small {
          padding: 18px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-card h3 {
          margin: 0 0 14px;
          font-size: 1rem;
          color: var(--muted);
        }

        .summary-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .summary-card ul li {
          color: var(--foreground);
          font-size: 0.95rem;
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

        .empty-row {
          padding: 24px 0;
          text-align: center;
          color: var(--muted);
        }

        @media (max-width: 1180px) {
          .contas-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 840px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .contas-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .contas-actions label,
          .contas-actions button {
            width: 100%;
          }

          .filter-bar {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </div>
  );
};

export default ContasAPagar;
