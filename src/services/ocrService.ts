import Tesseract from 'tesseract.js';
// import sharp from 'sharp';

export async function lerLinhaDigitavel(imagemPath: string) {
  try {
    const imagemTratada = "temp.png";

    // TODO: sharp não reconhece o arquivo como imagem, por isso não faz nada
    // await sharp(imagemPath)
    //   .grayscale()
    //   .normalize()
    //   .threshold(180)
    //   .sharpen()
    //   .toFile(imagemTratada);

    const worker = await Tesseract.createWorker("eng");

    await worker.setParameters({
      tessedit_char_whitelist: "0123456789. "
    });

    // OCR na imagem tratada
    const resultado = await worker.recognize(imagemPath);
    await worker.terminate();

    const texto = resultado.data.text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");

    const regex = /\d{5}\.?\d{5}\s?\d{5}\.?\d{6}\s?\d{5}\.?\d{6}\s?\d\s?\d{14}/g;
    const linha = texto.match(regex);

    // remover espaços e pontos
    if (linha) {
      return linha[0].replace(/\s/g, "").replace(/\./g, "");
    }

    return linha?.[0] || null;
  } catch (err) {
    console.error("Erro no OCR:", err);
    return null;
  }
}
