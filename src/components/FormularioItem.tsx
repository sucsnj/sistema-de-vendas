import type { Dispatch, RefObject, SetStateAction } from 'react';
import styles from '../styles/produtos.module.css';
import FormularioProduto from './FormularioProduto';
import FormularioServico from './FormularioServico';
import type { ProdutoFormData, ProdutoOptions, ProdutoActions } from './FormularioProduto';
import ImportExportIcon from '@mui/icons-material/ImportExport';

interface FormularioItemProps {
    onImportXML: () => void;
    editarProdutoId: number | null;
    form: ProdutoFormData;
    setForm: Dispatch<SetStateAction<ProdutoFormData>>;
    options: ProdutoOptions;
    actions: ProdutoActions;
    inputRef: RefObject<HTMLInputElement | null>;
}

const FormularioItem: React.FC<FormularioItemProps> = ({
    onImportXML,
    editarProdutoId,
    form,
    setForm,
    options,
    actions,
    inputRef,
}) => {
    return (
        <>
            <div className={styles.formHeader}>
                <div className={styles.formGroupHeader}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="form-tipo">
                            Tipo:
                        </label>
                        <select
                            id="form-tipo"
                            className={styles.selectField}
                            value={form.tipo}
                            onChange={(e) => setForm(prev => ({ ...prev, tipo: e.target.value as 'PRODUTO' | 'SERVICO' }))}
                        >
                            <option value="PRODUTO">Produto</option>
                            <option value="SERVICO">Serviço</option>
                        </select>

                    </div>
                    <button type="button" className={styles.secondary} onClick={onImportXML}>
                        <ImportExportIcon className="material-icon" />
                        Importar Produtos
                    </button>
                </div>
            </div>

            {form.tipo === 'PRODUTO' ? (
                <FormularioProduto
                    editarProdutoId={editarProdutoId}
                    form={form}
                    setForm={setForm}
                    options={options}
                    inputRef={inputRef}
                    actions={actions}
                />
            ) : (
                <FormularioServico
                    editarProdutoId={editarProdutoId}
                    form={form}
                    setForm={setForm}
                    options={options}
                    inputRef={inputRef}
                    actions={actions}
                />
            )}
        </>
    );
};

export default FormularioItem;