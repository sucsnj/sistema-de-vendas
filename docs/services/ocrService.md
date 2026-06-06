# `src/services/ocrService.ts`

## Descrição

Serviço que executa OCR em imagens usando `tesseract.js`. Procura a linha digitável do boleto a partir de texto reconhecido.

## Responsabilidades

- Criar worker Tesseract.
- Configurar whitelist de caracteres numéricos.
- Processar imagens em texto.
- Extrair padrões de linha digitável via regex.

## Funções Principais

- `lerLinhaDigitavel(imagemPath, regexConst)`

## Observações

- O serviço retorna `null` se não encontrar correspondência.
- A função usa regex rígida para boletos bancários, o que pode falhar em formatos inesperados.
