import styles from '../styles/produtos.module.css';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import {
  BarcodeData,
} from '../services/produtosService';

interface BarcodeManagerProps {
  formCodigosBarras: BarcodeData[];
  novoCodigoBarras: string;
  setNovoCodigoBarras: React.Dispatch<React.SetStateAction<string>>;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
  handleAddBarcode: () => void;
  handleSetPrincipalBarcode: (barcode: string) => void;
  handleRemoveBarcode: (barcode: string) => void;
}

const BarcodeManager: React.FC<BarcodeManagerProps> = ({
  formCodigosBarras,
  novoCodigoBarras,
  setNovoCodigoBarras,
  barcodeInputRef,
  handleAddBarcode,
  handleSetPrincipalBarcode,
  handleRemoveBarcode,
}) => {
  return (
    <div className={styles.barcodeSection}>
      <div className={styles.barcodeTitle}>Códigos de Barras</div>
      <div className={styles.barcodeInputRow}>
        <input
          ref={barcodeInputRef}
          type="text"
          className={styles.inputField}
          placeholder="Digitar código de barras..."
          value={novoCodigoBarras}
          onChange={(e) => setNovoCodigoBarras(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddBarcode();
            }
          }}
          id="barcode-input-field"
        />
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleAddBarcode}
          style={{ padding: '8px 14px', marginTop: 0, marginBottom: 0 }}
          id="add-barcode-action-btn"
        >
          Adicionar
        </button>
      </div>

      {formCodigosBarras.length === 0 ? (
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
          {formCodigosBarras.map((cb) => (
            <div key={cb.codigo_barras} className={styles.barcodeItem}>
              <div className={styles.barcodeLeft}>
                <span style={{ fontWeight: 'bold' }}>{cb.codigo_barras}</span>
                <span
                  onClick={() => handleSetPrincipalBarcode(cb.codigo_barras)}
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
                onClick={() => handleRemoveBarcode(cb.codigo_barras)}
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