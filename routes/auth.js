import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from "../models/admin.js";
import User from "../models/user.js";

function joinUrl(basePath, url) {
    if (basePath === "/") {
        return url;
    }
    return basePath + url;
}

function clientFromPath(url) {
    if (url.startsWith("/admin")) {
        return "Admin"
    }
    return "User"
}

export default function(client, basePath) {
    const router = express.Router();

    router.get('/login', (req, res) => {
        res.render("login.ejs", { client, path: joinUrl(basePath, "/login") });
    });

    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        let user;
        try {
            if (client === "Admin") {
                user = await Admin.findOne({ user: username });
            } else {
                user = await User.findOne({ _id: username });
            }
        } catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
        if (!user) {
            return res.status(404).json({ message: `${client} not found` });
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

        let token;
        if (client === "Admin") {
            token = jwt.sign({ username, client }, process.env.SECRET_KEY);
        } else {
            token = jwt.sign({ userID: username, client }, process.env.SECRET_KEY);
        }
        
        const redirect = req.cookies.redirectTo;
        res.cookie("token", token, { httpOnly: true });
        res.clearCookie("redirectTo");

        if (redirect && clientFromPath(redirect) === client) {
            res.redirect(redirect);
        } else {
            res.redirect(basePath)
        }
    });


    router.get('/logout', (req, res) => {
        res.clearCookie("token");
        res.redirect(joinUrl(basePath, "/login"));
    });

    router.use((req, res, next) => {
        const token = req.token;
        if (!token || token.client !== client) {
            res.clearCookie("token");
            res.cookie("redirectTo", req.originalUrl, { httpOnly: true });
            return res.redirect(joinUrl(basePath, "/login"));
        }
        next();
    });

    return router;
}