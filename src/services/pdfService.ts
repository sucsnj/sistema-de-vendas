import { fromPath } from "pdf2pic";
import path from "path";
import fs from "fs";

import { lerLinhaDigitavel } from "./ocrService";

export async function lerPdfComOcr(pdfPath: string) {

    const converter = fromPath(pdfPath, {
        density: 400,
        saveFilename: "pagina",
        savePath: "./temp",
        format: "png",
        width: 2480,
        height: 3508,
    });

    for (let i = 1; i <= 3; i++) {

        try {

            const page = await converter(i);

            if (!page.path) {
                continue;
            }

            const imgPath = path.resolve(page.path);

            console.log("PNG GERADA:", imgPath);

            // AQUI o OCR precisa acontecer
            const linha = await lerLinhaDigitavel(imgPath);

            console.log("LINHA:", linha);

            // comentar temporariamente
            // fs.unlinkSync(imgPath);

            if (linha) {
                return linha;
            }

        } catch (err) {
            console.error(`Erro página ${i}:`, err);
        }
    }

    return null;
}