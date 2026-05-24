import React from 'react';
import { ContaDetalhe } from '../services/contasService';
import { formatCurrency } from '../utils/formatter';

interface ContasAPagarModalsProps {
  selectedConta: ContaDetalhe | null;
  editingConta: ContaDetalhe | null;
  distribuidora: string;
  setDistribuidora: (value: string) => void;
  valor: string;
  setValor: (value: string) => void;
  vencimento: string;
  setVencimento: (value: string) => void;
  documento: string;
  setDocumento: (value: string) => void;
  bancoObservacoes: string;
  setBancoObservacoes: (value: string) => void;
  payModalOpen: boolean;
  payObservacao: string;
  setPayObservacao: (value: string) => void;
  onCloseSelectedConta: () => void;
  onEditar: (conta: ContaDetalhe) => void;
  onCancelEdit: () => void;
  onStartPayment: (conta: ContaDetalhe) => void;
  onConfirmPayment: () => void;
  onClosePayModal: () => void;
  onCancelPayment: (id: number) => void;
  onSave: (...args: any[]) => void;
}

const ContasAPagarModals: React.FC<ContasAPagarModalsProps> = ({
  selectedConta,
  editingConta,
  distribuidora,
  setDistribuidora,
  valor,
  setValor,
  vencimento,
  setVencimento,
  documento,
  setDocumento,
  bancoObservacoes,
  setBancoObservacoes,
  payModalOpen,
  payObservacao,
  setPayObservacao,
  onCloseSelectedConta,
  onSave,
  onEditar,
  onCancelEdit,
  onStartPayment,
  onConfirmPayment,
  onClosePayModal,
  onCancelPayment,
}) => {
  return (
    <>
      {selectedConta ? (
        <div className="modal-overlay" onClick={onCloseSelectedConta}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2>
              Detalhes da conta
              {editingConta?.id === selectedConta.id ? (
                <>
                  <button type="button" className="save-button" onClick={(event) => onSave(event)}>
                    Salvar
                  </button>
                  <button type="button" className="close-button" onClick={onCancelEdit}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="button" className="edit-button" onClick={() => onEditar(selectedConta)}>
                  Editar
                </button>
              )}
            </h2>

            <div className="modal-row">
              <strong>Distribuidora:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className="modal-edit"
                  value={distribuidora}
                  onChange={(e) => setDistribuidora(e.target.value)}
                />
              ) : (
                <span>{selectedConta.distribuidora}</span>
              )}
            </div>
            <div className="modal-row">
              <strong>Valor:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className="modal-edit"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              ) : (
                <span>R$ {formatCurrency(selectedConta.valor, 2)}</span>
              )}
            </div>
            <div className="modal-row">
              <strong>Vencimento:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className="modal-edit"
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                />
              ) : (
                <span>{selectedConta.vencimento}</span>
              )}
            </div>
            <div className="modal-row">
              <strong>Documento:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className="modal-edit"
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              ) : (
                <span>{selectedConta.documento}</span>
              )}
            </div>
            <div className="modal-row">
              <strong>Status:</strong>
              <span className={`status ${selectedConta.status.toLowerCase()}`}>{selectedConta.status}</span>
            </div>
            <div className="modal-row">
              <strong>Banco / Observações:</strong>
              {editingConta?.id === selectedConta.id ? (
                <textarea
                  className="modal-edit"
                  rows={4}
                  value={bancoObservacoes}
                  onChange={(e) => setBancoObservacoes(e.target.value)}
                />
              ) : (
                <span>{selectedConta.banco_observacoes || 'Sem observações'}</span>
              )}
            </div>
            <div className="modal-actions">
              {selectedConta.status === 'Pendente' ? (
                <button
                  type="button"
                  className="pay-button"
                  onClick={() => onStartPayment(selectedConta)}
                >
                  Pagar conta
                </button>
              ) : (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    onCancelPayment(selectedConta.id);
                    onCancelEdit();
                  }}
                >
                  Cancelar pagamento
                </button>
              )}
              <button
                type="button"
                className="close-button"
                onClick={() => {
                  onCloseSelectedConta();
                  onCancelEdit();
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {payModalOpen && (
        <div className="modal-overlay" onClick={onClosePayModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Observações do pagamento</h2>
            <textarea
              className="modal-edit"
              rows={5}
              value={payObservacao}
              autoFocus
              onChange={(e) => setPayObservacao(e.target.value)}
              placeholder="Digite observações..."
            />
            <div className="modal-actions">
              <button type="button" className="pay-button" onClick={onConfirmPayment}>
                Confirmar pagamento
              </button>
              <button type="button" className="close-button" onClick={onClosePayModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContasAPagarModals;
