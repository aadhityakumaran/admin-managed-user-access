import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from "../../models/admin.js";

const router = express.Router();
router.basePath = "/admin";

const redirectToLogin = (req, res) => {
    res.cookie("redirectTo", req.originalUrl, { httpOnly: true });
    res.redirect(router.basePath + "/login");
}

router.get('/login', (req, res) => {
    res.render("login.ejs", { client: "Admin", path: router.basePath + "/login" });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let admin;
    try {
        admin = await Admin.findOne({ user: username });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    
    let isPasswordValid;
    try {
        isPasswordValid = await bcrypt.compare(password, admin.password);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: admin.user, client: "Admin" }, process.env.SECRET_KEY);
    const redirect = req.cookies.redirectTo;
    res.cookie("token", token, { httpOnly: true });
    if (redirect) {
        res.clearCookie("redirectTo");
        res.redirect(redirect);
    } else {
        res.redirect(router.basePath);
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect(router.basePath + "/login");
});

router.use((req, res, next) => {
    const token = req.token;
    if (!token) {
        return redirectToLogin(req, res);
    }
    try {
        if (token.client !== "Admin") {
            return redirectToLogin(req, res);
        }
        next();
    } catch (err) {
        return redirectToLogin(req, res);
    }
});

export default router;
