import { useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';

export interface UnitOfMeasureFormData {
    abbreviation: string;
    description: string;
}

export interface UnitOfMeasureOptions {
    openUnitOfMeasureModal: () => void;
    saveUnitOfMeasure: React.FormEventHandler<HTMLFormElement>;
}

interface UnitOfMeasureModalProps {
    uomForm: UnitOfMeasureFormData;
    setUomForm: React.Dispatch<React.SetStateAction<UnitOfMeasureFormData>>;
    options: UnitOfMeasureOptions;
}

const UnitOfMeasureModal: React.FC<UnitOfMeasureModalProps> = ({
    uomForm,
    setUomForm,
    options,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-uom-title" tabIndex={-1}>
                <h3 id="modal-uom-title" className={styles.modalTitle}>Adicionar Unidade medida</h3>
                <form onSubmit={options.saveUnitOfMeasure} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-uom-sigla">
                            abbreviation:*
                        </label>
                        <input
                            id="new-uom-sigla"
                            type="text"
                            className={styles.inputField}
                            placeholder="Sigla da Unidade de Medida"
                            value={uomForm.abbreviation}
                            onChange={(e) => setUomForm(prev => ({ ...prev, abbreviation: e.target.value }))}
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
                            value={uomForm.description}
                            onChange={(e) => setUomForm(prev => ({ ...prev, description: e.target.value }))}
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
                                options.openUnitOfMeasureModal();
                                setUomForm({ abbreviation: '', description: '' });
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

export default UnitOfMeasureModal;