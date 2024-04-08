import express from 'express';
import auth from './auth.js';
import User from '../models/user.js';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_PATH = path.resolve(__dirname, '../public');

const router = express.Router();
router.use(auth("User", "/"));

router.get('/', async (req, res) => {
    const user = await User.findOne({ _id: req.token.userID });
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    let image = "/images/unknown.webp";
    if (user.update) {
        image = path.join('uploads', `${user._id}new.webp`);
    } else {
        const imageURL = path.join('uploads', `${user._id}.webp`);
        if (fs.existsSync(path.join(PUBLIC_PATH, imageURL))) {
            image = imageURL;
        }
    }

    res.render("userdashboard.ejs",
        {
            name: user.name,
            image,
            approved: !user.update
        });
});

router.post('/', multer({ storage: multer.memoryStorage() }).single('image'), async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.token.userID });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.body.name) {
            user.name = req.body.name;
        }
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(415).json({ message: "Invalid file type" });
            }
            const fileName = path.join(PUBLIC_PATH, 'uploads', `${user._id}new.webp`);
            let buffer = req.file.buffer;

            if (!req.file.mimetype.startsWith('image/webp')) {
                buffer = await sharp(req.file.buffer).webp().toBuffer();
            }
            fs.writeFileSync(fileName, buffer);
            user.update = true;
        }
        await user.save();
        res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while updating user" });
    }
});

export default router;