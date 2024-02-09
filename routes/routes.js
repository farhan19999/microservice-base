const router = require("express-promise-router")();

const RouteController = require("../apiController/routes").RouteController;
let routeController = new RouteController();

// add new endpoints here
router.get("/", routeController.getOptimalRoute);

module.exports = router;
