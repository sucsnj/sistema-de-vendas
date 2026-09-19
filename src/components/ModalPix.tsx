import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { renderQr, pulseQr, QR_SIZE } from './QrPix';
import { copyToClipboard, downloadQrPng, printPixSheet, showToast, type PrintSheetData } from './ActionPix';
import { initIcons } from '../utils/iconsPix';

interface ModalPixProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string;
  merchantName: string;
  merchantBank: string;
  amount: string | null;
  pixKey: string;
}

function ModalPixContent({
  isOpen,
  onClose,
  payload,
  merchantName,
  merchantBank,
  amount,
  pixKey,
}: ModalPixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    let mounted = true;
    (async () => {
      try {
        await renderQr(canvasRef.current!, payload);
        if (mounted) {
          setQrLoaded(true);
          pulseQr(containerRef.current);
        }
      } catch {
        if (mounted) showToast('Erro ao gerar QR Code', 'error');
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, payload]);

  useEffect(() => {
    if (isOpen) {
      initIcons(document);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    await copyToClipboard(payload, () => showToast('PIX Copia e Cola copiado!'), (e) => showToast('Erro ao copiar: ' + String(e), 'error'));
  };

  const handleDownload = async () => {
    try {
      await downloadQrPng(payload);
      showToast('QR Code salvo como PNG!');
    } catch {
      showToast('Erro ao baixar QR Code', 'error');
    }
  };

  const handlePrint = async () => {
    const data: PrintSheetData = {
      payload,
      name: merchantName,
      bank: merchantBank,
      amount,
      key: pixKey,
    };
    await printPixSheet(data);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-pix" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>QR Code PIX</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <i data-lucide="x" className="h-5 w-5"></i>
          </button>
        </div>
        <div className="modal-body">
          <canvas ref={canvasRef} width={QR_SIZE} height={QR_SIZE} className={`qr-canvas ${qrLoaded ? 'loaded' : ''}`} />
          <div className="pix-info">
            <div className="info-row"><span>Nome:</span> <strong>{merchantName}</strong></div>
            <div className="info-row"><span>Banco:</span> <strong>{merchantBank}</strong></div>
            <div className="info-row"><span>Valor:</span> <strong>{amount ? `R$ ${Number(amount).toFixed(2).replace('.', ',')}` : 'Aberto'}</strong></div>
            <div className="info-row"><span>Chave:</span> <strong>{pixKey}</strong></div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="action-button" onClick={handleCopy}>
            <i data-lucide="copy" className="h-4 w-4"></i> Copiar
          </button>
          <button className="action-button" onClick={handleDownload}>
            <i data-lucide="download" className="h-4 w-4"></i> Baixar PNG
          </button>
          <button className="action-button" onClick={handlePrint}>
            <i data-lucide="printer" className="h-4 w-4"></i> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModalPix(props: ModalPixProps) {
  if (!props.isOpen) return null;
  return createPortal(<ModalPixContent {...props} />, document.body);
}