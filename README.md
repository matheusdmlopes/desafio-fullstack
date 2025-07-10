# Desafio Técnico Fullstack

Neste README, documentarei minha linha de raciocínio e decisões durante o desenvolvimento do desafio técnico.

## Sobre o Projeto

Como descrito no backend/README.md, o objetivo do desafio é construir o frontend da aplicação, configurar o ambiente completo (banco de dados e backend) e entregar uma solução funcional rodando localmente.

## Objetivos do Desafio

1. Configuração do ambiente (setup)
2. Desenvolvimento do frontend
3. Melhorias e testes no backend

## Planejamento inicial

- Entender o que já está implementado em backend/
- Instalação de dependências
- Configuração do ambiente (docker e postgres)

## Considerações

### Setup

Encontrei uma inconsistência no package manager do projeto. O projeto possui um yarn.lock (indicando o uso do package manager yarn), mas os scripts de setup envolvem uma mistura entre comandos de npm e comandos com yarn. Penso se devo corrigir esta inconsistência ou utilizar os scripts conforme orientado no backend/README.md

Após tentativa de rodar o comando yarn full-setup e ter problemas com as dependências, decidi padronizar o uso do gerenciador de pacotes yarn pra aplicação, visto que o package.json indica que o package manager é o yarn@1.22.22

### Front End



## Recursos e Referências
Links e materiais que consultei durante o desenvolvimento.

### Inteligência Artificial

- Cursor (IDE)
- Claude Sonnet 4
- Gemini 2.5 Pro
- GPT 4o

### Yarn/npm

https://stackoverflow.com/questions/49589493/is-there-any-harm-in-using-npm-and-yarn-in-the-same-project

https://medium.com/@rasifsahl/can-i-use-npm-and-yarn-in-the-same-project-df005e539c83

https://www.sitepoint.com/yarn-vs-npm/

### Next.js

https://nextjs.org/docs/app/api-reference/cli/create-next-app

https://medium.com/@tahnyybelguith/consuming-apis-with-next-js-building-data-driven-web-applications-6e4c2d35a7f4
---
