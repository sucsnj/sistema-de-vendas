import styles from '../styles/produtos.module.css';
import AddIcon from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import {
    CategoriaData,
    MarcaData,
    UnidadeMedidaData,
    BarcodeData,
} from '../services/produtosService';

interface FormularioProdutoProps {
    editingId: number | null;
    formTipo: 'PRODUTO' | 'SERVICO';
    formNome: string;
    formDescricao: string;
    formCategoriaId: number | '';
    formMarcaId: number | '';
    formUnidadeMedidaId: number | '';
    formCodigoInterno: string;
    formAtivo: number;
    formCodigosBarras: BarcodeData[];
    novoCodigoBarras: string;
    setEditingId: (id: number | null) => void;
    setFormTipo: (tipo: 'PRODUTO' | 'SERVICO') => void;
    setFormNome: (nome: string) => void;
    setFormDescricao: (descricao: string) => void;
    setFormCategoriaId: (id: number) => void;
    setFormMarcaId: (id: number | '') => void;
    setFormUnidadeMedidaId: (id: number | '') => void;
    setFormCodigoInterno: (codigo: string) => void;
    setFormAtivo: (ativo: number) => void;
    setFormCodigosBarras: (barras: BarcodeData[]) => void;
    setNovoCodigoBarras: (codigo: string) => void;
    handleSubmitForm: (e: React.FormEvent) => void;
    resetForm: () => void;
    categorias: CategoriaData[];
    marcas: MarcaData[];
    unidadesMedida: UnidadeMedidaData[];
    nomeInputRef: React.RefObject<HTMLInputElement | null>;
    barcodeInputRef: React.RefObject<HTMLInputElement | null>;
    handleAddBarcode: () => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    setModalCategoriaOpen: (open: boolean) => void;
    setModalMarcaOpen: (open: boolean) => void;
}

const FormularioProduto: React.FC<FormularioProdutoProps> = ({
    editingId,
    formTipo,
    formNome,
    formDescricao,
    formCategoriaId,
    formMarcaId,
    formUnidadeMedidaId,
    formCodigoInterno,
    formAtivo,
    formCodigosBarras,
    novoCodigoBarras,
    setEditingId,
    setFormTipo,
    setFormNome,
    setFormDescricao,
    setFormCategoriaId,
    setFormMarcaId,
    setFormUnidadeMedidaId,
    setFormCodigoInterno,
    setFormAtivo,
    setFormCodigosBarras,
    setNovoCodigoBarras,
    handleSubmitForm,
    resetForm,
    categorias,
    marcas,
    unidadesMedida,
    nomeInputRef,
    barcodeInputRef,
    handleAddBarcode,
    showToast,
    setModalCategoriaOpen,
    setModalMarcaOpen,
}) => {
    return (
        <div className="CadastroEdicao">
            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-tipo">
                    Tipo:
                </label>
                <select
                    id="form-tipo"
                    className={styles.selectField}
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                >
                    <option value="PRODUTO">Produto</option>
                    <option value="SERVICO">Serviço</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-nome">
                    Nome:*
                </label>
                <input
                    id="form-nome"
                    ref={nomeInputRef}
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome do item"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-descricao">
                    Descrição:
                </label>
                <textarea
                    id="form-descricao"
                    className={styles.textareaField}
                    placeholder="Detalhes ou especificações"
                    rows={3}
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-categoria">
                    Categoria:*
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-categoria"
                        className={styles.selectField}
                        value={formCategoriaId}
                        onChange={(e) =>
                            setFormCategoriaId(e.target.value ? Number(e.target.value) : 1)
                        }
                        required>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => setModalCategoriaOpen(true)}
                        title="Adicionar Categoria"
                        id="add-categoria-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de categorias */}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => setModalCategoriaOpen(true)}
                        title="Gerenciar Categorias"
                        id="manage-categoria-btn"
                    >
                        <MoreVert fontSize="small" />
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-marca">
                    Marca:*
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-marca"
                        className={styles.selectField}
                        value={formMarcaId}
                        onChange={(e) =>
                            setFormMarcaId(e.target.value ? Number(e.target.value) : '')
                        }
                        required>
                        <option value="">Selecione...</option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => setModalMarcaOpen(true)}
                        title="Adicionar Marca"
                        id="add-marca-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-unidade">
                    Unidade de Medida:*
                </label>
                <select
                    id="form-unidade"
                    className={styles.selectField}
                    value={formUnidadeMedidaId}
                    onChange={(e) =>
                        setFormUnidadeMedidaId(e.target.value ? Number(e.target.value) : '')
                    }
                    required
                >
                    <option value="">Selecione...</option>
                    {unidadesMedida.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.sigla} - {u.descricao}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-cod-interno">
                    Código Interno:
                </label>
                <input
                    id="form-cod-interno"
                    type="text"
                    className={styles.inputField}
                    placeholder="Ex: PROD-001"
                    value={formCodigoInterno}
                    onChange={(e) => setFormCodigoInterno(e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-ativo">
                    Ativo:
                </label>
                <select
                    id="form-ativo"
                    className={styles.selectField}
                    value={formAtivo}
                    onChange={(e) => setFormAtivo(Number(e.target.value))}
                >
                    <option value={1}>Sim</option>
                    <option value={0}>Não</option>
                </select>
            </div>
        </div>
    )
};

export default FormularioProduto;