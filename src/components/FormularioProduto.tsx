import styles from '../styles/produtos.module.css';
import AddIcon from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import {
    CategoriaData,
    MarcaData,
    UnidadeMedidaData,
    FornecedorData
} from '../services/produtosService';

export interface ProdutoFormData {
    tipo: 'PRODUTO' | 'SERVICO';
    nome: string;
    descricao: string;
    categoriaId: number;
    marcaId: number;
    fornecedorId: number;
    unidadeMedidaId: number | '';
    codigoInterno: string;
    ativo: number;
}

export interface ProdutoOptions {
    categorias: CategoriaData[];
    marcas: MarcaData[];
    fornecedores: FornecedorData[];
    unidadesMedida: UnidadeMedidaData[];
}

export interface ProdutoActions {
    abrirModalCategoria: () => void;
    abrirModalMarca: () => void;
    abrirModalFornecedor: () => void;
    editarCategoria: (categoria: CategoriaData) => void;
    editarMarca: (marca: MarcaData) => void;
    editarFornecedor: (fornecedor: FornecedorData) => void;
}

// Props do Componente
interface FormularioProdutoProps {
    form: ProdutoFormData;
    setForm: React.Dispatch<React.SetStateAction<ProdutoFormData>>;
    options: ProdutoOptions;
    setOptions: React.Dispatch<React.SetStateAction<ProdutoOptions>>;
    actions: ProdutoActions;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const FormularioProduto: React.FC<FormularioProdutoProps> = ({
    form,
    setForm,
    options,
    inputRef,
    actions,
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
                    value={form.tipo}
                    onChange={(e) => setForm(prev => ({ ...prev, tipo: e.target.value as 'PRODUTO' | 'SERVICO' }))}
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
                    ref={inputRef}
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome do item"
                    value={form.nome}
                    onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
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
                    value={form.descricao}
                    onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-categoria">
                    Categoria:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-categoria"
                        className={styles.selectField}
                        value={form.categoriaId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, categoriaId: e.target.value ? Number(e.target.value) : 28 }))
                        }
                    >
                        {options.categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={actions.abrirModalCategoria}
                        title="Adicionar Categoria"
                        id="add-categoria-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de categorias */}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => {
                            const categoriaSelecionada = options.categorias.find(
                                (c) => c.id === form.categoriaId
                            );
                            if (categoriaSelecionada) {
                                actions.editarCategoria(categoriaSelecionada);
                            }
                        }}
                        title="Editar Categoria Selecionada"
                        id="edit-categoria-btn"
                    >
                        <MoreVert fontSize="small" />
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-marca">
                    Marca:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-marca"
                        className={styles.selectField}
                        value={form.marcaId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, marcaId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => actions.abrirModalMarca()}
                        title="Adicionar Marca"
                        id="add-marca-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de marcas*/}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => {
                            const marcaSelecionada = options.marcas.find(
                                (m) => m.id === form.marcaId
                            );
                            if (marcaSelecionada) {
                                actions.editarMarca(marcaSelecionada);
                            }
                        }}
                        title="Editar Marca Selecionada"
                        id="edit-marca-btn"
                    >
                        <MoreVert fontSize="small" />
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-fornecedor">
                    Fornecedor:*
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-fornecedor"
                        className={styles.selectField}
                        value={form.fornecedorId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, fornecedorId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                        required
                    >
                        {options.fornecedores.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={actions.abrirModalFornecedor}
                        title="Adicionar Fornecedor"
                        id="add-fornecedor-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de fornecedores*/}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => {
                            const fornecedorSelecionado = options.fornecedores.find(
                                (f) => f.id === form.fornecedorId
                            );
                            if (fornecedorSelecionado) {
                                actions.editarFornecedor(fornecedorSelecionado);
                            }
                        }}
                        title="Editar Fornecedor Selecionado"
                        id="edit-fornecedor-btn"
                    >
                        <MoreVert fontSize="small" />
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
                    value={form.unidadeMedidaId}
                    onChange={(e) =>
                        setForm(prev => ({ ...prev, unidadeMedidaId: e.target.value ? Number(e.target.value) : '' }))
                    }
                    required
                >
                    <option value="">Selecione...</option>
                    {options.unidadesMedida.map((u) => (
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
                    value={form.codigoInterno}
                    onChange={(e) => setForm(prev => ({ ...prev, codigoInterno: e.target.value }))}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-ativo">
                    Ativo:
                </label>
                <select
                    id="form-ativo"
                    className={styles.selectField}
                    value={form.ativo}
                    onChange={(e) => setForm(prev => ({ ...prev, ativo: Number(e.target.value) }))}
                >
                    <option value={1}>Sim</option>
                    <option value={0}>Não</option>
                </select>
            </div>
        </div>
    )
};

export default FormularioProduto;