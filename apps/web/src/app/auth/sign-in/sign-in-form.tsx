'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useActionState } from 'react'

import githubIcon from '@/assets/github-icon.svg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { signInWithEmailAndPassword } from './actions'

export function SignInForm() {
  const [{ success, message, errors }, formAction, isPending] = useActionState(
    signInWithEmailAndPassword,
    { success: false, message: null, errors: null },
  )

  return (
    <form action={formAction} className="space-y-4">
      {success === false && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Sign In failed!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input name="email" type="text" id="email" />
        {errors?.email && (
          <p className="text-sm text-red-500">{errors.email[0]}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input name="password" type="password" id="password" />
        {errors?.password && (
          <p className="text-sm text-red-500">{errors.password[0]}</p>
        )}
        <Link
          href="auth/forgot-password"
          className="text-foreground text-sm font-medium hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 size={2} className="animate-spin" />
        ) : (
          'Sign In with E-mail'
        )}
      </Button>
      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-up">Create a new account</Link>
      </Button>
      <Separator />
      <Button variant="outline" className="w-full">
        <Image src={githubIcon} alt="" className="mr-2 size-4 dark:invert" />
        Sign In with Github
      </Button>
    </form>
  )
}
