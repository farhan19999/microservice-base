const router = require("express-promise-router")();

const TrainController = require("../apiController/trains").TrainController;
let trainController = new TrainController();

// add new endpoints here
router.get("/alltrains", trainController.alltrains);

module.exports = router;
