import styles from '../styles/produtos.module.css';

interface ModalAjusteEstoqueProps {
  open: boolean;
  itemName: string;
  itemEstoque: number;
  quantidade: number;
  descricao: string;
  setQuantidade: React.Dispatch<React.SetStateAction<number>>;
  setDescricao: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
  onClose: () => void;
}

const ModalAjusteEstoque: React.FC<ModalAjusteEstoqueProps> = ({
  open,
  itemName,
  itemEstoque,
  quantidade,
  descricao,
  setQuantidade,
  setDescricao,
  onSave,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-ajuste-title">
      <div className={styles.modalContent}>
        <h3 id="modal-ajuste-title" className={styles.modalTitle}>Ajuste de Estoque</h3>
        <p style={{ margin: 0, color: 'var(--foreground)', fontSize: '0.95rem' }}>
          Produto: <strong>{itemName}</strong>
        </p>
        <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Estoque atual: <strong>{itemEstoque}</strong>
        </p>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="ajuste-quantidade">
            Quantidade:
          </label>
          <input
            id="ajuste-quantidade"
            type="number"
            className={styles.inputField}
            placeholder="Use valor positivo ou negativo"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="ajuste-descricao">
            Descrição:
          </label>
          <textarea
            id="ajuste-descricao"
            className={styles.textareaField}
            placeholder="Motivo do ajuste"
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.primaryButton} onClick={onSave} id="save-ajuste-btn">
            Registrar Ajuste
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onClose} id="cancel-ajuste-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAjusteEstoque;
