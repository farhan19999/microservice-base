const Workspace = require("./baseConnection").Workspace;
//create a 2d matrix of dim 1000 x 1000
let matrix = new Array(1000);
for (let i = 0; i < 1000; i++) {
  matrix[i] = new Array(1000);
}

const initialize = () => {
  // initialize the matrix with -1
  for (let i = 0; i < 1000; i++) {
    for (let j = 0; j < 1000; j++) {
      matrix[i][j] = -1;
    }
  }
};
class RouteWorkspace extends Workspace {
  constructor() {
    super();
  }
  addEdge = async (from, to) => {
    if (from === to) return;
    const query = `SELECT * FROM stops WHERE station_id = $1 AND departure_time IS NOT NULL`;
    const params = [from];
    const result = await this.query(query, params);
    const all_trains_from_start = result.data;
    let all_stations = [];
    all_trains_from_start.forEach(async (train) => {
      const query = `SELECT * FROM stops WHERE train_id = $1 AND arrival_time IS NOT NULL`;
      const params = [train.train_id, train.departure_time];
      const result = await this.query(query, params);
      const stops = result.data;
      stops.forEach((stop) => {
        if (!all_stations.includes(stop)) {
          all_stations.push(stop);
        }
      });
    });
    // now set matrix value for row all_trains_from_start and column all_stations to the differnnce of fare from all stations - start
    all_stations.forEach((station) => {
      matrix[all_trains_from_start.station_id][station.station_id] =
        station.fare - all_trains_from_start.fare;
    });
    //call recursively for all the stations
    all_stations.forEach((station) => {
      addEdge(station, to);
    });
  };
  optimalRoute = async function (from, to, optimize_by) {
    if (optimize_by === "cost") {
      initialize();
      addEdge(from, to);
      // now run dijkstra's algorithm to find the optimal route
      let dist = new Array(100);
      let visited = new Array(100);
      for (let i = 0; i < 100; i++) {
        dist[i] = 1000000000;
        visited[i] = false;
      }
      dist[from] = 0;
      for (let i = 0; i < 100; i++) {
        let u = -1;
        for (let j = 0; j < 100; j++) {
          if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
            u = j;
          }
        }
        if (dist[u] === 1000000000) {
          break;
        }
        visited[u] = true;
        for (let j = 0; j < 100; j++) {
          if (matrix[u][j] !== -1) {
            dist[j] = Math.min(dist[j], dist[u] + matrix[u][j]);
          }
        }
      }
    }
  };
  getOptimalRoute = async function (from, to, optimize_by) {
    const query = `SELECT * FROM route`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };
}
exports.RouteWorkspace = RouteWorkspace;
