import { Controller, Post } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

@Controller('auth')
export class AuthController {
    @Post('auto-login')
    autoLogin() {
        const payload = {
            sub: 1,
            email: 'demo@test.com',
            data: {
                permissions: [
                    'api-ler-post',
                    'api-criar-post',
                    'api-atualizar-post',
                    'api-deletar-post',
                    'api-ler-category',
                    'api-criar-category',
                    'api-atualizar-category',
                    'api-deletar-category',
                    'api-ler-user',
                    'api-criar-user',
                    'api-atualizar-user',
                    'api-deletar-user'
                ]
            },
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        }

        const token = jwt.sign(payload, 'demo-secret-key')

        return {
            token,
            user: {
                id: payload.sub,
                email: payload.email,
                name: 'Demo User'
            }
        }
    }
} 