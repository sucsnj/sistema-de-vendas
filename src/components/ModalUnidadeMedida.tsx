import styles from '../styles/produtos.module.css';

export interface UnidadeMedidaFormData {
    sigla: string;
    descricao: string;
}

export interface UnidadeMedidaOptions {
    abrirModalUnidadeMedida: () => void;
    salvarUnidadeMedida: React.FormEventHandler<HTMLFormElement>;
}

interface ModalAddUnidadeMedidaProps {
    uomForm: UnidadeMedidaFormData;
    setUomForm: React.Dispatch<React.SetStateAction<UnidadeMedidaFormData>>;
    options: UnidadeMedidaOptions;
}

const ModalAddUnidadeMedida: React.FC<ModalAddUnidadeMedidaProps> = ({
    uomForm,
    setUomForm,
    options,
}) => {
    return (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-uom-title">
            <div className={styles.modalContent}>
                <h3 id="modal-uom-title" className={styles.modalTitle}>Adicionar Unidade medida</h3>
                <form onSubmit={options.salvarUnidadeMedida} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-uom-sigla">
                            sigla:*
                        </label>
                        <input
                            id="new-uom-sigla"
                            type="text"
                            className={styles.inputField}
                            placeholder="Sigla da Unidade de Medida"
                            value={uomForm.sigla}
                            onChange={(e) => setUomForm(prev => ({ ...prev, sigla: e.target.value }))}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-uom-desc">
                            Descrição:
                        </label>
                        <input
                            id="new-uom-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={uomForm.descricao}
                            onChange={(e) => setUomForm(prev => ({ ...prev, descricao: e.target.value }))}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.primaryButton} id="save-new-uom-btn">
                            Salvar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalUnidadeMedida();
                                setUomForm({ sigla: '', descricao: '' });
                            }}
                            id="cancel-new-uom-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default ModalAddUnidadeMedida;