import express from 'express';
import auth from './auth.js';

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
    res.render("userdashboard.ejs");
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.send('ok');
});

export default router;