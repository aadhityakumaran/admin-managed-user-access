import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render("login.ejs", { client: "User", path: "/user/auth" });
});

export default router;