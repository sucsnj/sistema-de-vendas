import styles from '../styles/produtos.module.css';
import {
    ItemData,
} from '../services/produtosService';

interface ModalProdExclusaoProps {
    open: boolean;
    item: ItemData | null;
    onConfirm: () => void;
    onClose: () => void;
}

const ModalProdExclusao: React.FC<ModalProdExclusaoProps> = ({
    open,
    item,
    onConfirm,
    onClose,
}) => {
    if (!open || !item) return null;

    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-delete-title">
            <div className={styles.modalContent}>
                <h3 id="modal-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>
                    Tem certeza de que deseja excluir o item{' '}
                    <strong>{item.nome}</strong>?
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                    Esta ação é irreversível e excluirá todos os códigos de barras associados a ele.
                </p>
                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onConfirm}
                        style={{ backgroundColor: 'var(--danger)' }}
                        id="confirm-delete-action-btn"
                    >
                        Excluir
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                        id="cancel-delete-action-btn"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ModalProdExclusao;