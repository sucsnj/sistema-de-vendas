import styles from '../styles/produtos.module.css';

interface ModalProdCategoriaProps {
    setModalCategoriaOpen: (value: boolean) => void;
    novaCatNome: string;
    setNovaCatNome: (value: string) => void;
    novaCatDesc: string;
    setNovaCatDesc: (value: string) => void;
    handleSalvarCategoria: (e: React.FormEvent) => void;
}

const ModalProdCategoria: React.FC<ModalProdCategoriaProps> = ({
    setModalCategoriaOpen,
    novaCatNome,
    setNovaCatNome,
    novaCatDesc,
    setNovaCatDesc,
    handleSalvarCategoria,
}) => {
    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-cat-title">
            <div className={styles.modalContent}>
                <h3 id="modal-cat-title" className={styles.modalTitle}>Adicionar Categoria</h3>
                <form onSubmit={handleSalvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="new-cat-nome"
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
                        <label className={styles.formLabel} htmlFor="new-cat-desc">
                            Descrição:
                        </label>
                        <input
                            id="new-cat-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={novaCatDesc}
                            onChange={(e) => setNovaCatDesc(e.target.value)}
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
                                setModalCategoriaOpen(false);
                                setNovaCatNome('');
                                setNovaCatDesc('');
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

export default ModalProdCategoria;