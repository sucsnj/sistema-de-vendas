# `src/components/payables/PayablesForm.tsx`

> Formulário de cadastro/edição de contas a pagar.

## O que faz

- Campos Distribuidora, Valor (`step=0.01`), Vencimento, Documento e Banco/Observações.
- Ações: "Cadastrar Conta"/"Salvar Alteração" (edição), "Limpar Campos", "Importar XML" e "Cancelar" (edição).
- Expõe refs dos inputs ao pai (foco/validação).

```ts
interface ContasAPagarFormProps {
  distribuidora: string; valor: string; vencimento: string; documento: string;
  bancoObservacoes: string; editingConta: ContaDetalhe | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void; onImportXML: () => Promise<void>; onCancelarEdicao: () => void;
  distribuidoraInputRef; valorInputRef; dataInputRef; documentoInputRef;
}
```

## Relações

- **Usa:** `ContaDetalhe` (`src/services/contasService.ts`), `contas.module.css`, ícones MUI.
- **Usado por:** `../../pages/contas-a-pagar.md`.

## Notas

- Apresentacional: validação e chamadas de API ficam na página.
