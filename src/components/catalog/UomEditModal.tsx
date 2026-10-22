import { useState, useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import { UnitOfMeasureDeleteModal } from '@/components/products/ProductDeleteModal';

export interface UnitOfMeasureFormData {
    abbreviation: string;
    description: string;
}

export interface UnitOfMeasureOptions {
    openUnitOfMeasureModal: () => void;
    saveUnitOfMeasure: React.FormEventHandler<HTMLFormElement>;
}

interface UnitOfMeasureEditModalProps {
    uomForm: UnitOfMeasureFormData;
    setUomForm: React.Dispatch<React.SetStateAction<UnitOfMeasureFormData>>;
    onDelete: () => void;
    options: UnitOfMeasureOptions;
}

const UnitOfMeasureEditModal: React.FC<UnitOfMeasureEditModalProps> = ({
    uomForm,
    setUomForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-uom-edit-title" tabIndex={-1}>
                <h3 id="modal-uom-edit-title" className={styles.modalTitle}>Editar Unidade de Medida</h3>
                <form onSubmit={options.saveUnitOfMeasure} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-uom-sigla">
                            Sigla:*
                        </label>
                        <input
                            id="edit-uom-sigla"
                            type="text"
                            className={styles.inputField}
                            placeholder="Sigla da Unidade de Medida"
                            value={uomForm.abbreviation}
                            onChange={(e) => setUomForm({ ...uomForm, abbreviation: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-uom-desc">
                            Descrição:
                        </label>
                        <input
                            id="edit-uom-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={uomForm.description}
                            onChange={(e) => setUomForm({ ...uomForm, description: e.target.value })}
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
                        <button type="submit" className={styles.primaryButton} id="update-uom-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.openUnitOfMeasureModal();
                                setUomForm({ abbreviation: '', description: '' });
                            }}
                            id="cancel-edit-uom-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <UnitOfMeasureDeleteModal
                    open={deleteConfirmOpen}
                    unitOfMeasure={uomForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.openUnitOfMeasureModal(); // fecha modal de edição
                        setUomForm({ abbreviation: '', description: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default UnitOfMeasureEditModal;