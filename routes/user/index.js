import express from 'express';
import auth from './auth.js';
import User from '../../models/user.js';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_PATH = path.resolve(__dirname, '../../public');

const router = express.Router();
router.use(auth);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(PUBLIC_PATH, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, req.token.userID + 'new.png');
    }
});

router.get('/', async (req, res) => {
    const user = await User.findOne({ _id: req.token.userID });
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    let image = "/images/unknown.png";
    if (user.update) {
        image = "/uploads/" + user._id + "new.png";
    } else {
        const imageURL = "/uploads/" + user._id + ".png";
        if (fs.existsSync(path.join(PUBLIC_PATH, imageURL))) {
            image = imageURL;
        }
    }

    res.render("userdashboard.ejs",
        {
            name: user.name,
            image: image,
            approved: !user.update
        });
});

router.post('/', multer({ storage }).single('image'), async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.token.userID });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.body.name) {
            user.name = req.body.name;
        }
        if (req.file) {
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