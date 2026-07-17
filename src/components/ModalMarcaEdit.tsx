import styles from '../styles/produtos.module.css';

export interface MarcaFormData {
    nome: string;
}

export interface MarcaOptions {
    abrirModalMarca: () => void;
    salvarMarca: React.FormEventHandler<HTMLFormElement>;
}

interface ModalMarcaEditProps {
    marcaForm: MarcaFormData;
    setMarcaForm: React.Dispatch<React.SetStateAction<MarcaFormData>>;
    onDelete: () => void;
    options: MarcaOptions;
}

const ModalMarcaEdit: React.FC<ModalMarcaEditProps> = ({
    marcaForm,
    setMarcaForm,
    onDelete,
    options,
}) => {
    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-cat-edit-title">
            <div className={styles.modalContent}>
                <h3 id="modal-cat-edit-title" className={styles.modalTitle}>Editar Marca</h3>
                <form onSubmit={options.salvarMarca} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da marca"
                            value={marcaForm.nome}
                            onChange={(e) => setMarcaForm({ ...marcaForm, nome: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                                onDelete();
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
                                options.abrirModalMarca();
                                setMarcaForm({ nome: '' });
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

export default ModalMarcaEdit;