import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'


let prisma: PrismaClient | null = null

async function getClient(dbUrl: string) {
  if (!prisma) {
    // Prisma 6 adapter requires two params: connection string + options
    const adapter = new PrismaNeonHTTP(dbUrl, {  })
    prisma = new PrismaClient({ adapter })
    console.log('✅ Connected to Neon via HTTP')
  }
  return prisma
}

type Env = { Bindings: { DATABASE_URL: string } }

const app = new Hono<Env>()
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }))

// 📗 Get all blogs
app.get('/api/blogs', async (c) => {
  const prisma = await getClient(c.env.DATABASE_URL)
  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })
  return c.json(blogs)
})

// 📘 Create blog
app.post('/api/blogs', async (c) => {
  const prisma = await getClient(c.env.DATABASE_URL)
  const data = await c.req.json()
  const blog = await prisma.blog.create({
    data: {
      title: data.title,
      body: data.body,
      tags: data.tags ?? [],
    },
  })
  return c.json(blog, 201)
})

// 📕 Delete blog
app.delete('/api/blogs/:id', async (c) => {
  const prisma = await getClient(c.env.DATABASE_URL)
  const id = c.req.param('id')
  await prisma.blog.delete({ where: { id } })
  return c.json({ success: true })
})
app.post('/api/auth/signup', async (c) => {
  const prisma = await getClient(c.env.DATABASE_URL)
  const { name, email, password } = await c.req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return c.json({ error: 'User already exists' }, 400)

  
  const user = await prisma.user.create({ data: { name, email, password } })

  return c.json({ message: 'Signup successful', user })
})

// 🔐 Login
app.post('/api/auth/login', async (c) => {
  const prisma = await getClient(c.env.DATABASE_URL)
  const { email, password } = await c.req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return c.json({ error: 'Invalid email or password' }, 400)

  const valid = password === user.password
  if (!valid) return c.json({ error: 'Invalid credentials' }, 400)

  return c.json({ message: 'Login successful', user })
})

// 👤 Get Profile
app.get('/api/auth/profile/:id', async (c) => {
  const prisma = await getClient(c.env.DATABASE_URL)
  const id = c.req.param('id')
  const user = await prisma.user.findUnique({ where: { id } })
  return c.json(user)
})
// Default route
app.all('*', (c) => c.text('✅ Hono + Prisma + Neon (HTTP) running', 200))

export default app
