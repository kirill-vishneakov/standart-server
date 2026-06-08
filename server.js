import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointments.js';
import scheduleRoutes from './routes/schedule.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
  }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/reports', reportRoutes);
app.use('/users', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
