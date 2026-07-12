# `src/components/ContasAPagarForm.tsx`

## Descrição

Formulário de cadastro e edição de contas a pagar.

## Contexto
Utilizado no Contas a Pagar para cadastrar e editar contas.

## Responsabilidades

- Receber dados básicos da conta: distribuidora, valor, vencimento, documento e observações.
- Alternar entre modo de criação e edição.
- Disparar ações de importação XML.

## Props

- `distribuidora`, `setDistribuidora`
- `valor`, `setValor`
- `vencimento`, `setVencimento`
- `documento`, `setDocumento`
- `bancoObservacoes`, `setBancoObservacoes`
- `editingConta` - conta atualmente em edição.
- `onSubmit` / `onReset` / `onImportXML` / `onCancelarEdicao`
- `distribuidoraInputRef` - ref para foco automático.

## Dependências

- `date` (formatação e timestamp).

## Observações

- Utiliza estilos de `contas.module.css`.
- Mantém o formulário simples e direto, delegando validação ao pai.
