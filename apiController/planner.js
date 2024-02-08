const PlannerWorkspace = require("../postgres/planner").PlannerWorkspace;
const plannerWorkspace = new PlannerWorkspace();
const planner = require("../business_logic/alahiPlanner");
const { format } = require("date-fns");

function dateFormatter(time) {
  const year = time.getUTCFullYear();
  const month = (time.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = time.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNumberOfDaysBetweenDates(date1Str, date2Str) {
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);

  // Calculate the time difference in milliseconds
  const timeDifference = date2 - date1;

  // Convert milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference + 1;
}

class PlannerController {
  constructor() {}

  initialPlan = async (req, res, next) => {
    let destinations = req.body.destinations;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    const email = req.body.email;
    const currentCity = req.body.currentUserBrowsingCity;

    let numberOfDaysFromUser = getNumberOfDaysBetweenDates(startDate, endDate);

    //find out how many days is required for each destination
    let days_required = [];
    const location_data = await plannerWorkspace.findAllLocationInfo();
    for (let i = 0; i < destinations.length; i++) {
      //find the days_required for each location from location_data
      for (let j = 0; j < location_data.length; j++) {
        if (destinations[i] === location_data[j].Location_Name) {
          days_required.push(location_data[j].days_required);
          break;
        }
      }
    }

    //now i will allocate the number of days i will spend on each destination.........................................
    let total_days_required = 0;
    for (let i = 0; i < days_required.length; i++) {
      total_days_required += days_required[i];
    }
    let days_allocated = [];
    let total_days_allocated = 0;
    if (total_days_required > numberOfDaysFromUser) {
      for (let i = 0; i < days_required.length; i++) {
        days_allocated.push(
          Math.round(
            (days_required[i] / total_days_required) * numberOfDaysFromUser
          )
        );
        total_days_allocated += days_allocated[i];
        if (total_days_allocated > numberOfDaysFromUser) {
          days_allocated[i] -= 1;
          total_days_allocated -= 1;
        }
      }
    } else {
      total_days_allocated = 0;
      for (let i = 0; i < days_required.length; i++) {
        days_allocated.push(days_required[i]);
        total_days_allocated += days_allocated[i];
      }
    }
    //....................................................................................................................

    //extract month and day from start date and end date
    let startYear = startDate.substring(0, 4);
    let startMonth = startDate.substring(5, 7);
    let startDay = startDate.substring(8, 10);
    let endYear = endDate.substring(0, 4);
    let endMonth = endDate.substring(5, 7);
    let endDay = endDate.substring(8, 10);

    //create start and end date object
    const finalStartTime = new Date(startYear, startMonth - 1, startDay, 10, 0);
    const finalEndTime = new Date(endYear, endMonth - 1, endDay, 23, 59);

    let startTime = new Date(startYear, startMonth - 1, startDay, 10, 0);
    let cluster_value_list_list = [];
    let tsp_result;
    for (let i = 0; i < destinations.length; i++) {
      let alreadyVisitedSpots = [];
      let days_count = 0;
      while (true) {
        //if days allocated for this destination is over, then break the while loop and go to next location
        if (days_count === days_allocated[i]) break;

        if (startTime.getTime() > finalEndTime.getTime()) break;

        //get the week of day from start date
        let weekDay = startTime.getDay();
        let newSpotFound = false;
        console.log(
          "Finding Tourist Spots Open on Day: " +
            weekDay +
            ". " +
            new Date().toJSON().slice(11, 19)
        );
        const result = await plannerWorkspace.findSpotsOpenOnDay(
          destinations[i],
          weekDay
        );
        console.log(
          "Fetching spots done: " + new Date().toJSON().slice(11, 19)
        );
        let data = result.data;
        // console.log(data);
        let tourist_spots = [];
        for (let j = 0; j < data.length; j++) {
          let tourist_spot = data[j];
          let tourist_spot_id = tourist_spot.Tourist_Spot_ID;

          //if tourist spot id is already visited, then continue
          if (alreadyVisitedSpots.includes(tourist_spot_id)) continue;
          // alreadyVisitedSpots.push(tourist_spot_id);
          newSpotFound = true;

          let tourist_spot_name = tourist_spot.Name;
          let longitude = tourist_spot.Longitude;
          let latitude = tourist_spot.Latitude;
          let average_time_spent = tourist_spot.Average_Time_Spent;
          let rating = tourist_spot.Rating;
          let description = tourist_spot.Description;
          let image_url = tourist_spot.Image_Url;
          let open = tourist_spot.open;
          let close = tourist_spot.close;
          let tourist_spot_obj = {
            id: tourist_spot_id,
            place: tourist_spot_name,
            average_time_spent: average_time_spent,
            longitude: longitude,
            latitude: latitude,
            rating: rating,
            description: description,
            image_url: image_url,
            open: open,
            close: close,
          };
          tourist_spots.push(tourist_spot_obj);
        }
        if (!newSpotFound) {
          //if no new spot is found, then break the while loop and go to next location
          break;
        }
        let Data = { place: destinations[i], tourist_spots: tourist_spots };
        let endTime = new Date(
          startTime.getFullYear(),
          startTime.getMonth(),
          startTime.getDate(),
          23,
          59
        );
        const plan = await planner.planTour(Data, startTime, endTime);
        tsp_result = plan.tsp_result;
        // console.log(tsp_result);

        //need to add the spots from tsp_result from alreadyVisitedSpots
        for (let j = 0; j < tsp_result.length; j++) {
          if (tsp_result[j] === -1) continue; //its the restaurant
          let spot_id = Data.tourist_spots[tsp_result[j]].id;
          alreadyVisitedSpots.push(spot_id);
        }

        let timeMatrix = plan.timeMatrix;
        let distanceMatrix = plan.distanceMatrix;
        let lastEndTime = new Date(
          startTime.getFullYear(),
          startTime.getMonth(),
          startTime.getDate(),
          10,
          0
        );
        let cluster_value_list = [];
        for (let i = 0; i < tsp_result.length; i++) {
          //if tsp_result[i] is -1, then its the restaurant.....................................................
          if (tsp_result[i] === -1) {
            let name = "Restaurant";
            let id = -1;
            let startTime_t = format(lastEndTime, "hh:mm a");
            let avg_time_spent = 1;
            lastEndTime.setHours(lastEndTime.getHours() + avg_time_spent);
            let endTime_t = format(lastEndTime, "hh:mm a");
            //lat will be previous spots lat
            let lat = cluster_value_list[cluster_value_list.length - 1].lat;
            //lng will be previous spots lng
            let lng = cluster_value_list[cluster_value_list.length - 1].lng;
            let rating = 0;
            let description = "Restaurant";
            let imageURL =
              "https://www.pngitem.com/pimgs/m/146-1468479_my-restaurant-icon-restaurant-icon-png-transparent-png.png";
            let spot_obj = {
              name: name,
              id: id,
              startTime: startTime_t,
              endTime: endTime_t,
              lat: lat,
              lng: lng,
              rating: rating,
              description: description,
              imageURL: imageURL,
            };
            cluster_value_list.push(spot_obj);
            continue;
          }
          //its the restaurant..........................................................................

          let name = Data.tourist_spots[tsp_result[i]].place;
          let id = Data.tourist_spots[tsp_result[i]].id;
          let startTime_t = format(lastEndTime, "hh:mm a");
          let avg_time_spent =
            Data.tourist_spots[tsp_result[i]].average_time_spent;
          lastEndTime.setHours(lastEndTime.getHours() + avg_time_spent);
          let endTime_t = format(lastEndTime, "hh:mm a");
          let lat = Data.tourist_spots[tsp_result[i]].latitude;
          let lng = Data.tourist_spots[tsp_result[i]].longitude;
          let rating = Data.tourist_spots[tsp_result[i]].rating;
          let description = Data.tourist_spots[tsp_result[i]].description;
          let imageURL = Data.tourist_spots[tsp_result[i]].image_url;
          let open = Data.tourist_spots[tsp_result[i]].open;
          let close = Data.tourist_spots[tsp_result[i]].close;
          let spot_obj = {
            name: name,
            id: id,
            startTime: startTime_t,
            endTime: endTime_t,
            lat: lat,
            lng: lng,
            rating: rating,
            description: description,
            imageURL: imageURL,
            average_time_spent: avg_time_spent,
            open: open,
            close: close,
          };
          cluster_value_list.push(spot_obj);
          if (i < tsp_result.length - 1) {
            if (tsp_result[i + 1] === -1 && i + 2 < tsp_result.length)
              lastEndTime = new Date(
                lastEndTime.getTime() +
                  timeMatrix[tsp_result[i]][tsp_result[i + 2]]
              );
            else if (!(tsp_result[i + 1] === -1))
              lastEndTime = new Date(
                lastEndTime.getTime() +
                  timeMatrix[tsp_result[i]][tsp_result[i + 1]]
              );
          }
        }
        cluster_value_list_list.push(cluster_value_list);
        // console.log(cluster_value_list_list);
        startTime.setDate(startTime.getDate() + 1);
        days_count += 1;
      }
    }
    let daybyday = []; //this is daybyday plan
    let plan_StartTime = new Date(
      finalStartTime.getFullYear(),
      finalStartTime.getMonth(),
      finalStartTime.getDate(),
      10,
      0
    );
    // const options = {
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    //   timeZone: "UTC"
    // };
    // const formatter = new Intl.DateTimeFormat("en-US", options);
    for (let i = 0; i < cluster_value_list_list.length; i++) {
      let date_value = dateFormatter(plan_StartTime);
      let cluster_value_list = cluster_value_list_list[i];
      let endDate_t = new Date(
        plan_StartTime.getFullYear(),
        plan_StartTime.getMonth(),
        plan_StartTime.getDate() + 1,
        10,
        0
      );
      let hotel_value = {
        place:
          cluster_value_list_list[i][cluster_value_list_list[i].length - 1]
            .name,
        lat: cluster_value_list_list[i][cluster_value_list_list[i].length - 1]
          .lat,
        lng: cluster_value_list_list[i][cluster_value_list_list[i].length - 1]
          .lng,
        startDate: dateFormatter(plan_StartTime),
        endDate: dateFormatter(endDate_t),
      };
      let daybyday_obj = {
        date: date_value,
        cluster: cluster_value_list,
        hotel: hotel_value,
      };
      // let plan = [];
      // plan.push(cluster_obj);
      // plan.push(hotel_obj);
      // let final_obj = {
      //   date : date_value,
      //   plan : plan
      // }
      daybyday.push(daybyday_obj);
      plan_StartTime.setDate(plan_StartTime.getDate() + 1);
    }

    for (let i = 0; i < daybyday.length; i++) {
      let cluster = daybyday[i].cluster;
      console.log("Day " + (i + 1) + " :");
      for (let j = 0; j < cluster.length; j++) {
        console.log(
          cluster[j].name +
            " " +
            cluster[j].startTime +
            " " +
            cluster[j].endTime
        );
      }
    }

    //create the plan name.............................................
    let planName = total_days_allocated + " days in ";
    for (let i = 0; i < destinations.length; i++) {
      if (days_allocated[i] === 0) continue;
      else {
        planName += destinations[i] + ", ";
      }
    }
    planName = planName.substring(0, planName.length - 2);
    //plan name created successfully....................................

    //i have to return days_allocated with name of destination, lat, lng and final_plan_list
    let destination_value = [];
    for (let i = 0; i < destinations.length; i++) {
      //get latitude and longitude form location_data, location_data has been called earlier in the code
      let lat;
      let lng;
      for (let j = 0; j < location_data.length; j++) {
        if (destinations[i] === location_data[j].Location_Name) {
          lat = location_data[j].Latitude;
          lng = location_data[j].Longitude;
          break;
        }
      }

      if (days_allocated[i] === 0) continue;
      else {
        let name = destinations[i];
        let days = days_allocated[i];
        let obj = {
          name: name,
          days: days,
          lat: lat,
          lng: lng,
        };
        destination_value.push(obj);
      }
    }

    let final_return_obj = {
      planName: planName,
      destinations: destination_value,
      daybyday: daybyday,
    };

    //store the plan in the database ........................................................
    //first get the plan id, it is auto incremented in the database
    // const plan_id = await plannerWorkspace.getPlanId(email, planName);
    // for (let i = 0; i < destination_value.length; i++) {
    //   //now store plan_id, destination_order, name, days in the plan_destination table
    //   const destination_order = i;
    //   const name = destination_value[i].name;
    //   const days = destination_value[i].days;
    //   await plannerWorkspace.storePlanDestination(plan_id, destination_order, name, days);
    // }
    // for (let i = 0; i < daybyday.length; i++) {
    //   //now store plan_id, day_order, date in the day_by_day table
    //   const day_order = i;
    //   const date = daybyday[i].date;
    //   await plannerWorkspace.storeDayByDay(plan_id, day_order, date);
    //   for (let j = 0; j < daybyday[i].cluster.length; j++) {
    //     //now store plan_id, day_order, cluster_order, name, id, start_time, end_time, lat, lng, rating, description, image_url in the cluster table
    //     const cluster_order = j;
    //     const name = daybyday[i].cluster[j].name;
    //     const id = daybyday[i].cluster[j].id;
    //     const start_time = daybyday[i].cluster[j].startTime;
    //     const end_time = daybyday[i].cluster[j].endTime;
    //     const lat = daybyday[i].cluster[j].lat;
    //     const lng = daybyday[i].cluster[j].lng;
    //     const rating = daybyday[i].cluster[j].rating;
    //     const description = daybyday[i].cluster[j].description;
    //     const image_url = daybyday[i].cluster[j].imageURL;
    //     await plannerWorkspace.storeCluster(plan_id, day_order, cluster_order, name, id, start_time, end_time, lat, lng, rating, description, image_url);
    //   }
    //   //now store plan_id, day_order, place, lat, lng, startDate, endDate in the hotel table
    //   const place = daybyday[i].hotel.place;
    //   const lat = daybyday[i].hotel.lat;
    //   const lng = daybyday[i].hotel.lng;
    //   const startDate = daybyday[i].hotel.startDate;
    //   const endDate = daybyday[i].hotel.endDate;
    //   await plannerWorkspace.storeHotel(plan_id, day_order, place, lat, lng, startDate, endDate);
    // }
    //Plan stored in databse successfully.......................................................................................

    return res.status(200).json(final_return_obj);
  };

  savePlan = async (req, res, next) => {
    //print the req body
    // console.log(req.body);
    const currentPlan = req.body.plan;
    const email = req.body.email;
    const planName = currentPlan.planName;
    const destination_value = currentPlan.destinations;
    const daybyday = currentPlan.daybyday;
    //store the plan in the database ........................................................
    //first get the plan id, it is auto incremented in the database
    const plan_id = await plannerWorkspace.getPlanId(email, planName);
    for (let i = 0; i < destination_value.length; i++) {
      //now store plan_id, destination_order, name, days in the plan_destination table
      const destination_order = i;
      const name = destination_value[i].name;
      const days = destination_value[i].days;
      await plannerWorkspace.storePlanDestination(
        plan_id,
        destination_order,
        name,
        days
      );
    }
    for (let i = 0; i < daybyday.length; i++) {
      //now store plan_id, day_order, date in the day_by_day table
      const day_order = i;
      const date = daybyday[i].date;
      await plannerWorkspace.storeDayByDay(plan_id, day_order, date);
      for (let j = 0; j < daybyday[i].cluster.length; j++) {
        //now store plan_id, day_order, cluster_order, name, id, start_time, end_time, lat, lng, rating, description, image_url in the cluster table
        const cluster_order = j;
        const name = daybyday[i].cluster[j].name;
        const id = daybyday[i].cluster[j].id;
        const start_time = daybyday[i].cluster[j].startTime;
        const end_time = daybyday[i].cluster[j].endTime;
        const lat = daybyday[i].cluster[j].lat;
        const lng = daybyday[i].cluster[j].lng;
        const rating = daybyday[i].cluster[j].rating;
        const description = daybyday[i].cluster[j].description;
        const image_url = daybyday[i].cluster[j].imageURL;
        await plannerWorkspace.storeCluster(
          plan_id,
          day_order,
          cluster_order,
          name,
          id,
          start_time,
          end_time,
          lat,
          lng,
          rating,
          description,
          image_url
        );
      }
      //now store plan_id, day_order, place, lat, lng, startDate, endDate in the hotel table
      const place = daybyday[i].hotel.place;
      const lat = daybyday[i].hotel.lat;
      const lng = daybyday[i].hotel.lng;
      const startDate = daybyday[i].hotel.startDate;
      const endDate = daybyday[i].hotel.endDate;
      await plannerWorkspace.storeHotel(
        plan_id,
        day_order,
        place,
        lat,
        lng,
        startDate,
        endDate
      );
    }
    // Plan stored in databse successfully.......................................................................................
    console.log("plan successfully saved in database");
    return res.status(200).json("done");
  };

  update = async (req, res, next) => {
    let initialPlan = req.body.plan; //plan is final_return_obj from initialPlan
    let date = req.body.date;
    let tourist_spot_add = req.body.tourist_spot_add;
    let tourist_spot_remove = req.body.tourist_spot_remove;

    //now i have to search the plan for the specific date and update tourist_spots only on that date
    let daybyday = initialPlan.daybyday;
    let daybyday_index;
    for (let i = 0; i < daybyday.length; i++) {
      if (daybyday[i].date === date) {
        daybyday_index = i;
        break;
      }
    }

    //first create the Data to send to planTour
    let Data = {};
    let count = 0;
    for (let i = 0; i < initialPlan.destinations.length; i++) {
      //finding location name: place
      count += initialPlan.destination[i].days;
      if (count >= daybyday_index + 1) {
        Data.place = initialPlan.destination[i].name;
        break;
      }
    }

    //now i have to take tourist spots from the cluster of that day, update it with add and remove and call planTour to get new spots for that day
    Data.tourist_spots = [];
    let cluster = daybyday[daybyday_index].cluster;
    for (let i = 0; i < cluster.length; i++) {
      let spot_obj = {};
      spot_obj.id = cluster[i].id;
      if (tourist_spot_remove.includes(cluster[i].id)) continue;
      spot_obj.place = cluster[i].name;
      spot_obj.average_time_spent = average_time_spent;
      spot_obj.longitude = cluster[i].lng;
      spot_obj.latitude = cluster[i].lat;
      spot_obj.rating = cluster[i].rating;
      spot_obj.description = cluster[i].description;
      spot_obj.image_url = cluster[i].imageURL;
      spot_obj.open = cluster[i].open;
      spot_obj.close = cluster[i].close;
      Data.tourist_spots.push(spot_obj);
    }
    //i have to get information of tourist_spot_add from database
    let day = new Date(date).getDay();
    const tourist_spots_result = await plannerWorkspace.findAllSpotsWithTime(
      Data.place,
      day
    );
    for (let i = 0; i < tourist_spot_add.length; i++) {
      let index;
      for (let j = 0; j < tourist_spots_result.data.length; j++) {
        if (tourist_spot_add[i] === tourist_spots_result.data[j].id) {
          index = j;
          break;
        }
      }
      let spot_obj = {};
      spot_obj.id = tourist_spots_result.data[index].id;
      spot_obj.place = tourist_spots_result.data[index].name;
      spot_obj.average_time_spent =
        tourist_spots_result.data[index].average_time_spent;
      spot_obj.longitude = tourist_spots_result.data[index].longitude;
      spot_obj.latitude = tourist_spots_result.data[index].latitude;
      spot_obj.rating = tourist_spots_result.data[index].rating;
      spot_obj.description = tourist_spots_result.data[index].description;
      spot_obj.image_url = tourist_spots_result.data[index].image_url;
      spot_obj.open = tourist_spots_result.data[index].open;
      spot_obj.close = tourist_spots_result.data[index].close;
      spot_obj.priority = -1;
      Data.tourist_spots.push(spot_obj);
    }

    //crete startTime and endTime to send to planTour
    let startTime = new Date(date);
    startTime.setHours(10);
    startTime.setMinutes(0);
    let endTime = new Date(date);
    endTime.setHours(23);
    endTime.setMinutes(59);

    //now call planTour to get new spots for that day
    const plan = await planner.planTour(Data, startTime, endTime);
    let tsp_result = plan.tsp_result;
    let timeMatrix = plan.timeMatrix;
    let distanceMatrix = plan.distanceMatrix;
    let lastEndTime = new Date(
      startTime.getFullYear(),
      startTime.getMonth(),
      startTime.getDate(),
      10,
      0
    );
    let cluster_value_list = [];
    for (let i = 0; i < tsp_result.length; i++) {
      //if tsp_result[i] is -1, then its the restaurant.....................................................
      if (tsp_result[i] === -1) {
        let name = "Restaurant";
        let id = -1;
        let startTime_t = format(lastEndTime, "hh:mm a");
        let avg_time_spent = 1;
        lastEndTime.setHours(lastEndTime.getHours() + avg_time_spent);
        let endTime_t = format(lastEndTime, "hh:mm a");
        //lat will be previous spots lat
        let lat = cluster_value_list[cluster_value_list.length - 1].lat;
        //lng will be previous spots lng
        let lng = cluster_value_list[cluster_value_list.length - 1].lng;
        let rating = 0;
        let description = "Restaurant";
        let imageURL =
          "https://www.pngitem.com/pimgs/m/146-1468479_my-restaurant-icon-restaurant-icon-png-transparent-png.png";
        let spot_obj = {
          name: name,
          id: id,
          startTime: startTime_t,
          endTime: endTime_t,
          lat: lat,
          lng: lng,
          rating: rating,
          description: description,
          imageURL: imageURL,
        };
        cluster_value_list.push(spot_obj);
        continue;
      }
      //its the restaurant..........................................................................
      let name = Data.tourist_spots[tsp_result[i]].place;
      let id = Data.tourist_spots[tsp_result[i]].id;
      let startTime_t = format(lastEndTime, "hh:mm a");
      let avg_time_spent = Data.tourist_spots[tsp_result[i]].average_time_spent;
      lastEndTime.setHours(lastEndTime.getHours() + avg_time_spent);
      let endTime_t = format(lastEndTime, "hh:mm a");
      let lat = Data.tourist_spots[tsp_result[i]].latitude;
      let lng = Data.tourist_spots[tsp_result[i]].longitude;
      let rating = Data.tourist_spots[tsp_result[i]].rating;
      let description = Data.tourist_spots[tsp_result[i]].description;
      let imageURL = Data.tourist_spots[tsp_result[i]].image_url;
      let open = Data.tourist_spots[tsp_result[i]].open;
      let close = Data.tourist_spots[tsp_result[i]].close;
      let spot_obj = {
        name: name,
        id: id,
        startTime: startTime_t,
        endTime: endTime_t,
        lat: lat,
        lng: lng,
        rating: rating,
        description: description,
        imageURL: imageURL,
        average_time_spent: avg_time_spent,
        open: open,
        close: close,
      };
      cluster_value_list.push(spot_obj);
      if (i < tsp_result.length - 1) {
        if (tsp_result[i + 1] === -1 && i + 2 < tsp_result.length)
          lastEndTime = new Date(
            lastEndTime.getTime() + timeMatrix[tsp_result[i]][tsp_result[i + 2]]
          );
        else if (!(tsp_result[i + 1] === -1))
          lastEndTime = new Date(
            lastEndTime.getTime() + timeMatrix[tsp_result[i]][tsp_result[i + 1]]
          );
      }
    }

    //now i have to update the cluster of that day in daybyday
    daybyday[daybyday_index].cluster = cluster_value_list;

    //now i have to update the hotel of that day in daybyday
    let hotel = daybyday[daybyday_index].hotel;
    hotel.place = cluster_value_list[cluster_value_list.length - 1].name;
    hotel.lat = cluster_value_list[cluster_value_list.length - 1].lat;
    hotel.lng = cluster_value_list[cluster_value_list.length - 1].lng;
    let endDate_t = new Date(date);
    endDate_t.setDate(endDate_t.getDate() + 1);
    hotel.endDate = dateFormatter(endDate_t);

    //now i have to update the daybyday in initialPlan
    initialPlan.daybyday = daybyday;

    //now i have to update the plan in the database

    return res.status(200).json(initialPlan);
  };
}

exports.PlannerController = PlannerController;
