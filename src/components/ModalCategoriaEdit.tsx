import styles from '../styles/produtos.module.css';

interface ModalCategoriaEditProps {
    setModalCategoriaEditOpen: (value: boolean) => void;
    novaCatNome: string;
    setNovaCatNome: (value: string) => void;
    novaCatDesc: string;
    setNovaCatDesc: (value: string) => void;
    handleAtualizarCategoria: (e: React.FormEvent) => void;
}

const ModalCategoriaEdit: React.FC<ModalCategoriaEditProps> = ({
    setModalCategoriaEditOpen,
    novaCatNome,
    setNovaCatNome,
    novaCatDesc,
    setNovaCatDesc,
    handleAtualizarCategoria,
}) => {
    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-cat-edit-title">
            <div className={styles.modalContent}>
                <h3 id="modal-cat-edit-title" className={styles.modalTitle}>Editar Categoria</h3>
                <form onSubmit={handleAtualizarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da categoria"
                            value={novaCatNome}
                            onChange={(e) => setNovaCatNome(e.target.value)}
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
                            value={novaCatDesc}
                            onChange={(e) => setNovaCatDesc(e.target.value)}
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
                                setModalCategoriaEditOpen(false);
                                setNovaCatNome('');
                                setNovaCatDesc('');
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