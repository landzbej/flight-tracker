const Flight = require("./flightList")
const Info = require("./flight")

let flight1 = new Flight("Hawaii");
flight1.add(new Info("Hawaii"));
flight1.add(new Info("8 am"));
flight1.add(new Info("delta"));
flight1.add(new Info("Departs: Dulles"));
flight1.markAllDone();

let flight2 = new Flight("California");
flight2.add(new Info("LA"));
flight2.add(new Info("12 PM"));
flight2.add(new Info("Jetblue"));
flight2.add(new Info("departs BWI"));

let Flights = [
  flight1,
  flight2,
]


module.exports = Flights;