import { useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import {
    ItemData,
} from '../../services/produtosService';

interface ProductDeleteModalProps {
    open: boolean;
    item: ItemData | null;
    onConfirm: () => void;
    onClose: () => void;
}

interface CategoryDeleteModalProps {
    open: boolean;
    category: { name: string; description?: string };
    onConfirm: () => void;
    onClose: () => void;
}

interface BrandDeleteModalProps {
    open: boolean;
    brand: { name: string };
    onConfirm: () => void;
    onClose: () => void;
}

interface SupplierDeleteModalProps {
    open: boolean;
    supplier: { name: string };
    onConfirm: () => void;
    onClose: () => void;
}

interface UnitOfMeasureDeleteModalProps {
    open: boolean;
    unitOfMeasure: { abbreviation: string; description?: string };
    onConfirm: () => void;
    onClose: () => void;
}

const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
    open,
    item,
    onConfirm,
    onClose,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open || !item) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-delete-title" tabIndex={-1}>
                <h3 id="modal-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>
                    Tem certeza de que deseja excluir o item{' '}
                    <strong>{item.nome}</strong>?
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                    Esta ação é irreversível e excluirá todos os códigos de barras associados a ele.
                </p>
                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onConfirm}
                        style={{ backgroundColor: 'var(--danger)' }}
                        id="confirm-delete-action-btn"
                    >
                        Excluir
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                        id="cancel-delete-action-btn"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
};

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({ open, category, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-cat-delete-title" tabIndex={-1}>
                <h3 id="modal-cat-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a categoria <strong>{category.name}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-cat-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-cat-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BrandDeleteModal: React.FC<BrandDeleteModalProps> = ({ open, brand, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-mar-delete-title" tabIndex={-1}>
                <h3 id="modal-mar-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a marca <strong>{brand.name}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-mar-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-mar-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SupplierDeleteModal: React.FC<SupplierDeleteModalProps> = ({ open, supplier, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-fornecedor-delete-title" tabIndex={-1}>
                <h3 id="modal-fornecedor-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir o fornecedor <strong>{supplier.name}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-fornecedor-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-fornecedor-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const UnitOfMeasureDeleteModal: React.FC<UnitOfMeasureDeleteModalProps> = ({ open, unitOfMeasure, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-uom-delete-title" tabIndex={-1}>
                <h3 id="modal-uom-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a unidade de medida <strong>{unitOfMeasure.abbreviation}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-uom-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-uom-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDeleteModal;