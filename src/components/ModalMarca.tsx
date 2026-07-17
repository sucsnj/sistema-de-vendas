import styles from '../styles/produtos.module.css';

interface ModalMarcaProps {
    setModalMarcaOpen: (value: boolean) => void;
    novaMarcaNome: string;
    setNovaMarcaNome: (value: string) => void;
    handleSalvarMarca: (e: React.FormEvent) => void;
}

const ModalMarca: React.FC<ModalMarcaProps> = ({
    setModalMarcaOpen,
    novaMarcaNome,
    setNovaMarcaNome,
    handleSalvarMarca,
}) => {
    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-marca-title">
            <div className={styles.modalContent}>
                <h3 id="modal-marca-title" className={styles.modalTitle}>Adicionar Marca</h3>
                <form onSubmit={handleSalvarMarca} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-marca-nome">
                            Nome:*
                        </label>
                        <input
                            id="new-marca-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da marca"
                            value={novaMarcaNome}
                            onChange={(e) => setNovaMarcaNome(e.target.value)}
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
                                setModalMarcaOpen(false);
                                setNovaMarcaNome('');
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

export default ModalMarca;