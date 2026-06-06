# `src/components/ContasAPagarModals.tsx`

## Descrição

Componentes de modal para exibição de detalhes da conta e confirmação de pagamento.

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

## Observações

- O modal previne propagation para clique fora do conteúdo.
- A ação de salvar é delegada ao callback `onSave`.
