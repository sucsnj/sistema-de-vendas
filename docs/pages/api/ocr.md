# `src/pages/api/ocr.ts`

## Descrição

Endpoint para processar uploads OCR e extrair dados de imagens/PDFs.

## Métodos

- `POST` - recebe arquivo multipart via `Multer` e processa OCR em `src/services/ocrService.ts`.

## Observações

- Suporta extração de texto e conversão de PDF em imagem.
- Pode retornar dados de reconhecimento e informações de validação.
