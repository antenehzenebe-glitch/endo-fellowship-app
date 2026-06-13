import LoginForm from './LoginForm'

// Maps internal error codes to specific, actionable messages (DESIGN.md:
// never a generic "something went wrong").
const ERROR_MESSAGES: Record<string, string> = {
  unprovisioned:
    'You are signed in, but your account has not been set up by the program yet. Ask the PD/APD or coordinator to add you, then sign in again.',
  invalid_link:
    'That sign-in link is invalid or has expired. Request a new one below.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null

  return <LoginForm initialError={errorMessage} />
}
