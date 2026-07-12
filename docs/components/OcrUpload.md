# `src/components/OcrUpload.tsx`

## Descrição

Componente de frontend para upload de arquivos PDF/imagem e exibição de resultados de OCR.

## Contexto

É usado para ler as informações de um arquivo PDF ou imagem e convertê-las em texto, que depois é salvo no localStorage para ser usado em outras partes do sistema.

## Responsabilidades

- Aceitar uploads múltiplos de `.pdf`, `.jpg`, `.jpeg`, `.png`.
- Enviar arquivos para `/api/ocr`.
- Exibir retorno de OCR na tela.
- Copiar conteúdo reconhecido para a área de transferência.

## Dependências

- `Toast`

## Observações

- Salva o último resultado de OCR em `localStorage`.
- Usa `Toast` para mensagens de status.
- Não implementa validação do texto retornado além de erro genérico.
