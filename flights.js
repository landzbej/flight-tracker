const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator")
const Info = require("./lib/flight");
const FlightList = require("./lib/flightList")
const { sortFlights, sortInfo } = require("./lib/sort");
const store = require("connect-loki");


const app = express();
const host = "localhost";
const port = 3000;
const LokiStore = store(session);

// let Flights = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000,
    path: "/",
    secure: false,
  },
  name: "launch-school-flights-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very very secure",
  store: new LokiStore({}),
}));

app.use(flash());

// Set up persistent session data
app.use((req, res, next) => {
  let Flights = [];
  if ("Flights" in req.session) {
    req.session.Flights.forEach(Flight => {
      Flights.push(FlightList.makeFlight(Flight));
    });
  }

  req.session.Flights = Flights;
  next();
});

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
})

const loadFlight = (FlightId, Flights) => {
  return Flights.find(Flight => Flight.id === FlightId)
}

const loadInfo = (FlightId, InfoId, Flights) => {
  let Flight = loadFlight(FlightId, Flights);
  if (!Flight) return undefined;

  return Flight.Infos.find(info => info.id === InfoId)
}

// const loadFlight = (FlightListId, FlightId, FlightLists) => {
//   let FlightList = loadFlightList(FlightListId, FlightLists);
//   if(!FlightList) return undefined;

//   return FlightList.flights.find(flight => flight.id === flightId)
// }

app.get("/", (req, res) => {
  res.redirect("/flights")
});

app.get("/flights", (req, res) => {
  res.render("flights", {
    Flights: sortFlights(req.session.Flights),
  })
})

app.get("/flights/new", (req, res) => {
  res.render("new-flight")
});

app.post("/flights", 
[
  body("FlightTitle")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Title required")
  .isLength({ max: 100 })
  .withMessage("message must be less than 100 chars")
  .custom((title, { req }) => {
    let Flights = req.session.Flights;
    let duplicate = Flights.find(flight => flight.title === title);
    return duplicate === undefined;
  })
  .withMessage("duplicate"),
 ],
(req, res) => {
let errors = validationResult(req);
if(!errors.isEmpty()) {
  errors.array().forEach(message => req.flash("error", message.msg));
  res.render("new-flight", {
    flash: req.flash(),
    FlightTitle: req.body.FlightTitle,
  })
} else {
  
    // let title = req.body.FlightTitle.trim();
  req.session.Flights.push(new FlightList(req.body.FlightTitle));
  req.flash("success", "the flight has been saved")
  res.redirect("/flights");
  }
}
)

app.get("/flights/:FlightId", (req, res, next) => {
  let FlightId = req.params.FlightId;
  let Flight = loadFlight(+FlightId, req.session.Flights);
  let Infos = sortInfo(Flight);
  if(Flight === undefined) {
    next(new Error("Not found"));
  } else {
    res.render("flight", {
      Flight: Flight,
      Infos: Infos,
    })
  }
})

app.post("/flights/:FlightId/Info", 
[
  body("InfoTitle")
  .trim()
  .isLength({ min: 1 })
  .withMessage("The info title is required.")
  .isLength({ max: 100 })
  .withMessage("Todo info must be between 1 and 100 characters."),
  ],
  (req, res, next) => {
    let FlightId = req.params.FlightId;
    let Flight = loadFlight(+FlightId, req.session.Flights);
    if (!Flight) {
      next(new Error("Not found."));
    } else {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));

        res.render("flight", {
          flash: req.flash(),
          Flight: Flight,
          Infos: sortInfo(Flight),
          InfoTitle: req.body.InfoTitle,
        });
      } else {
        let InfoTitle = new Info(req.body.InfoTitle);
        Flight.add(InfoTitle);
        req.flash("success", "The Info has been created.");
        res.redirect(`/flights/${FlightId}`);
      }
    }
  }
);

app.post("/flights/:FlightId/Info/:InfoId/destroy", (req, res, next) => {
  let { FlightId, InfoId } = { ...req.params };

  let Flight = loadFlight(+FlightId, req.session.Flights);
  if (!Flight) {
    next(new Error("Not found"));
  } else {
    let Info = loadInfo(+FlightId, +InfoId, req.session.Flights);
    if(!Info) {
      next(new Error("Not found"));
    } else {
      Flight.removeAt(Flight.findIndexOf(Info));
      req.flash("success", "the info has been deleted");
      res.redirect(`/flights/${FlightId}`);
    }
  }

})
  
app.get("/flights/:FlightId/edit", (req, res, next) => {
  let FlightId = req.params.FlightId;
  let Flight = loadFlight(+FlightId, req.session.Flights);
  if (!Flight) {
    next(new Error("Not found."));
  } else {
    res.render("edit-flight", { Flight })
  }
})

app.post("/flights/:FlightId/destroy", (req, res, next) => {
  let Flights = req.session.Flights;
  let FlightId = +req.params.FlightId;
  let index = Flights.findIndex(Flight => Flight.id === FlightId);
  if (index === -1) {
    next(new Error("Not found"));
  } else {
    Flights.splice(index, 1);

    req.flash("success", "Flight deleted");
    res.redirect("/flights")
  }
});

app.post("/flights/:FlightId/complete_all", (req, res, next) => {
  let FlightId = req.params.FlightId;
  let Flight = loadFlight(+FlightId, req.session.Flights);
  if(!Flight) {
    next(new Error("Not found."));
  } else {
    Flight.markAllDone();
    req.flash("success", "All todos have been marked as done.");
    res.redirect(`/flights/${FlightId}`);
  }
});

app.post("/flights/:FlightId/edit", 
[
  body("FlightTitle")
  .trim()
  .isLength({ min:1 })
  .withMessage('no title')
  .isLength({ max:100 })
  .withMessage("too long")
  .custom((title, { req }) => {
    let Flights = req.session.Flights;
    let duplicate = Flights.find(Info => Info.title === title);
    return duplicate === undefined;
  })
  .withMessage("duplicate"),
],
(req, res, next) => {
  let FlightId = req.params.FlightId;
  let Flight = loadFlight(+FlightId, req.session.Flights);
  if(!Flight) {
    next(new Error("Not found"));
  } else {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));

      res.render("edit-flight", {
        flash: req.flash(),
        FlightTitle: req.body.FlightTitle,
        Flight: Flight,
      });
    } else {
      Flight.setTitle(req.body.FlightTitle);
      req.flash("success", "Flight updated");
      res.redirect(`/flights/${FlightId}`);
    }
  }
})

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
})

app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`)
});