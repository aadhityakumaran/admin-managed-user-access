import express from 'express';
import auth from './auth.js';
import users from './users.js';

const router = express.Router();
router.use(auth);
router.use('/users', users);

router.get('/', (req, res) => {
    res.render("admin_control.ejs");
});

// router.get('/users', (req, res) => {
//     res.render("users_report.ejs", {users: [1, 2]});
// });

export default router;