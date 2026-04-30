import { sql } from './db'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string | null
  hauler_slug: string | null
  role: string
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const rows = await sql`
    SELECT id, email, name, hauler_slug, role, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `
  return (rows[0] as any) ?? null
}

export async function createUser({
  email,
  password,
  name,
  haulerSlug,
}: {
  email: string
  password: string
  name?: string
  haulerSlug?: string
}): Promise<User> {
  const password_hash = await bcrypt.hash(password, 12)
  const rows = await sql`
    INSERT INTO users (email, password_hash, name, hauler_slug)
    VALUES (${email}, ${password_hash}, ${name ?? null}, ${haulerSlug ?? null})
    RETURNING id, email, name, hauler_slug, role
  `
  return rows[0] as User
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
