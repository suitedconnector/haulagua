import { createUser } from '../lib/user'

async function main() {
  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD
  const name = process.env.SEED_NAME ?? 'Admin'

  if (!email || !password) {
    console.error('Set SEED_EMAIL and SEED_PASSWORD env vars')
    process.exit(1)
  }

  try {
    const user = await createUser({ email, password, name })
    console.log('Created user:', user)
  } catch (err: any) {
    if (err.message?.includes('unique')) {
      console.log('User already exists with that email')
    } else {
      throw err
    }
  }
}

main()
