import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import serviceRoutes from "./routes/services.js"
import appointmentRoutes from "./routes/appointments.js"
import scheduleRoutes from "./routes/schedule.js"
import reportRoutes from "./routes/reports.js"
import userRoutes from "./routes/user.js"
import { PrismaClient } from "@prisma/client"

dotenv.config()
const prisma = new PrismaClient()
const app = express()
app.use(
  cors({
    origin: "https://standart-client.vercel.app",
    credentials: true,
  })
)
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/services", serviceRoutes)
app.use("/appointments", appointmentRoutes)
app.use("/schedule", scheduleRoutes)
app.use("/reports", reportRoutes)
app.use("/users", userRoutes)

// TEST SERVER
app.get("/", (req, res) => {
  res.json({ status: "ok" })
})

// TEST DB
app.get("/health/db", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json({ ok: true, usersCount: users.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
