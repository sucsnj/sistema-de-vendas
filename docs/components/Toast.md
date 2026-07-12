# `src/components/Toast.tsx`

## Descrição

Componente de notificação flutuante que exibe mensagens para o usuário.

## Contexto

É usado em diversos componentes para exibir mensagens de sucesso, erro ou informação ao usuário.

## Responsabilidades

- Exibir mensagens de forma clara e visível.
- Permitir o fechamento manual pelo usuário.
- Controlar o tempo de exibição.

## Props

- `open` - indica se o toast deve ser exibido.
- `message` - mensagem a ser exibida.
- `type` - tipo de mensagem ('success', 'error', 'info').
- `onClose` - callback para fechar o toast.
- `position` - posição do toast na tela.
- `duration` - tempo de exibição em milissegundos.

## Dependências

- `useEffect`

## Observações

- O toast é fechado automaticamente após o tempo definido em `duration`.
- Pode ser posicionado em diferentes locais da tela.