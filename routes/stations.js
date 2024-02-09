const router = require("express-promise-router")();

const StationController = require("../apiController/stations").StationController;
let stationController = new StationController();

// add new endpoints here
router.get("/allstations", stationController.allstations);

module.exports = router;
