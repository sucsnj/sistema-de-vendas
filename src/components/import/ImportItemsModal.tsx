/**
 * src/components/ModalImportItens.tsx
 *
 * Modal de importaÃ§Ã£o de produtos via nota fiscal (XML). Apresentacional â€”
 * lÃ³gica no `useImportItens` e seletor de vÃ­nculo no `ItemNameDropdown`.
 * Ver docs/components/ModalImportItens.md.
 */

import { useMemo, useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import importStyles from '../../styles/modalImport.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useImportItens } from '../../hooks/useImportItens';
import ItemNameDropdown from './ItemNameDropdown';

interface ModalImportItensProps {
  onClose: () => void;
  onImportSuccess: () => void;
  initialFile?: File | null;
}

const ModalImportItens: React.FC<ModalImportItensProps> = ({ onClose, onImportSuccess, initialFile }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  const {
    fileInputRef,
    isDragOver,
    fileName,
    loading,
    importing,
    products,
    error,
    completed,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleImport,
    handleItemDescriptionChange,
    handleSelectSuggestion,
    handleEditItem,
    handleQuickRegister,
    resetFile,
  } = useImportItens({ onImportSuccess, initialFile });

  const counts = useMemo(() => {
    let okCount = 0;
    let updatedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    for (const p of products) {
      if (p.status === 'ok') okCount++;
      else if (p.status === 'estoque_atualizado') updatedCount++;
      else if (p.status === 'duplicado') duplicateCount++;
      else if (p.status === 'erro') errorCount++;
    }
    return { okCount, updatedCount, duplicateCount, errorCount };
  }, [products]);

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modalContent} ${importStyles.modalLarge}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-import-title"
        tabIndex={-1}
      >
        {/* CabeÃ§alho */}
        <div className={importStyles.modalHeader}>
          <h3 id="modal-import-title" className={styles.modalTitle}>
            Importar Produtos via Nota Fiscal (XML)
          </h3>
          <button className={importStyles.closeBtn} onClick={onClose} aria-label="Fechar" type="button">
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Ãrea de upload */}
        {!products.length && !loading && (
          <div
            className={`${importStyles.dropZone} ${isDragOver ? importStyles.dropZoneActive : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Ãrea para soltar arquivo XML"
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
            <p>Lendo nota fiscalâ€¦</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className={importStyles.errorBanner}>
            <WarningAmberIcon fontSize="small" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabela de produtos */}
        {products.length > 0 && (
          <>
            <div className={importStyles.fileInfo}>
              <span className={importStyles.fileName}>{fileName}</span>
              <span className={importStyles.prodCount}>
                {products.length} produto(s) encontrado(s)
              </span>
              {!completed && (
                <button type="button" className={importStyles.trocarBtn} onClick={resetFile}>
                  Trocar arquivo
                </button>
              )}
            </div>

            {completed && (
              <div className={importStyles.resumoBanner}>
                <FileDownloadDoneIcon />
                <span>
                  ImportaÃ§Ã£o concluÃ­da: <strong>{counts.okCount}</strong> inserido(s)
                  {counts.updatedCount > 0 && (
                    <>
                      , <strong>{counts.updatedCount}</strong> estoque atualizado
                    </>
                  )}
                  {counts.duplicateCount > 0 && (
                    <>
                      , <strong>{counts.duplicateCount}</strong> duplicado(s)
                    </>
                  )}
                  {counts.errorCount > 0 && (
                    <>
                      , <strong>{counts.errorCount}</strong> erro(s)
                    </>
                  )}
                </span>
              </div>
            )}

            <div className={importStyles.tableWrapper}>
              <table className={importStyles.importTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ minWidth: '220px' }}>Produto na NF-e</th>
                    <th style={{ minWidth: '250px' }}>Item no Sistema (VÃ­nculo)</th>
                    <th>Un.</th>
                    <th>Qtd.</th>
                    <th>Vlr. Unit. (R$)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className={importStyles[`row_${p.status}`]}>
                      <td>{i + 1}</td>
                      <td className={importStyles.colNfProduto}>
                        <div
                          className={importStyles.nomeNfTexto}
                          title={p.descricaoOriginal || p.descricao}
                        >
                          {p.descricaoOriginal || p.descricao}
                        </div>
                        {(p.ean || p.cProd) && (
                          <div className={importStyles.subCode}>
                            {p.ean && <span>EAN: {p.ean}</span>}
                            {p.ean && p.cProd && p.cProd !== p.ean && <span> Â· </span>}
                            {p.cProd && p.cProd !== p.ean && <span>CÃ³d: {p.cProd}</span>}
                          </div>
                        )}
                      </td>
                      <td>
                        <ItemNameDropdown
                          item={p}
                          onSelectSuggestion={(sugestao) => handleSelectSuggestion(i, sugestao)}
                          onTextChange={(novoTexto) => handleItemDescriptionChange(i, novoTexto)}
                          disabled={completed || importing}
                        />
                        {!completed && (
                          <div className={importStyles.cadastroRapidoContainer}>
                            {p.existe && p.itemIdExistente ? (
                              <button
                                type="button"
                                className={importStyles.btnEditarItem}
                                onClick={() => handleEditItem(p)}
                                title="Abrir ediÃ§Ã£o deste item em nova aba"
                              >
                                <EditIcon fontSize="inherit" />
                                <span>Editar item</span>
                                <OpenInNewIcon
                                  fontSize="inherit"
                                  className={importStyles.iconExternal}
                                />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className={importStyles.btnCadastroRapido}
                                onClick={() => handleQuickRegister(p)}
                                title="Abrir formulÃ¡rio de cadastro em nova aba"
                              >
                                <AddIcon fontSize="inherit" />
                                <span>Cadastro rÃ¡pido</span>
                                <OpenInNewIcon
                                  fontSize="inherit"
                                  className={importStyles.iconExternal}
                                />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td>{p.unidadeMedida}</td>
                      <td>{p.quantidade}</td>
                      <td>
                        {p.valorUnitario.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </td>
                      <td>
                        {p.status === 'idle' &&
                          (p.existe ? (
                            <span
                              className={importStyles.badgeExistente}
                              title="Produto jÃ¡ cadastrado no sistema"
                            >
                              <CheckCircleOutlineIcon fontSize="inherit" /> No Sistema
                            </span>
                          ) : (
                            <span className={importStyles.badgeNaoCadastrado} title="Produto novo">
                              NÃ£o Cadastrado
                            </span>
                          ))}
                        {p.status === 'ok' && (
                          <span className={importStyles.badgeOk}>
                            <CheckCircleOutlineIcon fontSize="inherit" /> Importado
                          </span>
                        )}
                        {p.status === 'estoque_atualizado' && (
                          <span
                            className={importStyles.badgeEstoqueAtualizado}
                            title={p.mensagem}
                          >
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

        {/* RodapÃ© */}
        <div className={styles.modalActions}>
          {products.length > 0 && !completed && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleImport}
              disabled={importing}
              id="btn-confirmar-importacao"
            >
              {importing ? 'Importandoâ€¦' : `Importar ${products.length} produto(s)`}
            </button>
          )}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            id="btn-fechar-import"
          >
            {completed ? 'Fechar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalImportItens;
