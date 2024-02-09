const router = require("express-promise-router")();

const StationController = require("../apiController/stations").StationController;
let stationController = new StationController();

// add new endpoints here
router.get("/", stationController.allStations);
router.post("/", stationController.addStation);
router.get("/:station_id/trains", stationController.getTrainsofStation);

module.exports = router;
