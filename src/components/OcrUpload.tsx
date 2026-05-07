import { useState } from "react";

export default function OcrUpload() {
    const [resultado, setResultado] = useState<any>(null);

    async function uploadArquivo(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        const response = await fetch("/api/ocr", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        setResultado(data);
    }

    function copiarConteudo() {
        if (resultado) {
            navigator.clipboard.writeText(resultado)
                .then(() => {
                    alert("Linha digitável copiada!");
                })
                .catch(err => {
                    console.error("Erro ao copiar:", err);
                });
        }
    }

    return (
        <div>
            <input type="file" onChange={uploadArquivo} />

            {resultado && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {/* <pre>{JSON.stringify(resultado, null, 2)}</pre> */}
                    <pre onClick={copiarConteudo}>{typeof resultado === "string" ? resultado : JSON.stringify(resultado, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
