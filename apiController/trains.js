const { response } = require("express");

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
  // now add a addTrain method that will take a request body as follow:
  // {
  //     "train_id": integer, # train's numeric id
  //     "train_name": string, # train's name
  //     "capacity": integer, # seating capacity
  //     "stops": [ # list of stops
  //     {
  //     "station_id": integer, # station's id
  //     "arrival_time": string, # arrives at
  //     "departure_time" string, # leaves at
  //     "fare": integer # ticket cost
  //     },
  //     ...
  //     ]
  //    }
  // after response. it will return status 201 and the train object in the response body
  addTrain = async (req, res, next) => {
    const train = req.body;
    const result = await trainWorkspace.addTrain(train);
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("train added successfully");
      return res.status(201).json(result.data);
    }
  };
}

exports.TrainController = TrainController;
