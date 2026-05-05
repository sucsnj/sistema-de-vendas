# Vendas App

Painel de vendas simples para gerenciamento diário e exportação de dados.

## Sobre o projeto

Este projeto é um sistema de controle de vendas que permite cadastrar, editar, excluir e visualizar vendas diárias. Ele oferece suporte a exportação de dados em formato XLSX e PDF, além de importação de planilhas XLSX para registros do dia ou do mês selecionado.

A aplicação foi desenvolvida sob supervisão humana e com coautoria da Inteligência Artificial como assistente de criação e revisão em todas as etapas do projeto.

## Autoria

- Desenvolvedor supervisório: usuário responsável pela definição do escopo, revisão e validação técnica.
- Coautora de IA: assistente de desenvolvimento que ajudou a revisar, documentar e organizar o projeto.

## Funcionalidades principais

- Registro de vendas diárias com valor e observações
- Visualização de vendas do mês selecionado
- Resumo do período com total, quantidade e ticket médio
- Resumo do dia selecionado quando um dia estiver ativo
- Exportação para XLSX por mês ou dia
- Importação de XLSX por mês ou dia
- Exportação de relatório em PDF
- Tema claro/escuro alternável
- Backup local do banco de dados SQLite

## Tecnologias usadas

- Next.js 16
- React 19
- TypeScript
- SQLite com `better-sqlite3`
- XLSX para importação/exportação de planilhas
- `html2canvas` e `jspdf` para exportação em PDF

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra o navegador em:

```bash
http://localhost:3000
```

4. Para gerar uma versão de produção:

```bash
npm run build
```

## Estrutura do projeto

- `src/pages/` - páginas da aplicação
- `src/components/` - componentes de interface
- `src/services/` - integração com APIs internas
- `src/database/` - camada de acesso ao SQLite
- `src/styles/` - estilos globais e modulares

## Preparação para GitHub

Este repositório está hospedado no GitHub em: https://github.com/sucsnj/sistema-de-vendas

- Arquivo `.gitignore` configurado para ignorar dependências locais, builds, banco de dados e arquivos temporários
- `.gitattributes` incluído para manter consistência de final de linha e tratamento de texto
- `README.md` atualizado com informações de uso e autoria

## Notas adicionais

Substitua os valores de autoria e de repositório conforme necessário antes da publicação.
