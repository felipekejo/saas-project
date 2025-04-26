import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBER', id: '1' })

const userCanInviteSomeoneElse = ability.can('get', 'User')
const userCanDeleteOtherUser = ability.cannot('delete', 'User')

console.log('userCanInviteSomeoneElse', userCanInviteSomeoneElse)
console.log('userCanDeleteOtherUser', userCanDeleteOtherUser)
