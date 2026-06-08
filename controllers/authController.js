import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "mysecret"

export const register = async (req, res) => {
  const { full_name, email, phone, password, role } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).json({ message: "Email already in use" })

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { full_name, email, phone, password: hashedPassword, role },
  })

  res.json({ message: "User registered successfully", user })
}

export const login = async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).json({ message: "Invalid credentials" })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ message: "Invalid credentials" })

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" })

  res.json({
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  })
}
