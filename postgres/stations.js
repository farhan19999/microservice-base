const Workspace = require("./baseConnection").Workspace;

class StationWorkspace extends Workspace {
  constructor() {
    super();
  }

  getAllStations = async function () {
    const query = `SELECT * FROM station`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };

  addStation = async function (station_id, station_name, longitude, latitude) {
    const query = `INSERT INTO station(station_id,station_name,longitude,latitude) VALUES($1,$2,$3,$4)`;
    const params = [station_id, station_name, longitude, latitude];
    const result = await this.query(query, params);
    return result;
  };

  getTrainsofStation = async function (station_id) {
    //sort by departure time then by arrival time then by train_id
    //if time is null then it will be listed ahead of the trains with arrival time
    const query = `SELECT train_id, arrival_time, departure_time FROM stops WHERE station_id = $1 ORDER BY departure_time NULLS FIRST, arrival_time NULLS FIRST, train_id`;
    const params = [station_id];
    const result = await this.query(query, params);
    return result;
  };

  getStationByID = async function (station_id) {
    const query = `SELECT * FROM station WHERE station_id = $1`;
    const params = [station_id];
    const result = await this.query(query, params);
    return result;
  }
}
exports.StationWorkspace = StationWorkspace;
