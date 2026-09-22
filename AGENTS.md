# AGENTS.md — Sistema de Gestão de Vendas

## Regra de ouro: documentação antes de código

Este projeto tem documentação estruturada em `docs/`. **Não releia código sem necessidade** — o contexto do projeto é carregado a partir da documentação:

1. Antes de qualquer tarefa, rode o comando **`/context`** no opencode (ou leia `docs/CONTEXT.md`, `docs/README.md` e `docs/DOCS.md`).
2. Use `docs/README.md` como índice central; cada camada tem docs próprios em `docs/pages`, `docs/pages/api`, `docs/services`, `docs/database`, `docs/components`, `docs/hooks`, `docs/utils` e `docs/types`.
3. Se a documentação estiver incompleta ou desatualizada: leia o código com moderação e **atualize o documento correspondente** em `docs/`.
4. Ao criar um arquivo novo em `src/`, garanta o doc correspondente em `docs/` e inclua-o no índice `docs/README.md`.

## Contexto rápido

- Stack: Next.js 16 + React 19 + TypeScript + MUI + React Query; persistência local SQLite (`better-sqlite3`, bancos em `db/`).
- Páginas em `src/pages/`, API interna em `src/pages/api/`, UI em `src/components/`, cliente HTTP em `src/services/`, persistência em `src/database/`, hooks em `src/hooks/`, utilitários em `src/utils/`, tipos em `src/types/`.
- Bancos: `db.db` (vendas), `contas.db`, `notas.db`, `tabela.db`, `produtos.db`.
- Timezone padrão de datas: `America/Recife`.

## Comandos úteis

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` — build de produção.
- `npm run lint` — lint (eslint).
- `/context` — carrega o contexto do projeto a partir da documentação.
- `/skill fritar` — invoca a skill `grill-with-docs` (entrevista de design + ADRs).
- `/skill ensinar` — invoca a skill `teach` (aprendizado em workspace guiado).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->