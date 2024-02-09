const { response } = require("express");

const RouteWorkspace = require("../postgres/routes").RouteWorkspace;
const routeWorkspace = new RouteWorkspace();

class RouteController {
  constructor() {}

  getOptimalRoute = async (req, res, next) => {
    const from = req.query.from;
    const to = req.query.to;
    const optimize_by = req.query.optimize;

    console.log(from);
    console.log(to);
    console.log(optimize_by);
    const result = await routeWorkspace.getOptimalRoute(from, to, optimize_by);
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("optimal route fetched");
      return res.status(200).json(result.data);
    }
  };
}

exports.RouteController = RouteController;
