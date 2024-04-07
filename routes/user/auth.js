import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

const router = express.Router();

const redirectToLogin = (req, res) => {
    res.cookie("redirectTo", req.originalUrl, { httpOnly: true });
    res.redirect('/login');
}

router.get('/login', (req, res) => {
    res.render("login.ejs", { client: "User", path: "/login" });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let user;
    try {
        user = await User.findOne({ _id : username });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    let isPasswordValid;
    try {
        isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userID: user._id, client: "user" }, process.env.SECRET_KEY);
    const redirect = req.cookies.redirectTo;
    res.cookie("token", token, { httpOnly: true });
    if (redirect) {
        res.clearCookie("redirectTo");
        res.redirect(redirect);
    } else {
        res.redirect("/");
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

router.use((req, res, next) => {
    const token = req.token;
    if (!token) {
        return redirectToLogin(req, res);
    }
    try {
        if (token.client !== "user") {
            return redirectToLogin(req, res);
        }
        next();
    } catch (err) {
        return redirectToLogin(req, res);
    }
});

export default router;