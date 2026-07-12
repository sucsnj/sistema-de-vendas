# `src/components/ContasAPagarHeader.tsx`

## Descrição

Componente de cabeçalho do Contas a Pagar.

## Contexto

Utilizado no Contas a Pagar para exibir dados do ano e mês atual.

## Responsabilidades

- Exibir dados do ano e mês atual.
- Exibir botão de backup.
- Exibir botão de navegação para o menu principal.

## Props

- `ano`, `setAno` - ano atual.
- `mes`, `setMes` - mês atual.
- `handleBackup` - callback para o botão de backup.

## Dependências

- `date` (formatação e timestamp).

## Exemplo de uso

```tsx
<ContasAPagarHeader
  ano={ano}
  setAno={setAno}
  mes={mes}
  setMes={setMes}
  handleBackup={handleBackup}
/>
```

## Observações

- Utiliza `capitalize` para formatar o nome do mês.
