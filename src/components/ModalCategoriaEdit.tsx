import styles from '../styles/produtos.module.css';
import { CategoriaFormData, CategoriaOptions } from '@/types/categoria';

interface ModalCategoriaEditProps {
    catForm: CategoriaFormData;
    setCatForm: React.Dispatch<React.SetStateAction<CategoriaFormData>>;
    options: CategoriaOptions;
}

const ModalCategoriaEdit: React.FC<ModalCategoriaEditProps> = ({
    catForm,
    setCatForm,
    options,
}) => {
    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-cat-edit-title">
            <div className={styles.modalContent}>
                <h3 id="modal-cat-edit-title" className={styles.modalTitle}>Editar Categoria</h3>
                <form onSubmit={options.salvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da categoria"
                            value={catForm.nome}
                            onChange={(e) => setCatForm({...catForm, nome: e.target.value})}
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
                            value={catForm.descricao}
                            onChange={(e) => setCatForm({...catForm, descricao: e.target.value})}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.primaryButton} id="update-cat-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalCategoria();
                                setCatForm({ nome: '', descricao: '' });
                            }}
                            id="cancel-edit-cat-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default ModalCategoriaEdit;