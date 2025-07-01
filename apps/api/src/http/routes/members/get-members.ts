import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorisedError } from '../_errors/unauthorised-error'

export async function getMemberss(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string().uuid(),
                  role: roleSchema,
                  userId: z.string().uuid(),
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User')) {
          throw new UnauthorisedError(
            'You are not authorized to see members in this organization',
          )
        }

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            role: 'asc',
          },
        })

        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
            }
          },
        )

        return reply.status(200).send({ members: membersWithRoles })
      },
    )
}
