import { useState } from "react";
import Toast from './Toast';

export default function OcrUpload() {
    const [resultado, setResultado] = useState<any>(null);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

    async function uploadArquivo(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append("files", file);
        });

        // Mostra Toast de carregamento
        setToastMessage("Carregando OCR...");
        setToastType("info");
        setToastOpen(true);

        try {
            const response = await fetch("/api/ocr", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setResultado(data);

            // Atualiza Toast para sucesso
            setToastMessage("OCR finalizado com sucesso!");
            setToastType("success");
            setToastOpen(true);
        } catch (err) {
            console.error("Erro no OCR:", err);

            // Atualiza Toast para erro
            setToastMessage("Erro ao processar OCR");
            setToastType("error");
            setToastOpen(true);
        }
    }

    function copiarConteudo(texto: string) {

        navigator.clipboard.writeText(texto)
            .then(() => {

                setToastMessage("Linha digitável copiada!");
                setToastType("success");
                setToastOpen(true);

            })
            .catch(err => {

                console.error("Erro ao copiar:", err);

                setToastMessage("Erro ao copiar conteúdo");
                setToastType("error");
                setToastOpen(true);
            });
    }

    return (
        <div>
            <input type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="ocr-upload" multiple onChange={uploadArquivo} />

            {resultado && (
                <div className="ocr-results">
                    {resultado.map((item: any, index: number) => (
                        <pre
                            key={index}
                            className="ocr-upload-wrapper"
                            onClick={() => copiarConteudo(item)}>
                            <strong>{item.arquivo}</strong>
                            {"\n"}
                            {item || item.erro}
                        </pre>
                    ))}
                </div>
            )}

            <Toast
                open={toastOpen}
                message={toastMessage}
                type={toastType}
                onClose={() => setToastOpen(false)}
                position="top-right"
            />

            <style jsx>{`
                .ocr-results {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                }

                .ocr-upload-wrapper {
                    width: 100%;
                    padding: 0px 5px 5px 7px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: var(--foreground);
                    backdrop-filter: blur(12px);
                    transition:
                        transform 0.2s ease,
                        background 0.2s ease,
                        border-color 0.2s ease,
                        box-shadow 0.2s ease;
                    overflow-x: auto;
                    line-height: 1.5;

                    white-space: pre-wrap;
                    word-break: break-word;
                    user-select: all;
                }

                .ocr-upload-wrapper:hover {
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                    box-shadow:
                        0 8px 24px rgba(0, 0, 0, 0.18);
                }

                .ocr-upload-wrapper:active {
                    transform: scale(0.99);
                }

                .ocr-upload {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--foreground);
                    backdrop-filter: blur(10px);
                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease,
                        box-shadow 0.2s ease;
                    outline: none;
                }

                .ocr-upload:hover {
                    background: rgba(255, 255, 255, 0.09);
                }

                .ocr-upload:focus {
                    border-color: rgba(255, 255, 255, 0.28);
                    box-shadow:
                        0 0 0 4px rgba(255, 255, 255, 0.06);
                }

                .ocr-upload::file-selector-button {
                    margin-right: 12px;
                    padding: 8px 14px;
                    border: none;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.14);
                    color: var(--foreground);
                    cursor: pointer;
                    transition:
                        background 0.2s ease,
                        transform 0.2s ease;
                }

                .ocr-upload::file-selector-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}
