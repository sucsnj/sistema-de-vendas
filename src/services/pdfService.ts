import { fromPath } from "pdf2pic";
import path from "path";
import fs from "fs";
import { lerLinhaDigitavel } from "./ocrService";

export async function lerPdfComOcr(pdfPath: string, numPages: number) {
    const converter = fromPath(pdfPath, {
        density: 200,
        saveFilename: "page",
        savePath: "./temp",
        format: "png",
        width: 1200,
        height: 1600,
    });

    let textoFinal = "";

    for (let i = 1; i <= numPages; i++) {
        const page = await converter(i);
        if (!page.path) {
            throw new Error(`Página ${i} não gerou imagem`);
        }
        const imgPath = path.resolve(page.path);

        const linha = await lerLinhaDigitavel(imgPath);
        if (linha) textoFinal += linha + " ";

        fs.unlinkSync(imgPath); // limpa arquivo temporário
    }

    return textoFinal.trim() || null;
}
