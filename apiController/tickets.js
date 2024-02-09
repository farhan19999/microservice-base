const TicketWorkSpace = require("../postgres/tickets").TicketWorkspace;
const ticketWorkspace = new TicketWorkSpace();

getNextStop = async (train_id, stop_id, stops) => {
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].train_id == train_id && stops[i].stop_id == stop_id + 1) {
      return stops[i];
    }
  }
  return null;
}

class TicketController {
  constructor() {}

  


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

    
    let route = [];
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].station_id == station_from) {
        //clear the route and start a new route
        route = [];
        route.push(stops[i]);
        while (route[route.length - 1].station_id != station_to) {
          let next_stop = await getNextStop(route[route.length - 1].train_id, route[route.length - 1].stop_id, stops);
          if (next_stop == null) {
            break;
          }
          route.push(next_stop);
        }
        if(route[route.length - 1].station_id == station_to){
          break;
        }
      }
    }

    let total_fare = 0;
    for (let i = 0; i < route.length; i++) {
      total_fare += route[i].fare;
    }

    const balance = await ticketWorkspace.getBalance(wallet_id);

    if (balance < total_fare) {
      return res.status(402).json({ message: "recharge amount: " + (total_fare - balance) + " to purchase the ticket"});
    }
    if (route.length == 0 || route[route.length - 1].station_id != station_to) {
      return res.status(403).json({ message: "no ticket available for station: " + station_from + " to station: " + station_to});
    }

    let stations = [];
    for (let i = 0; i < route.length; i++) {
      //conver from hh:mm:ss to hh:mm
      if (route[i].departure_time !== null) {
        route[i].departure_time = route[i].departure_time.substring(0, 5);
      }
      if (route[i].arrival_time !== null)
        route[i].arrival_time = route[i].arrival_time.substring(0, 5);
      let station_obj = {
        station_id: route[i].station_id,
        train_id: route[i].train_id,
        departure_time: route[i].departure_time,
        arrival_time: route[i].arrival_time
      }
      stations.push(station_obj);
      if (i == 0) {
        stations[i].arrival_time = null;
      }
      if (i == route.length - 1) {
        stations[i].departure_time = null;
      }
    }

    //update the balance in the wallet
    await ticketWorkspace.updateBalance(wallet_id, balance - total_fare);
    let return_obj = {
      ticket_id: 101,
      balance: balance - total_fare,
      wallet_id: wallet_id,
      stations: stations
    };
    return res.status(201).json(return_obj);
  }

}
exports.TicketController = TicketController;
