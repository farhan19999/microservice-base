const router = require("express-promise-router")();

const UsersController = require("../apiController/users").UserController;
let userController = new UsersController();

// add new endpoints here
// router.post("/register", userController.register);
router.post("/", userController.addUser);
router.get("/:wallet_id", userController.getWallet);
router.put("/:wallet_id", userController.addWalletBalance);

module.exports = router;
