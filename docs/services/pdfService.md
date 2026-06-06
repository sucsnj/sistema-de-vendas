# `src/services/pdfService.ts`

## Descrição

Serviço de processamento de PDF e imagem para extração OCR. Converte páginas PDF em PNG e aplica pré-processamentos antes do OCR.

## Responsabilidades

- Converter PDF em imagens PNG com `pdf2pic`.
- Aplicar filtros de imagem com `sharp` para melhorar OCR.
- Chamar `lerLinhaDigitavel` do serviço de OCR.
- Limpar arquivos temporários após processamento.

## Funções Principais

- `preprocessScenarios(imgPath)`
- `lerPdfComOcr(pdfPath)`

## Observações

- Processa até 3 páginas de PDF.
- Gera vários cenários de imagem para aumentar a chance de reconhecimento.
- Limpa a pasta `./temp` ao final de cada tentativa.
