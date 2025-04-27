import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/user',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(1),
        }),
      },
    },
    () => {
      return 'user created'
    },
  )
}
