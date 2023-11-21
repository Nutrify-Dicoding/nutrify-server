const express = require('express');
const { signup, signin } = require('../controllers/auth.controller');

const authRoute = express.Router();

authRoute.post('/signup', signup);
authRoute.get('/signin', signin);

module.exports = authRoute;