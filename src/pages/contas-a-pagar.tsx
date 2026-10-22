import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import Agenda from '@/components/payables/Agenda';
import Summary from '@/components/summary/Summary';
import PayablesHeader from '@/components/payables/PayablesHeader';
import PayablesFilterPanel from '@/components/payables/PayablesFilterPanel';
import PayablesForm from '@/components/payables/PayablesForm';
import parseNumber from '../utils/number';
import PayablesLastTen from '@/components/payables/PayablesLastTen';
import PayablesModals from '@/components/payables/PayablesModals';
import styles from '@/styles/contas.module.css';
import {
  fetchAccounts,
  updateAccount,
  cancelAccountPayment,
  deleteAccount,
  backupAccounts,
  payAccount,
  registerAccount,
  AccountDetails,
} from '../services/contasService';
import { highlightField } from '../utils/forms';
import { useShortcuts } from '../utils/shortcuts';
import { getDateArray, toTimestamp, now } from '../utils/date';
import { validateRequired, validateCurrency } from '../utils/validation';

const hoje = now().format('YYYY-MM-DD');

// Componente React.
const Payables: React.FC = () => {
  const queryClient = useQueryClient();
  const [ano, setAno] = useState(getDateArray()[2]);
  const [mes, setMes] = useState(getDateArray()[1]);
  const [contasMes, setContasMes] = useState<AccountDetails[]>([]);
  const [contasAno, setContasAno] = useState<AccountDetails[]>([]);
  const [distribuidora, setDistribuidora] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState(hoje);
  const [documento, setDocumento] = useState('');
  const [bancoObservacoes, setBancoObservacoes] = useState('');
  const [editingConta, setEditingConta] = useState<AccountDetails | null>(null);
  const [selectedConta, setSelectedConta] = useState<AccountDetails | null>(null);
  const [filtroDistribuidora, setFiltroDistribuidora] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [filtroVencimentoDe, setFiltroVencimentoDe] = useState(() => {
    if (typeof window === 'undefined') return hoje;
    return localStorage.getItem('filtroVencimentoDe') || hoje;
  });
  const [filtroVencimentoAte, setFiltroVencimentoAte] = useState(() => {
    if (typeof window === 'undefined') return hoje;
    return localStorage.getItem('filtroVencimentoAte') || hoje;
  });
  const distribuidoraInputRef = useRef<HTMLInputElement | null>(null);
  const valorInputRef = useRef<HTMLInputElement | null>(null);
  const dataInputRef = useRef<HTMLInputElement | null>(null);
  const documentoInputRef = useRef<HTMLInputElement | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payObservacao, setPayObservacao] = useState('');

  const handleDueDateFromChange = (value: string) => {
    setFiltroVencimentoDe(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('filtroVencimentoDe', value);
      if (value > filtroVencimentoAte) {
        localStorage.setItem('filtroVencimentoAte', value);
      }
    }
    if (value > filtroVencimentoAte) {
      setFiltroVencimentoAte(value);
    }
  };

  const handleDueDateToChange = (value: string) => {
    setFiltroVencimentoAte(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('filtroVencimentoAte', value);
      if (value < filtroVencimentoDe) {
        localStorage.setItem('filtroVencimentoDe', value);
      }
    }
    if (value < filtroVencimentoDe) {
      setFiltroVencimentoDe(value);
    }
  };

  const { showToast } = useToast();

  const loadContasMes = useCallback(async () => {
    try {
      const data = await fetchAccounts(ano, mes);
      setContasMes(data);
    } catch {
      showToast('Não foi possível carregar as contas do mês.', 'error');
    }
  }, [ano, mes, showToast]);

  const loadContasAno = useCallback(async () => {
    try {
      const data = await fetchAccounts(ano);
      setContasAno(data);
    } catch {
      showToast('Não foi possível carregar o resumo anual.', 'error');
    }
  }, [ano, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContasMes();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadContasMes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContasAno();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadContasAno]);

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

    // Validações de campos obrigatórios e formato (contrato ADR 0002)
    const distribuidoraCheck = validateRequired(distribuidora, 'Distribuidora');
    if (!distribuidoraCheck.ok) {
      showToast(distribuidoraCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(distribuidoraInputRef);
      return;
    }

    const valorCheck = validateRequired(valor, 'Valor');
    if (!valorCheck.ok) {
      showToast(valorCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(valorInputRef);
      return;
    }

    const valorFormato = validateCurrency(valor);
    if (!valorFormato.ok) {
      showToast(valorFormato.message ?? 'Valor inválido.', 'error');
      highlightField(valorInputRef);
      return;
    }

    const vencimentoCheck = validateRequired(vencimento, 'Vencimento');
    if (!vencimentoCheck.ok) {
      showToast(vencimentoCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(dataInputRef);
      return;
    }

    const documentoCheck = validateRequired(documento, 'Documento');
    if (!documentoCheck.ok) {
      showToast(documentoCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(documentoInputRef);
      return;
    }

    const numericValor = parseNumber(valor);
    if (Number.isNaN(numericValor) || numericValor <= 0) {
      showToast('Valor deve ser um número maior que zero.', 'error');
      return;
    }

    try {
      if (editingConta) {
        await updateAccount(
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
        const response = await registerAccount(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        if (response.error) {
          showToast(response.error, 'error');
          return;
        }
        // await registerAccount(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        showToast(response.message, 'success');
      }

      resetForm();
      loadContasMes();
      loadContasAno();
    } catch {
      showToast('Erro ao salvar a conta.', 'error');
    }
  };

  const handleEdit = (account: AccountDetails) => {
    setEditingConta(account);
    setDistribuidora(account.distribuidora);
    setValor(account.valor.toFixed(2));
    setVencimento(account.vencimento);
    setDocumento(account.documento);
    setBancoObservacoes(account.banco_observacoes ?? '');
    distribuidoraInputRef.current?.focus();
  };

  const handleCancelEdit = () => resetForm();

  const handleView = (account: AccountDetails) => setSelectedConta(account);

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount(id);
      showToast('Conta excluída com sucesso.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta((current) => (current?.id === id ? null : current));
    } catch {
      showToast('Erro ao excluir a conta.', 'error');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedConta) return;

    try {
      await updateAccount(
        selectedConta.id,
        selectedConta.distribuidora,
        selectedConta.valor,
        selectedConta.vencimento,
        selectedConta.documento,
        payObservacao
      );

      await payAccount(selectedConta.id);

      showToast('Conta paga com sucesso.', 'success');

      setPayModalOpen(false);

      loadContasMes();
      loadContasAno();

      setSelectedConta(null);
    } catch {
      showToast('Erro ao pagar conta.', 'error');
    }
  };

  const handleCancelPayment = async (id: number) => {
    try {
      await cancelAccountPayment(id);
      showToast('Pagamento cancelado e conta voltou a Pendente.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta(null);
    } catch {
      showToast('Erro ao cancelar o pagamento.', 'error');
    }
  };

  const handleBackup = async () => {
    try {
      const result = await backupAccounts();
      showToast(result.message || 'Backup criado com sucesso.', 'success');
    } catch {
      showToast('Erro ao fazer backup das contas.', 'error');
    }
  };

  // Função para importação de XML
  const handleImportXML = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xml';
      fileInput.onchange = async (event: Event) => {
        const files = (event.target as HTMLInputElement).files;
        const file = files?.[0];
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
    return contasAno.filter((account) => {
      const matchesDistribuidora = account.distribuidora
        .toLowerCase()
        .includes(filtroDistribuidora.toLowerCase());
      const matchesStatus = filtroStatus === 'Todos' || account.status === filtroStatus;
      const matchesVencimentoDe = filtroVencimentoDe ? account.vencimento >= filtroVencimentoDe : true;
      const matchesVencimentoAte = filtroVencimentoAte ? account.vencimento <= filtroVencimentoAte : true;
      return matchesDistribuidora && matchesStatus && matchesVencimentoDe && matchesVencimentoAte;
    });
  }, [contasAno, filtroDistribuidora, filtroStatus, filtroVencimentoDe, filtroVencimentoAte]);

  const ultimasContas = useMemo(() => {
    return [...contasAno]
      .sort((a, b) => {
        const dateA = toTimestamp(a.criado_em || '1970-01-01T00:00:00');
        const dateB = toTimestamp(b.criado_em || '1970-01-01T00:00:00');
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [contasAno]);

  // Limpa formulário de registro de conta ao pressionar esc
  useShortcuts(['Escape'], () => {
    resetForm();
  });

  return (
    <div className={styles.contasPage}>
      <PayablesHeader year={ano} month={mes} setYear={setAno} setMonth={setMes} handleBackup={handleBackup} />

      <main className={styles.contasGrid}>
        <section className={`${styles.contasPanel} ${styles.detailPanel}`}>
          <PayablesFilterPanel
            distributorFilter={filtroDistribuidora}
            setDistributorFilter={setFiltroDistribuidora}
            statusFilter={filtroStatus}
            setStatusFilter={setFiltroStatus}
            dueDateFromFilter={filtroVencimentoDe}
            setDueDateFromFilter={handleDueDateFromChange}
            dueDateToFilter={filtroVencimentoAte}
            setDueDateToFilter={handleDueDateToChange}
            today={hoje}
            filteredAccounts={filteredContas}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleStartPayment={(account) => {
              setSelectedConta(account);
              setPayObservacao(account.banco_observacoes || '');
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

          <PayablesForm
            distributor={distribuidora}
            setDistributor={setDistribuidora}
            amount={valor}
            setAmount={setValor}
            dueDate={vencimento}
            setDueDate={setVencimento}
            document={documento}
            setDocument={setDocumento}
            bankNotes={bancoObservacoes}
            setBankNotes={setBancoObservacoes}
            editingAccount={editingConta}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onImportXML={handleImportXML}
            onCancelEdit={handleCancelEdit}
            distributorInputRef={distribuidoraInputRef}
            amountInputRef={valorInputRef}
            dataInputRef={dataInputRef}
            documentInputRef={documentoInputRef}
          />

          <PayablesLastTen
            latestAccounts={ultimasContas}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        </section>

        {/* #Agenda */}
        <Agenda accountsMonth={contasMes} accountsYear={contasAno} />

        {/* #Resumo */}
        <Summary accountsYear={contasAno} year={ano} month={mes} setYear={setAno} setMonth={setMes} />

      </main>

      <PayablesModals
        selectedAccount={selectedConta}
        editingAccount={editingConta}
        distributor={distribuidora}
        setDistributor={setDistribuidora}
        amount={valor}
        setAmount={setValor}
        dueDate={vencimento}
        setDueDate={setVencimento}
        document={documento}
        setDocument={setDocumento}
        bankNotes={bancoObservacoes}
        setBankNotes={setBancoObservacoes}
        payModalOpen={payModalOpen}
        paymentNotes={payObservacao}
        setPaymentNotes={setPayObservacao}
        onCloseSelectedAccount={() => setSelectedConta(null)}
        onSave={handleSubmit}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onStartPayment={(account) => {
          setSelectedConta(account);
          setPayObservacao(account.banco_observacoes || '');
          setPayModalOpen(true);
        }}
        onConfirmPayment={() => {
          handleConfirmPayment();
          handleCancelEdit();
          setSelectedConta(null);
        }}
        onClosePayModal={() => setPayModalOpen(false)}
        onCancelPayment={handleCancelPayment}
      />
    </div>
  );
};

export default Payables;
