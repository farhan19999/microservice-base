const router = require("express-promise-router")();

const PlannerController = require("../apiController/planner").PlannerController;
let plannerController = new PlannerController();

router.post('/initialPlan' ,plannerController.initialPlan);
router.post('/update', plannerController.update);
//route to save plan
router.post('/save',plannerController.savePlan);

module.exports = router;
