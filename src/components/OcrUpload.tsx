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
        formData.append("file", e.target.files[0]);

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

    function copiarConteudo() {
        if (resultado) {
            navigator.clipboard.writeText(
                typeof resultado === "string" ? resultado : JSON.stringify(resultado, null, 2)
            )
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
    }

    return (
        <div>
            <input type="file" className="ocr-upload" onChange={uploadArquivo} />

            {resultado && (
                <div>
                    <pre className="ocr-upload-wrapper"
                        onClick={copiarConteudo}>
                        {typeof resultado === "string" ? resultado : JSON.stringify(resultado, null, 2)}
                    </pre>
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
                .ocr-upload-wrapper {
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--surface-soft);
                    color: var(--foreground);
                    min-width: 130px;
                    height: 42px;
                }

                .ocr-upload-wrapper {
                    background: rgba(255, 255, 255, 0.14);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    transition: transform 0.25s ease, background 0.25s ease;
                }

                .ocr-upload-wrapper:hover {
                    cursor: pointer;
                    background: var(--surface-softer);
                }

                .ocr-upload {
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--surface-soft);
                    color: var(--foreground);
                    min-width: 130px;
                    height: 42px;
                }
            `}</style>
        </div>
    );
}
