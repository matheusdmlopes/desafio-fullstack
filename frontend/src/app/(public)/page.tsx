import Link from "next/link";
import { Zap, Users, FileText, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Desafio Técnico Fullstack
            </h1>
            <p className="mt-6 text-xl leading-8 text-blue-100 max-w-3xl mx-auto">
              Uma aplicação completa demonstrando desenvolvimento frontend e backend,
              integração GraphQL, autenticação e gerenciamento de dados.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/pokemons"
                className="bg-white px-6 py-3 text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
              >
                Explorar Pokemon
              </Link>
              <Link
                href="/posts"
                className="border border-white px-6 py-3 text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Ver Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Explore as Funcionalidades
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pokemon Card */}
            <Link
              href="/pokemons"
              className="group p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <Zap className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Pokemon</h3>
                <p className="text-yellow-100">
                  Explore nossa coleção de Pokemon com filtros por tipo e habilidade.
                </p>
              </div>
            </Link>

            {/* Users Card */}
            <Link
              href="/users"
              className="group p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <Users className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Usuários</h3>
                <p className="text-blue-100">
                  Conheça os perfis de usuários e suas contribuições na plataforma.
                </p>
              </div>
            </Link>

            {/* Blog Card */}
            <Link
              href="/posts"
              className="group p-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <FileText className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Blog</h3>
                <p className="text-green-100">
                  Artigos técnicos organizados por categorias e autores.
                </p>
              </div>
            </Link>

            {/* Admin Card */}
            <Link
              href="/dashboard"
              className="group p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <Shield className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Dashboard</h3>
                <p className="text-gray-300">
                  Área administrativa para gerenciar conteúdo e dados.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* README Documentation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Documentação do Processo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Minha linha de raciocínio e decisões técnicas durante o desenvolvimento
            </p>
          </div>

          {/* README Container - GitHub Style */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* File Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">README.md</span>
                </div>
              </div>

              {/* README Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Desafio Técnico Fullstack</h1>

                  <p className="text-gray-600 mb-6">
                    Neste README, documentarei minha linha de raciocínio e decisões durante o desenvolvimento do desafio técnico.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Sobre o Projeto</h2>
                  <p className="text-gray-600 mb-6">
                    Como descrito no backend/README.md, o objetivo do desafio é construir o frontend da aplicação,
                    configurar o ambiente completo (banco de dados e backend) e entregar uma solução funcional rodando localmente.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Objetivos do Desafio</h2>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                    <li>Configuração do ambiente (setup)</li>
                    <li>Desenvolvimento do frontend</li>
                    <li>Melhorias e testes no backend</li>
                  </ol>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Planejamento inicial</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>Entender o que já está implementado em backend/</li>
                    <li>Instalação de dependências</li>
                    <li>Configuração do ambiente (docker e postgres)</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Considerações</h2>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Setup</h3>
                  <p className="text-gray-600 mb-4">
                    Encontrei uma inconsistência no package manager do projeto. O projeto possui um yarn.lock
                    (indicando o uso do package manager yarn), mas os scripts de setup envolvem uma mistura entre
                    comandos de npm e comandos com yarn. Penso se devo corrigir esta inconsistência ou utilizar
                    os scripts conforme orientado no backend/README.md
                  </p>
                  <p className="text-gray-600 mb-6">
                    Após tentativa de rodar o comando yarn full-setup e ter problemas com as dependências,
                    decidi padronizar o uso do gerenciador de pacotes yarn pra aplicação, visto que o
                    package.json indica que o package manager é o yarn@1.22.22
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Front End</h3>
                  <p className="text-gray-600 mb-4">
                    Pro desenvolvimento do front end, inicialmente pensei em só fazer um dashboard com as
                    funcionalidades básicas (CRUD), mas após maturar um pouco mais a ideia e analisar melhor
                    os dados que já estão alimentados no banco, cheguei a ideia final de fazer algo como um
                    website completo, tendo um frontend público onde os dados serão apenas renderizados pra
                    visualização, e o dashboard sendo administrativo, acessível somente via autenticação
                    (login e senha) onde lá sim, poderá ser realizado ações como adição, edição e exclusão dos dados.
                  </p>
                  <p className="text-gray-600 mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <strong>A ideia:</strong> rotas públicas (/pokemons, /posts, etc) e rotas protegidas
                    (/login, /admin/*), trazendo assim uma solução "completa" dentro do contexto do projeto.
                  </p>
                  <p className="text-gray-600 mb-6">
                    No consumo dos dados do backend temos tanto rotas REST quanto queries GraphQL, pra maioria dos casos estou utilizando graphql e, pro cenário específico do caso do blog irei utilizar /posts/:id , visto que no backend essa query não está implementada. Rota esta que é protegida pelo jwt, então estou buscando maneiras de, invés de comentar a proteção, fazê-la funcionar de fato.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Back End</h3>
                  <p className="text-gray-600 mb-4">
                    No back end, haviam validações de token JWT pra todas rotas e queries (tanto REST quanto graphql), inicialmente pro desenvolvimento do front end comentei os jwtguards pra conseguir desenvolver as telas.
                  </p>
                  <p className="text-gray-600 mb-4">
                    A strategy jwt não estava criada, então pedi pro Claude criar tanto a estratégia quanto um sistema de "auto login", pra que crie um token jwt válido assim que o usuário acesse o localhost. Não é o ideal, visto que seria interessante um sistema de login e senha, mas como a table "users" não possuía o campo password, pra não adicionar uma complexidade adicional muito grande e talvez desnecessária, optei por esta linha de auto login, focando nas funcionalidades core do projeto.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Além disso, alterei uma validação do zod pra forçar o ID sendo do tipo number, visto que era o que o graphql esperava (commit #ee197d098...) receber, mas chegava em string por algum motivo.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Pra finalizar, solicitei a IA pra que fizesse a criação de testes no backend, onde foi realizado 100% de coverage dos services, além de testes na rota REST Users, além de também no graphql controller de user também.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Recursos e Referências</h2>
                  <p className="text-gray-600 mb-4">Links e materiais que consultei durante o desenvolvimento.</p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Inteligência Artificial</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
                    <li>Cursor (IDE)</li>
                    <li>Claude Sonnet 4</li>
                    <li>Gemini 2.5 Pro</li>
                    <li>GPT 4o</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Yarn/npm</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
                    <li><a href="https://stackoverflow.com/questions/49589493/is-there-any-harm-in-using-npm-and-yarn-in-the-same-project" className="text-blue-600 hover:underline">Stack Overflow - npm vs yarn</a></li>
                    <li><a href="https://medium.com/@rasifsahl/can-i-use-npm-and-yarn-in-the-same-project-df005e539c83" className="text-blue-600 hover:underline">Medium - npm and yarn together</a></li>
                    <li><a href="https://www.sitepoint.com/yarn-vs-npm/" className="text-blue-600 hover:underline">SitePoint - Yarn vs npm</a></li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Next.js</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
                    <li><a href="https://nextjs.org/docs/app/api-reference/cli/create-next-app" className="text-blue-600 hover:underline">Next.js CLI Reference</a></li>
                    <li><a href="https://medium.com/@tahnyybelguith/consuming-apis-with-next-js-building-data-driven-web-applications-6e4c2d35a7f4" className="text-blue-600 hover:underline">Medium - APIs with Next.js</a></li>
                    <li><a href="https://daily.dev/blog/next-js-graphql-integration-basics" className="text-blue-600 hover:underline">Daily.dev - Next.js GraphQL Integration</a></li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">NestJS</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
                    <li><a href="https://docs.nestjs.com/recipes/passport" className="text-blue-600 hover:underline">NestJS Passport Documentation</a></li>
                    <li><a href="https://blog.mocsolucoes.com.br/desenvolvimento-web/nestjs-vs-expressjs-qual-escolher/" className="text-blue-600 hover:underline">Blog - NestJS vs ExpressJS</a></li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">TypeScript</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
                    <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/BigInt_not_serializable" className="text-blue-600 hover:underline">MDN - BigInt Serialization Issues</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Desafio Técnico Fullstack</h3>
            <p className="text-gray-400 mb-8">
              Demonstrando habilidades de desenvolvimento web moderno
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/pokemons" className="text-gray-400 hover:text-white transition-colors">
                Pokemon
              </Link>
              <Link href="/users" className="text-gray-400 hover:text-white transition-colors">
                Users
              </Link>
              <Link href="/posts" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
