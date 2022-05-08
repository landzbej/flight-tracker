// Compare object titles alphabetically (case-insensitive)
const compareByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
};

module.exports = {
  // return the list of todo lists sorted by completion status and title.
  sortFlights(Flights) {
    let undone = Flights.filter(Flight => !Flight.isDone());
    let done = Flights.filter(Flight => Flight.isDone());
    undone.sort(compareByTitle);
    done.sort(compareByTitle);
    return [].concat(undone, done);
  },

  // sort a list of todos
  sortInfo(Flight) {
    let undone = Flight.Infos.filter(Info => !Info.isDone());
    let done = Flight.Infos.filter(Info => Info.isDone());
    undone.sort(compareByTitle);
    done.sort(compareByTitle);
    return [].concat(undone, done);
  },
};