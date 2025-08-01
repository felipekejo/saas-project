'use server'

import { signInWithPassword } from '@/http/sign-in-with-password'

export async function signInWithEmailAndPassword(
  previousState: unknown,
  data: FormData,
) {
  const { email, password } = Object.fromEntries(data)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const result = await signInWithPassword({
    email: String(email),
    password: String(password),
  })

  console.log(result)

  return 'success'
}
