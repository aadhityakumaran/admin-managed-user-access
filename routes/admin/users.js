import express from "express";
import User from "../../models/user.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_PATH = path.resolve(__dirname, '../../public')

const router = express.Router();

router.get('/', async (req, res) => {
    const { u1, u2 } = req.query;
    try {
        const users = await User.find({ _id: { $in: [u1, u2] } });
        const updatedUsers = users.map(user => {
            const files = [
                `/uploads/${user._id}new.png`,
                `/uploads/${user._id}.png`,
                `/images/unknown.png`
            ];
            const img = files.find((file) => {
                return fs.existsSync(path.join(PUBLIC_PATH, file));
            });
            return { ...user._doc, img: img}
        })
        res.render("reports.ejs", { users: updatedUsers });
    } catch (err) {
        console.error(err);
        return res.status(404).json({ message: "An error occurred while fetching users", error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({
        _id: username,
        password: password
    });
    try {
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        } else {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const done = await User.updateOne({ _id: id }, { update: false });
        fs.rename(path.join(PUBLIC_PATH, `/uploads/${id}new.png`), path.join(PUBLIC_PATH, `/uploads/${id}.png`), (err) => {
            if (err) {
                console.error(err);
            }
        })
        if (done.acknowledged) {
            res.status(200).json({ message: 'User deleted' });
        } else {
            res.status(500).json({ message: 'Could not update user' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = path.join(PUBLIC_PATH, '/uploads', `${id}.png`);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
        const done = await User.deleteOne({ _id: id });
        if (done.acknowledged) {
            res.status(200).json({ message: 'User deleted' });
        } else {
            res.status(500).json({ message: 'Could not delete user' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

export default router;
