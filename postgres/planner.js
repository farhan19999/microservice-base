const Workspace = require("./baseConnection").Workspace;
class PlannerWorkspace extends Workspace {
  constructor() {
    super();
  }

findAllLocationInfo = async function () {
    const query = `SELECT * FROM "Location"`;
    const params = [];
    const result = await this.query(query, params);
    return result.data;
};

findAllSpots = async function (locationName) {
    const query = `SELECT * FROM "Tourist_Spot" WHERE "Location_ID" = (SELECT "Location_ID" FROM "Location" WHERE "Location_Name" = $1)`;
    const params = [locationName];
    const result = await this.query(query, params);
    return result;
};

findAllSpotsWithTime = async function (locationName, day) {
    const query = `SELECT * FROM "Tourist_Spot" ts JOIN spot_opening_hours soh ON ts."Tourist_Spot_ID" = soh.tourist_spot_id WHERE ts."Location_ID" = (SELECT "Location_ID" FROM "Location" WHERE "Location_Name" = $1) AND soh.day_id = $2`;
    const params = [locationName, day];
    const result = await this.query(query, params);
    return result;
};

findSpotsOpenOnDay = async function (locationName, day) {
    const query = ` SELECT * 
                    FROM "Tourist_Spot" ts
                    JOIN spot_opening_hours soh ON ts."Tourist_Spot_ID" = soh.tourist_spot_id 
                    WHERE ts."Location_ID" = (SELECT "Location_ID" FROM "Location" WHERE "Location_Name" = $1) AND soh.day_id = $2`;
    const params = [locationName, day];
    const result = await this.query(query, params);
    return result;
};
    

findAllDistAndTime = async function (locationName) {
    const query = `SELECT * FROM "Spot_Distance_Time" WHERE "id1" IN (SELECT "Tourist_Spot_ID" FROM "Tourist_Spot" WHERE "Location_ID" = (SELECT "Location_ID" FROM "Location" WHERE "Location_Name" = $1))`;
    const params = [locationName];
    const result = await this.query(query, params);
    return result;
};

findAllDistAndTimeLocation = async function () {
    const query = `SELECT * FROM "Location_Distance_Time"`;
    const params = [];
    const result = await this.query(query, params);
    return result;
};

findDistandTime = async function (id1, id2) {
    const query = `SELECT * FROM "Spot_Distance_Time" WHERE "id1" = $1 AND "id2" = $2`;
    const params = [id1, id2];
    const result = await this.query(query, params);
    return result;
};

insertDistandTime = async function (id1, id2, distance, time) {
    const query = `INSERT INTO "Spot_Distance_Time" ("id1", "id2", "distance", "time") VALUES ($1, $2, $3, $4)`;
    const params = [id1, id2, distance, time];
    const result = await this.query(query, params);
    return result;
};

findDistandTimeLocation = async function (id1, id2) {
    const query = `SELECT * FROM "Location_Distance_Time" WHERE "id1" = $1 AND "id2" = $2`;
    const params = [id1, id2];
    const result = await this.query(query, params);
    return result;
}
  
insertDistandTimeLocation = async function (id1, id2, distance, time) {
    const query = `INSERT INTO "Location_Distance_Time" ("id1", "id2", "distance", "time") VALUES ($1, $2, $3, $4)`;
    const params = [id1, id2, distance, time];
    const result = await this.query(query, params);
    return result;
}

findLocationID = async function (locationName) {
    const query = `SELECT "Location_ID", "Longitude", "Latitude" FROM "Location" WHERE "Location_Name" = $1`;
    const params = [locationName];
    const result = await this.query(query, params);
    return result;
}

getPlanId = async function (email, planName) {
    const query = `insert into plan (email, planname) values($1, $2) returning plan_id`;
    const params = [email, planName];
    const result = await this.query(query, params);
    return result.data[0].plan_id;
}

storePlanDestination = async function (plan_id, destination_order, name, days) {
    const query = `insert into plan_destination (plan_id, destination_order, name, days) values($1, $2, $3, $4)`;
    const params = [plan_id, destination_order, name, days];
    const result = await this.query(query, params);
    return result;
}

storeDayByDay = async function (plan_id, day_order, date) {
    const query = `insert into day_by_day (plan_id, day_order, date) values($1, $2, $3)`;
    const params = [plan_id, day_order, date];
    const result = await this.query(query, params);
    return result;
}

storeCluster = async function (plan_id, day_order, cluster_order, name, id, start_time, end_time, lat, lng, rating, description, image_url) {
    const query = `insert into cluster (plan_id, day_order, cluster_order, name, id, starttime, endtime, lat, lng, rating, description, image_url) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
    const params = [plan_id, day_order, cluster_order, name, id, start_time, end_time, lat, lng, rating, description, image_url];
    const result = await this.query(query, params);
    return result;
}

storeHotel = async function (plan_id, day_order, place, lat, lng, startDate, endDate) {
    const query = `insert into hotel (plan_id, day_order, hotel_place, hotel_lat, hotel_lng, startdate, enddate) values($1, $2, $3, $4, $5, $6, $7)`;
    const params = [plan_id, day_order, place, lat, lng, startDate, endDate];
    const result = await this.query(query, params);
    return result;
}

}

exports.PlannerWorkspace = PlannerWorkspace;
