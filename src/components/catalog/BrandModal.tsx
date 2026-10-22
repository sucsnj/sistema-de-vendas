import { useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';

interface BrandModalProps {
    setBrandModalOpen: (value: boolean) => void;
    newBrandName: string;
    setNewBrandName: (value: string) => void;
    handleSaveBrand: (e: React.FormEvent) => void;
}

const BrandModal: React.FC<BrandModalProps> = ({
    setBrandModalOpen,
    newBrandName,
    setNewBrandName,
    handleSaveBrand,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-marca-title" tabIndex={-1}>
                <h3 id="modal-marca-title" className={styles.modalTitle}>Adicionar Marca</h3>
                <form onSubmit={handleSaveBrand} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-marca-nome">
                            Nome:*
                        </label>
                        <input
                            id="new-marca-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da marca"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.primaryButton} id="save-new-marca-btn">
                            Salvar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                setBrandModalOpen(false);
                                setNewBrandName('');
                            }}
                            id="cancel-new-marca-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default BrandModal;