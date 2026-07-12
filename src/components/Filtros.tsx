import {
    CategoriaData,
    MarcaData,
} from '../services/produtosService';

interface FiltrosProps {
    search: string;
    setSearch: (search: string) => void;
    filtroTipo: 'PRODUTO' | 'SERVICO' | 'TODOS';
    setFiltroTipo: (filtroTipo: 'PRODUTO' | 'SERVICO' | 'TODOS') => void;
    filtroCategoria: number | '';
    setFiltroCategoria: (filtroCategoria: number | '') => void;
    filtroMarca: number | '';
    setFiltroMarca: (filtroMarca: number | '') => void;
    filtroStatus: 'ATIVO' | 'INATIVO' | 'TODOS';
    setFiltroStatus: (filtroStatus: 'ATIVO' | 'INATIVO' | 'TODOS') => void;
    categorias: CategoriaData[];
    marcas: MarcaData[];
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleLimparFiltros: () => void;

    onPageChange: (page: number) => void;
}

const Filtros: React.FC<FiltrosProps> = ({
    search,
    setSearch,
    filtroTipo,
    setFiltroTipo,
    filtroCategoria,
    setFiltroCategoria,
    filtroMarca,
    setFiltroMarca,
    filtroStatus,
    setFiltroStatus,
    categorias,
    marcas,
    handleSearchSubmit,
    handleLimparFiltros,
    onPageChange,
}) => {

    return (
        <section className="glass-form" aria-labelledby="filtros-title">
            <h2 id="filtros-title" className="">Filtros de Pesquisa</h2>
            <form onSubmit={handleSearchSubmit} className="page-actions">
                <label htmlFor="search-input">
                    Buscar:
                    <input
                        id="search-input"
                        className="headerInput"
                        type="text"
                        placeholder="Nome, código ou EAN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>

                <label htmlFor="filtro-tipo">
                    Tipo:
                    <select
                        id="filtro-tipo"
                        className="headerSelect"
                        value={filtroTipo}
                        onChange={(e) => {
                            setFiltroTipo(e.target.value as any);
                            onPageChange(1);
                        }}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="PRODUTO">Produto</option>
                        <option value="SERVICO">Serviço</option>
                    </select>
                </label>

                <label htmlFor="filtro-categoria">
                    Categoria:
                    <select
                        id="filtro-categoria"
                        className="headerSelect"
                        value={filtroCategoria}
                        onChange={(e) => {
                            setFiltroCategoria(e.target.value ? Number(e.target.value) : '');
                            onPageChange(1);
                        }}>
                        <option value="">Todas</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="filtro-marca">
                    Marca:
                    <select
                        id="filtro-marca"
                        className="headerSelect"
                        value={filtroMarca}
                        onChange={(e) => {
                            setFiltroMarca(e.target.value ? Number(e.target.value) : '');
                            onPageChange(1);
                        }}>
                        <option value="">Todas</option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="filtro-status">
                    Status:
                    <select
                        id="filtro-status"
                        className="headerSelect"
                        value={filtroStatus}
                        onChange={(e) => {
                            setFiltroStatus(e.target.value as any);
                            onPageChange(1);
                        }}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="INATIVO">Inativos</option>
                    </select>
                </label>

                <button type="submit" className="headerBackupButton">
                    Filtrar
                </button>
                <button
                    type="button"
                    className="headerButton"
                    onClick={handleLimparFiltros}
                >
                    Limpar
                </button>
            </form>
        </section>
    )
}

export default Filtros;