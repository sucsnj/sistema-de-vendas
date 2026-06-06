# `src/utils`

## Descrição

Pacote de utilitários usados em toda a aplicação para formatação, parsing e limpeza de dados.

## Módulos

- `captalize.tsx` - funções de capitalização de texto.
- `cleaner.tsx` - limpeza de arquivos temporários `temp`.
- `date.ts` - formatação e manipulação de datas, nomes de meses e conversão de strings.
- `edit.ts` - regra de edição de vendas com limite de 2 dias.
- `formatter.tsx` - formatação de valores monetários.
- `number.ts` - parsing de números com suporte a formatos brasileiros.

## Observações

- O utilitário `date.ts` mistura `date-fns` com `dayjs` e tem várias funções utilitárias.
- `cleaner.tsx` é usado apenas no backend para remover arquivos temporários.
- `parseNumber` em `number.ts` normaliza vírgulas e pontos para o padrão decimal.
