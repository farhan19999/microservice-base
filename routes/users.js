const router = require("express-promise-router")();

const UsersController = require("../apiController/users").UserController;
let userController = new UsersController();

// add new endpoints here
// router.post("/register", userController.register);

module.exports = router;
