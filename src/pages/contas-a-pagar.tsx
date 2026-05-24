import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import Agenda from '@/components/Agenda';
import Resumo from '@/components/Resumo';
import ContasAPagarHeader from '@/components/ContasAPagarHeader';
import ContasAPagarFilterPanel from '@/components/ContasAPagarFilterPanel';
import ContasAPagarForm from '@/components/ContasAPagarForm';
import ContasAPagarLastTen from '@/components/ContasAPagarLastTen';
import ContasAPagarModals from '@/components/ContasAPagarModals';
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
import { formatCurrency } from '../utils/formatter';

const hoje = dayjs().format('YYYY-MM-DD');

const ContasAPagar: React.FC = () => {
  const queryClient = useQueryClient();
  const today = new Date();
  const [ano, setAno] = useState(today.getFullYear());
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [contasMes, setContasMes] = useState<ContaDetalhe[]>([]);
  const [contasAno, setContasAno] = useState<ContaDetalhe[]>([]);
  const [distribuidora, setDistribuidora] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState(hoje);
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

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payObservacao, setPayObservacao] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDe = localStorage.getItem('filtroVencimentoDe');
      const savedAte = localStorage.getItem('filtroVencimentoAte');
      if (savedDe) setFiltroVencimentoDe(savedDe);
      if (savedAte) setFiltroVencimentoAte(savedAte);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('filtroVencimentoDe', filtroVencimentoDe);
    }
  }, [filtroVencimentoDe]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('filtroVencimentoAte', filtroVencimentoAte);
    }
  }, [filtroVencimentoAte]);

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
    setVencimento(hoje);
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
        // traz o retorno do backend para mostrar a mensagem de sucesso ou erro específico
        // o retorno do json
        const response = await registrarConta(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        if (response.error) {
          showToast(response.error, 'error');
          return;
        }
        // await registrarConta(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        showToast(response.message, 'success');
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

  const handleConfirmarPagamento = async () => {
    if (!selectedConta) return;

    try {
      await atualizarConta(
        selectedConta.id,
        selectedConta.distribuidora,
        selectedConta.valor,
        selectedConta.vencimento,
        selectedConta.documento,
        payObservacao
      );

      await pagarConta(selectedConta.id);

      showToast('Conta paga com sucesso.', 'success');

      setPayModalOpen(false);

      loadContasMes();
      loadContasAno();

      setSelectedConta(null);
    } catch (error) {
      showToast('Erro ao pagar conta.', 'error');
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
          queryClient.invalidateQueries({ queryKey: ['notas'] });
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

  return (
    <div className="contas-page">
      <ContasAPagarHeader ano={ano} mes={mes} setAno={setAno} setMes={setMes} handleBackup={handleBackup} />

      <main className="contas-grid">
        <section className="contas-panel detail-panel">
          <ContasAPagarFilterPanel
            filtroDistribuidora={filtroDistribuidora}
            setFiltroDistribuidora={setFiltroDistribuidora}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroVencimentoDe={filtroVencimentoDe}
            setFiltroVencimentoDe={setFiltroVencimentoDe}
            filtroVencimentoAte={filtroVencimentoAte}
            setFiltroVencimentoAte={setFiltroVencimentoAte}
            hoje={hoje}
            filteredContas={filteredContas}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEditar={handleEditar}
            handleStartPayment={(conta) => {
              setSelectedConta(conta);
              setPayObservacao(conta.banco_observacoes || '');
              setPayModalOpen(true);
            }}
            onClearFilters={() => {
              setFiltroDistribuidora('');
              setFiltroStatus('Todos');
              setFiltroVencimentoDe(hoje);
              setFiltroVencimentoAte(hoje);

              if (typeof window !== 'undefined') {
                localStorage.removeItem('filtroVencimentoDe');
                localStorage.removeItem('filtroVencimentoAte');
              }
            }}
          />

          <ContasAPagarForm
            distribuidora={distribuidora}
            setDistribuidora={setDistribuidora}
            valor={valor}
            setValor={setValor}
            vencimento={vencimento}
            setVencimento={setVencimento}
            documento={documento}
            setDocumento={setDocumento}
            bancoObservacoes={bancoObservacoes}
            setBancoObservacoes={setBancoObservacoes}
            editingConta={editingConta}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onImportXML={handleImportXML}
            onCancelarEdicao={handleCancelarEdicao}
            distribuidoraInputRef={distribuidoraInputRef}
          />

          <ContasAPagarLastTen
            ultimasContas={ultimasContas}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEditar={handleEditar}
          />
        </section>

        {/* #Agenda */}
        <Agenda contasMes={contasMes} contasAno={contasAno} />

        {/* #Resumo */}
        <Resumo contasAno={contasAno} ano={ano} mes={mes} setAno={setAno} setMes={setMes} />

      </main>

      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />

      <ContasAPagarModals
        selectedConta={selectedConta}
        editingConta={editingConta}
        distribuidora={distribuidora}
        setDistribuidora={setDistribuidora}
        valor={valor}
        setValor={setValor}
        vencimento={vencimento}
        setVencimento={setVencimento}
        documento={documento}
        setDocumento={setDocumento}
        bancoObservacoes={bancoObservacoes}
        setBancoObservacoes={setBancoObservacoes}
        payModalOpen={payModalOpen}
        payObservacao={payObservacao}
        setPayObservacao={setPayObservacao}
        onCloseSelectedConta={() => setSelectedConta(null)}
        onSave={handleSubmit}
        onEditar={handleEditar}
        onCancelEdit={handleCancelarEdicao}
        onStartPayment={(conta) => {
          setSelectedConta(conta);
          setPayObservacao(conta.banco_observacoes || '');
          setPayModalOpen(true);
        }}
        onConfirmPayment={() => {
          handleConfirmarPagamento();
          handleCancelarEdicao();
          setSelectedConta(null);
        }}
        onClosePayModal={() => setPayModalOpen(false)}
        onCancelPayment={handleCancelarPagamento}
      />

      <style jsx global>{`
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
          display: flex;
          grid-template-columns: 140px 1fr;
          gap: 10px;
          align-items: center;
        }

        .modal-edit {
          flex: 1;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface-strong);
          color: var(--foreground);
          padding: 12px 14px;
          outline: none;
        }

        .modal-row strong {
          min-width: 200px;
        }

        .filter-actions button {
          width: 97%;
          margin-top: 40px;
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
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
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
          min-width: 0;
        }

        .contas-panel {
          min-width: 0;
        }

        .contas-panel,
        .contas-panel > * {
          min-width: 0;
        }

        .contas-filter-panel {
          display: grid;
          gap: 24px;
          min-width: 0;
        }

        .filter-bar > div,
        .form-row > label,
        .actions-cell {
          min-width: 0;
        }

        .detail-table {
          width: 100%;
          width: 100%;
          min-width: 820px;
          margin-bottom: 24px;
        }

        .detail-table th,
        .detail-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          color: var(--foreground);
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
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

        .save-button {
          background-color: var(--accent);
          color: var(--foreground);
        }

        .cancel-button {
          background-color: var(--danger);
          color: var(--foreground);
        }

        .close-button {
          background-color: var(--muted);
          color: var(--foreground);
        }

        .view-button {
          background-color: var(--success);
          color: var(--foreground);
        }

        .edit-button {
          background-color: var(--accent);
          color: var(--foreground);
        }

        .delete-button {
          background-color: var(--danger);
          color: var(--foreground);
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
          color: var(--danger);
        }

        .status.pago {
          background: rgba(34, 197, 94, 0.18);
          color: var(--success);
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

        @media (max-width: 630px) {
          .contas-page {
            padding: 16px;
          }

          .contas-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            text-align: left;
          }

          .contas-header h1 {
            font-size: 1.4rem;
            letter-spacing: -0.02em;
          }

          .contas-header p {
            font-size: 0.85rem;
            max-width: 100%;
          }

          .contas-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .contas-actions label,
          .contas-actions button {
            width: 100%;
            min-height: 38px;
            font-size: 0.9rem;
          }

          .contas-actions label select,
          .contas-actions label input,
          .contas-actions .backup-button {
            width: 100%;
            min-width: auto;
            font-size: 0.9rem;
          }

          .contas-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .filter-bar {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .filter-bar input,
          .filter-bar select {
            font-size: 0.9rem;
          }

          .panel-header h2 {
            font-size: 1.1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .form-actions {
            flex-direction: column;
            gap: 10px;
          }

          .form-actions button {
            width: 100%;
            padding: 12px;
            font-size: 0.9rem;
          }

          .detail-table {
            min-width: auto;
            font-size: 0.8rem;
          }

          .detail-table th,
          .detail-table td {
            padding: 8px 6px;
          }

          .actions-cell {
            flex-direction: column;
            gap: 6px;
          }

          .detail-table button {
            width: 100%;
            padding: 8px;
            font-size: 0.8rem;
          }

          .modal-content {
            width: calc(100% - 16px);
            padding: 16px;
            border-radius: 14px;
          }

          .modal-row {
            flex-direction: column;
            gap: 8px;
          }

          .modal-actions {
            flex-direction: column;
            gap: 10px;
          }

          .modal-actions button {
            width: 100%;
            padding: 12px;
            font-size: 0.9rem;
          }

          .status-chip,
          .status {
            font-size: 0.75rem;
            padding: 4px 8px;
          }

          .compact-table th,
          .compact-table td {
            padding: 8px 6px;
            font-size: 0.8rem;
          }

          .empty-row {
            font-size: 0.85rem;
          }
        }

@media (max-width: 436px) {
  html, body {
    font-size: 12px; /* reduz base de tudo */
  }

  .detail-table {
    min-width: unset; /* remove largura mínima */
    display: block;
    overflow-x: auto; /* permite rolagem lateral */
    font-size: 0.7rem;
  }

  .detail-table th,
  .detail-table td {
    padding: 4px 3px;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .form-actions button,
  .contas-actions button,
  .modal-actions button {
    padding: 6px 8px; /* bem compacto */
    font-size: 0.75rem;
  }

  .contas-header h1 {
    font-size: 1rem;
  }

  .contas-header p {
    font-size: 0.75rem;
  }

  .status-chip,
  .status {
    font-size: 0.65rem;
    padding: 2px 4px;
  }
}



      `}</style>
    </div>
  );
};

export default ContasAPagar;
