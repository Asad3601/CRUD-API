const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.post('/create-user', UserController.upload.single('image'), UserController.CreateUser);
router.get('/get-users', UserController.GetUsers);


module.exports = router;