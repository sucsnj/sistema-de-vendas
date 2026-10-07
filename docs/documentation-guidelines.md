# Padrão de documentação do projeto

> Este guia define **como e onde** documentar mudanças. Todo agente de IA deve segui-lo (regra do `AGENTS.md`). O objetivo: a documentação acompanha o código — nenhuma mudança significativa termina sem seu registro.

## Princípios

1. **A documentação vem antes do código.** Consulte `docs/` (comece por `docs/CONTEXT.md`, `docs/README.md` e `PROJECT_STATUS.md`) antes de ler código.
2. **Fonte única por assunto.** Um tópico tem um doc dono; não duplique assuntos entre docs.
3. **Semantic versioning de docs.** Onde o código muda, o doc muda na mesma entrega.
4. **Padrão emerge e se documenta.** Ao repetir um padrão pela 2ª vez, registre-o (uma regra nova em `AGENTS.md`, um ADR, ou uma seção em `docs/`).

## O que documentar onde

| Mudança | Onde registrar |
| --- | --- |
| Arquivo/componente/hook/utilitário **novo** em `src/` | Doc em `docs/` correspondente (`components/`, `hooks/`, `utils/`, `pages/…`) + índice `docs/README.md` |
| Comportamento/assinatura alterado de algo existente | Atualizar o doc dono em `docs/` |
| Regra de negócio nova ou alterada | `docs/ALIGNMENT.md` §3 (regras de domínio) ou seção de regras do doc dono |
| Decisão de **arquitetura** (impacta várias camadas / cria padrão) | **ADR** em `docs/adr/` + índice `docs/README.md` |
| Estado do projeto (o que foi feito/pendente/futuro) | `PROJECT_STATUS.md` (sempre; com a data no topo) |
| Contexto geral (camadas, bancos, páginas, regras de agente) | `docs/CONTEXT.md` |
| Convenções/regras para agentes | `AGENTS.md` (agentes leem isso antes de tudo) |

### Checklist ao concluir uma mudança significativa

1. `PROJECT_STATUS.md` — mover para "Últimas mudanças", ajustar "Pendentes"/"Futuras" e atualizar a data.
2. Doc dono em `docs/` atualizado (assinaturas, comportamento, caminhos).
3. Índice `docs/README.md` atualizado se houver doc novo ou entrada desatualizada.
4. `docs/CONTEXT.md` atualizado se o contexto geral mudar (tabela "Tema → Documentos").
5. **ADR** criado se a mudança criar/alterar um padrão de arquitetura.
6. `AGENTS.md` atualizado se uma convenção/regra nova se consolidar.

## Quando criar um ADR

Crie um ADR quando a decisão:

- afeta mais de uma camada ou cria um contrato/padrão transversal (ex.: validação — 0002, toasts — 0003);
- for técnica e tiver alternativas relevantes;
- precisar de contexto para não ser revertida por engano no futuro.

Use o mesmo formato dos ADRs existentes (`docs/adr/XXXX-*.md`): `# ADR NNNN — Título`, `- Status`, `- Contexto`, `- Decisão`, `- Consequências`, `- Alternativas consideradas`, `- Referências`.

## Estilo

- Idioma: **pt-BR** (domínio do negócio e das mensagens da UI).
- Títulos `#` nas seções; assinaturas em blocos de código ```ts```;
- Nomeie arquivos de doc pelo **nome do componente/arquivo-fonte** que documentam (ex.: `Toast.md`, `DailySaleForm.md`).
- Guia rápido para agentes: `docs/CONTEXT.md`. Índice central: `docs/README.md`.