# `src/components/ContasAPagarModals.tsx`

## Descrição

Componentes de modal para exibição de detalhes da conta e confirmação de pagamento.

## Contexto

Utilizado no Contas a Pagar para exibir detalhes de contas e confirmação de pagamentos.

## Responsabilidades

- Mostrar detalhes completos de uma conta selecionada.
- Permitir edição inline dos campos quando a conta está em modo de edição.
- Exibir modal de observações ao pagar uma conta.
- Fechar e cancelar ações de forma segura.

## Props

- `selectedConta`, `editingConta`
- estados de campos editáveis e setters
- `payModalOpen`, `payObservacao`, `setPayObservacao`
- callbacks de fechamento, edição, pagamento e cancelamento

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `useShortcuts` (captura de atalhos de teclado).
- `useFocusTrap` (mantém foco dentro do modal).

## Exemplo de uso

```tsx
<ContasAPagarModals
  selectedConta={selectedConta}
  editingConta={editingConta}
  distribuidora={distribuidora}
  setDistribuidora={setDistribuidora}
  valor={valor}
  setValor={setValor}
  vencimento={vencimento}
  setVencimento={setVencimento}
  documento={documento}
  setDocumento={setDocumento}
  bancoObservacoes={bancoObservacoes}
  setBancoObservacoes={setBancoObservacoes}
  payModalOpen={payModalOpen}
  payObservacao={payObservacao}
  setPayObservacao={setPayObservacao}
  onCloseSelectedConta={onCloseSelectedConta}
  onEditar={onEditar}
  onCancelEdit={onCancelEdit}
  onStartPayment={onStartPayment}
  onConfirmPayment={onConfirmPayment}
  onClosePayModal={onClosePayModal}
  onCancelPayment={onCancelPayment}
/>
```

## Observações

- O modal previne propagation para clique fora do conteúdo.
- A ação de salvar é delegada ao callback `onSave`.
