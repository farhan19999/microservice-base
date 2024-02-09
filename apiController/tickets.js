const TicketWorkSpace = require("../postgres/tickets").TicketWorkspace;
const ticketWorkspace = new TicketWorkSpace();

class TicketController {
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
        stations: result.data,
      };
      return res.status(200).json(return_obj);
    }
  };

  findPath = (stops, station_from, station_to) => {
    //base case
    if (station_from === station_to) {
      return [station_to];
    }
    //recursive case
    const next_stops = stops.filter((stop) => stop.station_id === station_from);
    for (const stop of next_stops) {
      const path = this.findPath(stops, stop.station_id, station_to);
      if (path.length > 0) {
        return [station_from, ...path];
      }
    }
    return [];
  };

  purchaseTicket = async (req, res, next) => {
    const wallet_id = req.body.wallet_id;
    const time_after = req.body.time_after;
    const station_from = req.body.station_from;
    const station_to = req.body.station_to;

    //get all stops after the time_after
    const stops = await ticketWorkspace.getStops(time_after);
    //stops has rows with the following structure:
    //  {stop_id, station_id, train_id, departure_time: hh:mm:ss, arrival_time: hh:mm:ss, fare},
    //stop id is the sequence number of the stop in the train's route, the train will go through the stations in the order of the stop_id

    //now i have to find a path from station_from to station_to, use the stop sequence , arrival_time and departure_time to find the path
    //i will use a recursive function to find the path, the base case is when the station_from is the same as station_to
    //the recursive function will return the path from station_from to station_to, if there is no path, it will return an empty array
    const path = this.findPath(stops, station_from, station_to);
    if (path.length === 0) {
      return res
        .status(400)
        .json({ code: "E0002", description: "No path found" });
    }
    //now i have to calculate the fare
    const fare = this.calculateFare(path, stops);
  };
}

exports.TicketController = TicketController;
