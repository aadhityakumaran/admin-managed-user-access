import express from 'express';
import auth from './auth.js';
import User from '../../models/user.js';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_PATH = path.resolve(__dirname, '../../public');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
    console.log(req.token);
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

router.post('/', (req, res) => {
    console.log(req.body);
    res.send('ok');
});

export default router;