const TrainWorkspace = require("../postgres/trains").TrainWorkspace;
const trainWorkspace = new TrainWorkspace();

class TrainController {
  constructor() {}

  alltrains = async (req, res, next) => {
    const result = await trainWorkspace.getAllTrains();
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("trains fetched");
      return res.status(200).json(result.data);
    }
  };
}

exports.TrainController = TrainController;
