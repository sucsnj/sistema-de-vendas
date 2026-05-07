import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import path from "path";

import { lerLinhaDigitavel } from "@/services/ocrService";
import { lerPdfComOcr } from "@/services/pdfService";

export const config = {
    api: {
        bodyParser: false,
    },
};

const upload = multer({
    dest: "uploads/",
});

function runMiddleware(req: any, res: any, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, upload.single("file"));
    const file = (req as any).file;

    if (!file) {
        return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let linhaDigitavel: string | null = null;

    try {
        if (ext === ".pdf") {
            if (!fs.existsSync("./temp")) {
                fs.mkdirSync("./temp");
            }
            linhaDigitavel = await lerPdfComOcr(file.path, 3);
        } else {
            linhaDigitavel = await lerLinhaDigitavel(file.path);
        }

        if (!linhaDigitavel) {
            return res.status(422).json({ error: "Não foi possível extrair a linha digitável" });
        }

        return res.status(200).json(linhaDigitavel);
    } catch (err) {
        console.error("Erro no processamento:", err);
        return res.status(500).json({ error: "Falha ao processar arquivo" });
    } finally {
        try {
            fs.unlinkSync(file.path); // remove o arquivo original só aqui
        } catch (cleanupErr) {
            console.warn("Falha ao limpar arquivo temporário:", cleanupErr);
        }
    }
}
