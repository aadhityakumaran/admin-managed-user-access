import express from 'express';
import env from "dotenv";
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/index.js';
import connectDB from './db.js';
import tokenDecode from './middlewares/tokenDecode.js';


const app = express();
const port = process.env.PORT || 3000;
env.config();
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(tokenDecode);

app.use(express.static('public'));
app.use('/admin', adminRoutes);
app.use(userRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Page not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something Broke!" });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});
