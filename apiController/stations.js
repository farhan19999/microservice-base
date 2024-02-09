const StationWorkspace = require("../postgres/stations").StationWorkspace;
const stationWorkspace = new StationWorkspace();

class StationController {
  constructor() {}

  allStations = async (req, res, next) => {
    const result = await stationWorkspace.getAllStations();
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("stations fetched");
      const return_obj = {
        stations : result.data
      };
      return res.status(200).json(return_obj);
    }
  };

  addStation = async (req, res, next) => {
    const station_id = req.body.station_id;
    const station_name = req.body.station_name;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const result = await stationWorkspace.addStation(
      station_id,
      station_name,
      longitude,
      latitude
    );
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("station added");
      const return_obj = {
        station_id: station_id,
        station_name: station_name,
        longitude: longitude,
        latitude: latitude,
      };
      return res.status(201).json(return_obj);
    }
  }

  getTrainsofStation = async (req, res, next) => {
    const station_id = req.params.station_id;

    //first check if station_id exists in the station table
    const station = await stationWorkspace.getStationByID(station_id);
    if (!station.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    if (station.data.length == 0)
      return res.status(404).json({ message : "station with id: " + station_id + " was not found" });


    const result = await stationWorkspace.getTrainsofStation(station_id);
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("trains fetched");
      //for each result.data row the arrival_time and departure_time needs to be converted to hh:mm format from hh:mm:ss
      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i].arrival_time != null) {
          result.data[i].arrival_time = result.data[i].arrival_time.slice(0, 5);
        }
        if (result.data[i].departure_time != null) {
          result.data[i].departure_time = result.data[i].departure_time.slice(0, 5);
        }
      }
      const return_obj = {
        station_id : station_id,
        trains : result.data
      };
      return res.status(200).json(return_obj);
    }
  }

}

exports.StationController = StationController;
