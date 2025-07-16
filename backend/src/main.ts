import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as bodyParser from 'body-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})
  app.use(bodyParser.json({ limit: '500mb' }))
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }))
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,HEAD')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    next()
  })

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    exposedHeaders: ['FileName'],
  })

  // 📋 Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Desafio Full-Stack API')
    .setDescription(`
      🚀 **Backend API para Desafio Técnico Full-Stack**
      
      Esta API fornece endpoints REST e GraphQL para gerenciamento de:
      - 👥 **Usuários e Perfis** - Sistema completo de usuários
      - 📝 **Posts e Categorias** - Sistema de conteúdo com categorização
      - 🐾 **Pokemon** - Catálogo de Pokemon
      - 📊 **Analytics** - Relatórios e métricas avançadas
      - 📈 **Large Table** - Dados de performance para testes de escala
      
      **🔐 Autenticação:** Todas as rotas protegidas requerem JWT Bearer Token.
      
      **🧪 Auto-Login:** Use POST /auth/auto-login para obter um token de demonstração.
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('🔐 Authentication', 'Sistema de autenticação e autorização')
    .addTag('👥 Users', 'Gerenciamento de usuários')
    .addTag('👤 Profiles', 'Perfis de usuários')
    .addTag('📝 Posts', 'Sistema de posts e conteúdo')
    .addTag('📂 Categories', 'Categorias para organização de posts')
    .addTag('🐾 Pokemon', 'Catálogo de Pokemon')
    .addTag('📊 Analytics', 'Relatórios e métricas do sistema')
    .addTag('📈 Large Table', 'Dados de performance e escalabilidade')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Desafio Full-Stack API Documentation',
    customfavIcon: '/favicon.ico',
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  })

  await app.startAllMicroservices()

  const port = process.env.PORT_ADMIN || 4041
  await app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
    console.log(`📋 Swagger documentation available at: http://localhost:${port}/api/docs`)
  })
}
bootstrap()
