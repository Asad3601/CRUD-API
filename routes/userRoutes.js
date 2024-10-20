const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.GetUsers);
router.post('/create-user', UserController.upload.single('image'), UserController.CreateUser);


module.exports = router;