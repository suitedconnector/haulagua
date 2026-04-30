import { neon } from '@neondatabase/serverless'

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_, prop) {
    return (...args: any[]) => getDb()[prop as any](...args)
  },
})
