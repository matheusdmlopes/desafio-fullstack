import { ApiResponse } from '../graphql/types'

export type TokenData = {
  sub: string // User ID
  data: any // Additional user data from JWT
  iat?: number // Issued at
  exp?: number // Expires at
}

export interface ExecutionDTOType<A, B, C = any> {
  tokenData: TokenData
  datap: A
  method: B
  error?: { error: ApiResponse }
  customData: C
}

export interface MethodType<T, Y> {
  rules: { [key: string]: (data: T) => Promise<T> }
  execution: (data: T) => Promise<Y>
}

export async function genericCaller<T>(context: any, data: any, method: string): Promise<T> {
  try {
    const tokenData = context?.req?.user || context?.req?.tokenData || context?.user

    return await this.service.execute({
      datap: data,
      method,
      tokenData: tokenData,
      customData: {},
      error: undefined,
    })
  } catch (error) {
    console.log('Error in genericCaller:', error)
    return { error: { internalServerError: 'Erro de servidor, tente novamente em alguns minutos' } } as any
  }
}
