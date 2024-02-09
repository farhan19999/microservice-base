const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// routes
const usersroute = require("./routes/users");
const stationsroute = require("./routes/stations");
const trainsroute = require("./routes/trains");

//running app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
dotenv.config();

//middlewares
app.use("/api/users",usersroute);
app.use("/api/stations",stationsroute);
app.use("/api/trains",trainsroute);

const server = app.listen(process.env.PORT, () => {
  console.log(`backend server is running at port ${process.env.PORT}`);
});

module.exports = server;
