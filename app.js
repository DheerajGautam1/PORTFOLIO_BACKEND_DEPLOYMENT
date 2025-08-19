import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import dbConnection from './database/dbConnection.js';
import { errorHandler } from './middleware/error.js';
import messageRoute from './router/messageRoute.js';
import userRoute from './router/userRouter.js';
import timelineRoute from './router/timelineRouter.js';
import applicationRouter from './router/softwareApplicaationRoute.js';
import skillsRouter from './router/skillsRoute.js';
import projectRouter from './router/projectRoute.js';


const app = express();
dotenv.config({ path: './config/config.env' });

app.use(cors({
    origin:[process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
})
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
})
);

app.use('/api/v1/message', messageRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/timeline', timelineRoute);
app.use('/api/v1/softwareApplication', applicationRouter);
app.use('/api/v1/skills', skillsRouter);
app.use('/api/v1/project', projectRouter);

dbConnection();
app.use(errorHandler)
export default app;