const StationWorkspace = require("../postgres/stations").StationWorkspace;
const stationWorkspace = new StationWorkspace();

class StationController {
  constructor() {}

  allstations = async (req, res, next) => {
    const result = await stationWorkspace.getAllStations();
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("stations fetched");
      return res.status(200).json(result.data);
    }
  };
}

exports.StationController = StationController;
