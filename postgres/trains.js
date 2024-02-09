const Workspace = require("./baseConnection").Workspace;

class TrainWorkspace extends Workspace {
  constructor() {
    super();
  }

  getAllTrains = async function () {
    const query = `SELECT * FROM train`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };
  //query to add each single stop, each stop has the following columns : stop_id, train_id, station_id, arrival_time, departure_time, fare
  addStop = async function (stop) {
    const query = `INSERT INTO stops (stop_id,train_id, station_id, arrival_time, departure_time, fare) VALUES ($1, $2, $3, $4, $5, $6)`;
    const params = [stop.stop_id,stop.train_id, stop.station_id, stop.arrival_time, stop.departure_time, stop.fare];
    const result = await this.query(query, params);
    return result;
  };
  //now write the addTrain method that will take a train object for the trains.js api controller
  addTrain = async function (train) {
    //get the stops from the train object
    const stops = train.stops;
    const service_start = stops[0].departure_time;
    const service_ends = stops[stops.length - 1].arrival_time;
    const num_stations = stops.length;

    //now i have another table named stops that i need to insert the stops
    //i will loop through the stops and insert each one
    let stop_count = 1;
    for (const element of stops) {
      const stop = element;
      stop.stop_id = stop_count;
      stop.train_id = train.train_id;
      const stop_result = await this.addStop(stop);
      stop_count++;
    }

    const insert_query = `INSERT INTO train (train_id, train_name, capacity,service_start,service_ends,num_stations) VALUES ($1, $2, $3,$4,$5,$6)`;
    const params_for_insert_query = [train.train_id, train.train_name, train.capacity, service_start, service_ends, num_stations];
    const insert_result = await this.query(insert_query, params_for_insert_query);
    const return_train_obj = {
      success: insert_result.success,
      data:
      {
        train_id: train.train_id,
        train_name: train.train_name,
        capacity: train.capacity,
        service_start: service_start,
        service_ends: service_ends,
        num_stations: num_stations
      },
    }
    return return_train_obj;
  };
}
exports.TrainWorkspace = TrainWorkspace;
