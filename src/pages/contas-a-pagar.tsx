import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import Agenda from '@/components/Agenda';
import Resumo from '@/components/Resumo';
import ContasAPagarHeader from '@/components/ContasAPagarHeader';
import ContasAPagarFilterPanel from '@/components/ContasAPagarFilterPanel';
import ContasAPagarForm from '@/components/ContasAPagarForm';
import parseNumber from '../utils/number';
import ContasAPagarLastTen from '@/components/ContasAPagarLastTen';
import ContasAPagarModals from '@/components/ContasAPagarModals';
import '@/styles/contas.module.css';
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

    const numericValor = parseNumber(valor);
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
    </div>
  );
};

export default ContasAPagar;
