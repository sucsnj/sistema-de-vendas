import { useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import { CategoryFormData, CategoryOptions } from '@/types/categoria';

interface CategoryModalProps {
    categoryForm: CategoryFormData;
    setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormData>>;
    options: CategoryOptions;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    categoryForm,
    setCategoryForm,
    options,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-cat-title" tabIndex={-1}>
                <h3 id="modal-cat-title" className={styles.modalTitle}>Adicionar Categoria</h3>
                <form onSubmit={options.saveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="new-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da categoria"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-cat-desc">
                            Descrição:
                        </label>
                        <input
                            id="new-cat-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.primaryButton} id="save-new-cat-btn">
                            Salvar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.openCategoryModal();
                                setCategoryForm({ name: '', description: '' });
                            }}
                            id="cancel-new-cat-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default CategoryModal;