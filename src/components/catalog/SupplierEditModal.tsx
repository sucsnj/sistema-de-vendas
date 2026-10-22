import { useState, useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import { SupplierDeleteModal } from '@/components/products/ProductDeleteModal';

export interface SupplierFormData {
    name: string;
}

export interface SupplierOptions {
    openSupplierModal: () => void;
    saveSupplier: React.FormEventHandler<HTMLFormElement>;
}

interface SupplierEditModalProps {
    supplierForm: SupplierFormData;
    setSupplierForm: React.Dispatch<React.SetStateAction<SupplierFormData>>;
    onDelete: () => void;
    options: SupplierOptions;
}

const SupplierEditModal: React.FC<SupplierEditModalProps> = ({
    supplierForm,
    setSupplierForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-fornecedor-edit-title" tabIndex={-1}>
                <h3 id="modal-fornecedor-edit-title" className={styles.modalTitle}>Editar Fornecedor</h3>
                <form onSubmit={options.saveSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-fornecedor-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-fornecedor-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome do fornecedor"
                            value={supplierForm.name}
                            onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
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
                        <button type="submit" className={styles.primaryButton} id="update-fornecedor-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.openSupplierModal();
                                setSupplierForm({ name: '' });
                            }}
                            id="cancel-edit-fornecedor-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <SupplierDeleteModal
                    open={deleteConfirmOpen}
                    supplier={supplierForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.openSupplierModal(); // fecha modal de edição
                        setSupplierForm({ name: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default SupplierEditModal;