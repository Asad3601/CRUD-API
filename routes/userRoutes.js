const router = require('express').Router();
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/AuthMiddleware');


router.get('/', UserController.GetUsers);
router.get('/login', UserController.LoginUser);
router.get('/profile', AuthMiddleware, UserController.UserProfile);
router.get('/logout', AuthMiddleware, UserController.LogoutUser);
router.get('/get-user/:id', UserController.GetUserByID);
router.get('/create-user', UserController.CreateUser);
router.get('/delete-user/:id', UserController.DeleteUser);
router.get('/update-user/:id', UserController.UpdateUser);


module.exports = router;