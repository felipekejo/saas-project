import { organizationSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorisedError } from '../_errors/unauthorised-error'

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organizations/:slug/owner',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Transfer organization ownership',
          security: [{ bearerAuth: [] }],
          body: z.object({
            newOwnerId: z.string().uuid(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMemberShip(slug)

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('transfer_ownership', authOrganization)) {
          throw new UnauthorisedError(
            'You are not authorized to transfer ownership of this organization',
          )
        }

        const { newOwnerId } = request.body

        const transferToMembership = await prisma.member.findUnique({
          where: {
            userId_organizationId: {
              organizationId: organization.id,
              userId: newOwnerId,
            },
          },
        })

        if (!transferToMembership) {
          throw new BadRequestError(
            'The user you are trying to transfer ownership to is not a member of this organization',
          )
        }

        await prisma.$transaction([
          prisma.member.update({
            where: {
              userId_organizationId: {
                organizationId: organization.id,
                userId: newOwnerId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),

          prisma.organization.update({
            where: { id: organization.id },
            data: { ownerId: newOwnerId },
          }),
        ])

        return reply.status(204).send()
      },
    )
}
