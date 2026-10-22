import React from 'react';
import styles from '../../styles/contas.module.css';
import { AccountDetails } from '../../services/contasService';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ImportExportIcon from '@mui/icons-material/ImportExport';

interface PayablesFormProps {
  distributor: string;
  setDistributor: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  document: string;
  setDocument: (value: string) => void;
  bankNotes: string;
  setBankNotes: (value: string) => void;
  editingAccount: AccountDetails | null;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onReset: () => void;
  onImportXML: () => Promise<void>;
  onCancelEdit: () => void;
  distributorInputRef: React.RefObject<HTMLInputElement | null>;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  dataInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
}

const PayablesForm: React.FC<PayablesFormProps> = ({
  distributor,
  setDistributor,
  amount,
  setAmount,
  dueDate,
  setDueDate,
  document,
  setDocument,
  bankNotes,
  setBankNotes,
  editingAccount,
  onSubmit,
  onReset,
  onImportXML,
  onCancelEdit,
  distributorInputRef,
  amountInputRef,
  dataInputRef,
  documentInputRef,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.contasForm}>
      <div className={styles.formRow}>
        <label>
          Distribuidora
          <input
            ref={distributorInputRef}
            type="text"
            value={distributor}
            onChange={(e) => setDistributor(e.target.value)}
          />
        </label>
        <label>
          Valor
          <input
            ref={amountInputRef}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label>
          Vencimento
          <input
            ref={dataInputRef}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <label>
          Documento
          <input
            ref={documentInputRef}
            type="text"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
          />
        </label>
      </div>
      <label>
        Banco / Observações
        <textarea
          rows={4}
          value={bankNotes}
          onChange={(e) => setBankNotes(e.target.value)}
        />
      </label>
      <div className={styles.formActions}>
        <button type="submit">
          <NoteAddIcon className="material-icon" />
          {editingAccount ? 'Salvar Alteração' : 'Cadastrar Conta'}</button>
        <button type="button" className={styles.secondary} onClick={onReset}>
          <ClearAllIcon className="material-icon" />
          Limpar Campos
        </button>
        <button type="button" className={styles.secondary} onClick={onImportXML}>
          <ImportExportIcon className="material-icon" />
          Importar XML
        </button>
        {editingAccount ? (
            <button type="button" className={styles.secondary} onClick={onCancelEdit}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default PayablesForm;
