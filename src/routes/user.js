const express = require('express');
const router = express.Router()
const { register, login} = require('../controllers/user');
const authenticatedUser = require('../middleware/authentication')

router.post('/register', register);
router.post('/login', login)
router.get('/test', (req, res) => res.send('User router is working!'));
router.get('/test-auth', authenticatedUser, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
