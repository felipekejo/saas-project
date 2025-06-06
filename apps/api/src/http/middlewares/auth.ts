import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { prisma } from '@/lib/prisma'

import { UnauthorisedError } from '../routes/_errors/unauthorised-error'

export const auth = fastifyPlugin((app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch (error) {
        throw new UnauthorisedError('Invalid Auth Token')
      }
    }

    request.getUserMemberShip = async (slug: string) => {
      const userId = await request.getCurrentUserId()
      const member = await prisma.member.findFirst({
        where: {
          userId,
          organization: {
            slug,
          },
        },
        include: {
          organization: true,
        },
      })
      if (!member) {
        throw new UnauthorisedError('You are not a member of this organization')
      }

      const { organization, ...membership } = member

      return {
        organization,
        membership,
      }
    }
  })
})
