import { useState, useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import { BrandDeleteModal } from '@/components/products/ProductDeleteModal';

export interface BrandFormData {
    name: string;
}

export interface BrandOptions {
    openBrandModal: () => void;
    saveBrand: React.FormEventHandler<HTMLFormElement>;
}

interface BrandEditModalProps {
    brandForm: BrandFormData;
    setBrandForm: React.Dispatch<React.SetStateAction<BrandFormData>>;
    onDelete: () => void;
    options: BrandOptions;
}

const BrandEditModal: React.FC<BrandEditModalProps> = ({
    brandForm,
    setBrandForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-mar-edit-title" tabIndex={-1}>
                <h3 id="modal-mar-edit-title" className={styles.modalTitle}>Editar Marca</h3>
                <form onSubmit={options.saveBrand} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-mar-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-mar-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da marca"
                            value={brandForm.name}
                            onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                                setDeleteConfirmOpen(true)
                            }}
                            id="confirm-delete-action-btn"
                        >
                            Excluir
                        </button>
                        <button type="submit" className={styles.primaryButton} id="update-mar-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.openBrandModal();
                                setBrandForm({ name: '' });
                            }}
                            id="cancel-edit-mar-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <BrandDeleteModal
                    open={deleteConfirmOpen}
                    brand={brandForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.openBrandModal(); // fecha modal de edição
                        setBrandForm({ name: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default BrandEditModal;