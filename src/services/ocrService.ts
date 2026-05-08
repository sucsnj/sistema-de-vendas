import Tesseract from "tesseract.js";

export async function lerLinhaDigitavel(imagemPath: string) {

    try {

        console.log("OCR EXECUTANDO:", imagemPath);

        const worker = await Tesseract.createWorker("eng");

        await worker.setParameters({
            tessedit_char_whitelist: "0123456789. "
        });

        const resultado = await worker.recognize(imagemPath);

        await worker.terminate();

        console.log("TEXTO OCR:");
        console.log(resultado.data.text);

        const texto = resultado.data.text
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ");

        const regex =
            /\d{5}\.?\d{5}\s?\d{5}\.?\d{6}\s?\d{5}\.?\d{6}\s?\d\s?\d{14}/g;

        const linha = texto.match(regex);

        console.log("MATCHES:", linha);

        if (linha) {
            return linha[0]
                .replace(/\s/g, "")
                .replace(/\./g, "");
        }

        return null;

    } catch (err) {

        console.error("Erro no OCR:", err);

        return null;
    }
}