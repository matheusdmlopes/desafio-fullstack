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

Pro desenvolvimento do front end, inicialmente pensei em só fazer um dashboard com as funcionalidades básicas (CRUD), mas após maturar um pouco mais a ideia e analisar melhor os dados que já estão alimentados no banco, cheguei a ideia final de fazer algo como um website completo, tendo um frontend público onde os dados serão apenas renderizados pra visualização, e o dashboard sendo administrativo, acessível somente via autenticação (login e senha) onde lá sim, poderá ser realizado ações como adição, edição e exclusão dos dados.

A ideia são rotas públicas (/pokemons, /posts, etc) e rotas protegidas (/login, /admin/*), trazendo assim uma solução "completa" dentro do contexto do projeto.

No consumo dos dados do backend temos tanto rotas REST quanto queries GraphQL, pra maioria dos casos estou utilizando graphql e, pro cenário específico do caso do blog irei utilizar /posts/:id , visto que no backend essa query não está implementada. Rota esta que é protegida pelo jwt, então estou buscando maneiras de, invés de comentar a proteção, fazê-la funcionar de fato.

### Back End

No back end, haviam validações de token JWT pra todas rotas e queries (tanto REST quanto graphql), inicialmente pro desenvolvimento do front end comentei os jwtguards pra conseguir desenvolver as telas.

A strategy jwt não estava criada, então pedi pro Claude criar tanto a estratégia quanto um sistema de "auto login", pra que crie um token jwt válido assim que o usuário acesse o localhost. Não é o ideal, visto que seria interessante um sistema de login e senha, mas como a table "users" não possuía o campo password, pra não adicionar uma complexidade adicional muito grande e talvez desnecessária, optei por esta linha de auto login, focando nas funcionalidades core do projeto.

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

https://daily.dev/blog/next-js-graphql-integration-basics

### NestJS

https://docs.nestjs.com/recipes/passport

https://blog.mocsolucoes.com.br/desenvolvimento-web/nestjs-vs-expressjs-qual-escolher/

---
