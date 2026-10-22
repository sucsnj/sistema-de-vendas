import styles from '../../styles/produtos.module.css';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import {
  BarcodeData,
} from '../../services/produtosService';

export interface BarcodeManagerData {
  barcodes: BarcodeData[];
  newBarcode: string;
}

export interface BarcodeManagerActions {
  add: () => void;
  setAsPrincipal: (barcode: string) => void;
  change: (barcode: string) => void;
  remove: (barcode: string) => void;
}

interface BarcodeManagerProps {
  data: BarcodeManagerData;
  actions: BarcodeManagerActions;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const BarcodeManager: React.FC<BarcodeManagerProps> = ({
  data,
  actions,
  inputRef,
}) => {
  return (
    <div className={styles.barcodeSection}>
      <div className={styles.barcodeTitle}>Códigos de Barras</div>
      <div className={styles.barcodeInputRow}>
        <input
          ref={inputRef}
          type="text"
          className={styles.inputField}
          placeholder="Digitar código de barras..."
          value={data.newBarcode}
          onChange={(e) => actions.change(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              actions.add();
            }
          }}
          id="barcode-input-field"
        />
        <button
          type="button"
          className={styles.primaryButton}
          onClick={actions.add}
          style={{ padding: '8px 14px', marginTop: 0, marginBottom: 0 }}
          id="add-barcode-action-btn"
        >
          Adicionar
        </button>
      </div>

      {data.barcodes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: '0.75rem',
            padding: '10px',
          }}
        >
          Nenhum código de barras adicionado.
        </div>
      ) : (
        <div className={styles.barcodeList}>
          {data.barcodes.map((cb) => (
            <div key={cb.codigo_barras} className={styles.barcodeItem}>
              <div className={styles.barcodeLeft}>
                <span style={{ fontWeight: 'bold' }}>{cb.codigo_barras}</span>
                <span
                  onClick={() => actions.setAsPrincipal(cb.codigo_barras)}
                  className={styles.barcodeRadioLabel}
                  title={cb.principal === 1 ? 'Código Principal' : 'Marcar como Principal'}
                  id={`principal-star-${cb.codigo_barras}`}
                >
                  {cb.principal === 1 ? (
                    <StarIcon style={{ color: '#eab308' }} fontSize="small" />
                  ) : (
                    <StarBorderIcon style={{ color: 'var(--muted)' }} fontSize="small" />
                  )}
                  {cb.principal === 1 ? 'Principal' : 'Tornar Principal'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => actions.remove(cb.codigo_barras)}
                className={styles.removeBtn}
                title="Remover"
                id={`remove-barcode-${cb.codigo_barras}`}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
};

export default BarcodeManager;