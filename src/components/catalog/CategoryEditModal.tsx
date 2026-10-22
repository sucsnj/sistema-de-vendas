import { useState, useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import { CategoryFormData, CategoryOptions } from '@/types/categoria';
import { CategoryDeleteModal } from '@/components/products/ProductDeleteModal';

interface CategoryEditModalProps {
    categoryForm: CategoryFormData;
    setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormData>>;
    onDelete: () => void;
    options: CategoryOptions;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
    categoryForm,
    setCategoryForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-cat-edit-title" tabIndex={-1}>
                <h3 id="modal-cat-edit-title" className={styles.modalTitle}>Editar Categoria</h3>
                <form onSubmit={options.saveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da categoria"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-desc">
                            Descrição:
                        </label>
                        <input
                            id="edit-cat-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
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
                        <button type="submit" className={styles.primaryButton} id="update-cat-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.openCategoryModal();
                                setCategoryForm({ name: '', description: '' });
                            }}
                            id="cancel-edit-cat-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <CategoryDeleteModal
                    open={deleteConfirmOpen}
                    category={categoryForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.openCategoryModal(); // fecha modal de edição
                        setCategoryForm({ name: '', description: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default CategoryEditModal;