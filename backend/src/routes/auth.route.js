const router = require('express').Router();
const { Login, Register } = require('../controllers/auth.controller');

router.post('/login', Login);
router.post('/register', Register);

module.exports = router;