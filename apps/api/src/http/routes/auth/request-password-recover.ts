import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Request password recovery',
        body: z.object({
          email: z.string().email(),
        }),

        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFromEmail) {
        // We don't want to expose if the user exists or not
        return reply.status(200).send()
      }

      const { id: code } = await prisma.token.create({
        data: {
          type: 'EMAIL_VERIFICATION',
          userId: userFromEmail.id,
        },
      })

      console.log('code', code)
      return reply.status(200).send()
    },
  )
}
