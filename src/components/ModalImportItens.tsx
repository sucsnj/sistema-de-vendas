import { useRef, useState, useCallback, useEffect } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import importStyles from '../styles/modalImport.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';

export interface ProdutoImportado {
    ean: string;
    descricao: string;
    unidadeMedida: string;
    quantidade: number;
    valorUnitario: number;
    ncm?: string;
    cfop?: string;
}

interface ModalImportItensProps {
    onClose: () => void;
    onImportSuccess: () => void;
    initialFile?: File | null;
}

type StatusItem = 'idle' | 'ok' | 'duplicado' | 'estoque_atualizado' | 'erro';

interface ItemComStatus extends ProdutoImportado {
    status: StatusItem;
    mensagem?: string;
}

const ModalImportItens: React.FC<ModalImportItensProps> = ({ onClose, onImportSuccess, initialFile }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [importando, setImportando] = useState(false);
    const [produtos, setProdutos] = useState<ItemComStatus[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [concluido, setConcluido] = useState(false);

    const processarArquivo = useCallback(async (file: File) => {
        if (!file.name.endsWith('.xml')) {
            setErro('Selecione um arquivo XML válido de nota fiscal.');
            return;
        }

        setLoading(true);
        setErro(null);
        setProdutos([]);
        setConcluido(false);
        setNomeArquivo(file.name);

        try {
            const text = await file.text();
            const response = await fetch('/api/produtos/itens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xml: text, preview: true }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                setErro(result.error || 'Erro ao processar o arquivo XML.');
                return;
            }

            const itensComStatus: ItemComStatus[] = (result.produtos as ProdutoImportado[]).map((p) => ({
                ...p,
                status: 'idle',
            }));
            setProdutos(itensComStatus);
        } catch (err) {
            setErro('Erro inesperado ao ler o arquivo. Verifique se é uma NF-e válida.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialFile) {
            processarArquivo(initialFile);
        }
    }, [initialFile, processarArquivo]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processarArquivo(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processarArquivo(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleImportar = async () => {
        if (produtos.length === 0) return;
        setImportando(true);
        setErro(null);

        const resultados: ItemComStatus[] = [...produtos];

        for (let i = 0; i < resultados.length; i++) {
            const produto = resultados[i];
            try {
                const response = await fetch('/api/produtos/itens', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ importar: true, produto }),
                });
                const result = await response.json();

                if (!response.ok || result.error) {
                    resultados[i] = { ...produto, status: result.duplicado ? 'duplicado' : 'erro', mensagem: result.error };
                } else {
                    if (result.estoqueAtualizado) {
                         resultados[i] = { ...produto, status: 'estoque_atualizado', mensagem: 'Estoque atualizado com sucesso' };
                    } else {
                         resultados[i] = { ...produto, status: 'ok' };
                    }
                }
            } catch {
                resultados[i] = { ...produto, status: 'erro', mensagem: 'Falha na requisição' };
            }
            setProdutos([...resultados]);
        }

        setImportando(false);
        setConcluido(true);
        onImportSuccess();
    };

    const totalOk = produtos.filter((p) => p.status === 'ok').length;
    const totalEstAtualizado = produtos.filter((p) => p.status === 'estoque_atualizado').length;
    const totalDup = produtos.filter((p) => p.status === 'duplicado').length;
    const totalErro = produtos.filter((p) => p.status === 'erro').length;

    return (
        <div className={styles.modalOverlay} role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                className={`${styles.modalContent} ${importStyles.modalLarge}`}
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-import-title"
                tabIndex={-1}
            >
                {/* Cabeçalho */}
                <div className={importStyles.modalHeader}>
                    <h3 id="modal-import-title" className={styles.modalTitle}>
                        Importar Produtos via Nota Fiscal (XML)
                    </h3>
                    <button className={importStyles.closeBtn} onClick={onClose} aria-label="Fechar" type="button">
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                {/* Área de upload */}
                {!produtos.length && !loading && (
                    <div
                        className={`${importStyles.dropZone} ${isDragOver ? importStyles.dropZoneActive : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Área para soltar arquivo XML"
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                        <UploadFileIcon className={importStyles.dropIcon} />
                        <p className={importStyles.dropText}>
                            Arraste um arquivo <strong>.xml</strong> de NF-e aqui ou clique para selecionar
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xml"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            id="xml-file-input"
                        />
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className={importStyles.loadingArea}>
                        <div className={importStyles.spinner} />
                        <p>Lendo nota fiscal…</p>
                    </div>
                )}

                {/* Erro */}
                {erro && (
                    <div className={importStyles.errorBanner}>
                        <WarningAmberIcon fontSize="small" />
                        <span>{erro}</span>
                    </div>
                )}

                {/* Tabela de produtos */}
                {produtos.length > 0 && (
                    <>
                        <div className={importStyles.fileInfo}>
                            <span className={importStyles.fileName}>{nomeArquivo}</span>
                            <span className={importStyles.prodCount}>{produtos.length} produto(s) encontrado(s)</span>
                            {!concluido && (
                                <button
                                    type="button"
                                    className={importStyles.trocarBtn}
                                    onClick={() => {
                                        setProdutos([]);
                                        setNomeArquivo(null);
                                        setErro(null);
                                        setConcluido(false);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    Trocar arquivo
                                </button>
                            )}
                        </div>

                        {concluido && (
                            <div className={importStyles.resumoBanner}>
                                <FileDownloadDoneIcon />
                                <span>
                                    Importação concluída: <strong>{totalOk}</strong> inserido(s)
                                    {totalEstAtualizado > 0 && <>, <strong>{totalEstAtualizado}</strong> estoque atualizado</>}
                                    {totalDup > 0 && <>, <strong>{totalDup}</strong> duplicado(s)</>}
                                    {totalErro > 0 && <>, <strong>{totalErro}</strong> erro(s)</>}
                                </span>
                            </div>
                        )}

                        <div className={importStyles.tableWrapper}>
                            <table className={importStyles.importTable}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>EAN / Cód.</th>
                                        <th>Descrição</th>
                                        <th>Un.</th>
                                        <th>Qtd.</th>
                                        <th>Vlr. Unit. (R$)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map((p, i) => (
                                        <tr key={i} className={importStyles[`row_${p.status}`]}>
                                            <td>{i + 1}</td>
                                            <td className={importStyles.mono}>{p.ean || '—'}</td>
                                            <td>{p.descricao}</td>
                                            <td>{p.unidadeMedida}</td>
                                            <td>{p.quantidade}</td>
                                            <td>
                                                {p.valorUnitario.toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 4,
                                                })}
                                            </td>
                                            <td>
                                                {p.status === 'idle' && <span className={importStyles.badgeIdle}>Pendente</span>}
                                                {p.status === 'ok' && (
                                                    <span className={importStyles.badgeOk}>
                                                        <CheckCircleOutlineIcon fontSize="inherit" /> Importado
                                                    </span>
                                                )}
                                                {p.status === 'estoque_atualizado' && (
                                                    <span className={importStyles.badgeEstoqueAtualizado} title={p.mensagem}>
                                                        <CheckCircleOutlineIcon fontSize="inherit" /> Est. Atualizado
                                                    </span>
                                                )}
                                                {p.status === 'duplicado' && (
                                                    <span className={importStyles.badgeDup} title={p.mensagem}>
                                                        <WarningAmberIcon fontSize="inherit" /> Duplicado
                                                    </span>
                                                )}
                                                {p.status === 'erro' && (
                                                    <span className={importStyles.badgeErro} title={p.mensagem}>
                                                        <WarningAmberIcon fontSize="inherit" /> Erro
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Rodapé */}
                <div className={styles.modalActions}>
                    {produtos.length > 0 && !concluido && (
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleImportar}
                            disabled={importando}
                            id="btn-confirmar-importacao"
                        >
                            {importando ? 'Importando…' : `Importar ${produtos.length} produto(s)`}
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                        id="btn-fechar-import"
                    >
                        {concluido ? 'Fechar' : 'Cancelar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalImportItens;
