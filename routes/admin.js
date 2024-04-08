import express from 'express';
import auth from './auth.js';
import users from './users.js';

const router = express.Router();
router.use(auth("Admin", "/admin"));
router.use('/users', users);

router.get('/', (req, res) => {
    res.render("admin_control.ejs");
});

export default router;