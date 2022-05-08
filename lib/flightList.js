const nextId = require("./next-id");
const Initfos = require("./flight");

class flightList {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.Infos = [];
  }

  add(Info) {
    if (!(Info instanceof Initfos)) {
      throw new TypeError("can only add Infos objects");
    }

    this.Infos.push(Info);
  }

  size() {
    return this.Infos.length;
  }

  first() {
    return this.Infos[0];
  }

  last() {
    return this.Infos[this.size() - 1];
  }

  itemAt(index) {
    this._validateIndex(index);
    return this.Infos[index];
  }

  markDoneAt(index) {
    this.itemAt(index).markDone();
  }

  markUndoneAt(index) {
    this.itemAt(index).markUndone();
  }

  isDone() {
    return this.size() > 0 && this.Infos.every(Info => Info.isDone());
  }

  shift() {
    return this.Infos.shift();
  }

  pop() {
    return this.Infos.pop();
  }

  removeAt(index) {
    this._validateIndex(index);
    return this.Infos.splice(index, 1);
  }

  toString() {
    let title = `---- ${this.Infos} ----`;
    let list = this.Infos.map(Info => Info.toString()).join("\n");
    return `${title}\n${list}`;
  }

  forEach(callback) {
    this.Infos.forEach(Info => callback(Info));
  }

  filter(callback) {
    let newList = new flightList(this.title);
    this.forEach(Info => {
      if (callback(Info)) {
        newList.add(Info);
      }
    });

    return newList;
  }

  findByTitle(title) {
    return this.filter(Info => Info.title === title).first();
  }

  findById(id) {
    return this.filter(Info => Info.id === id).first();
  }

  findIndexOf(dataToFind) {
    let findId = dataToFind.id;
    return this.Infos.findIndex(Info => Info.id === findId);
  }

  allDone() {
    return this.filter(Info => Info.isDone());
  }

  allNotDone() {
    return this.filter(Info => !Info.isDone());
  }

  allTodos() {
    return this.filter(_ => true);
  }

  markDone(title) {
    let Info = this.findByTitle(title);
    if (Info !== undefined) {
      Info.markDone();
    }
  }

  markAllDone() {
    this.forEach(Info => Info.markDone());
  }

  markAllUndone() {
    this.forEach(Info => Info.markUndone());
  }

  toArray() {
    return this.Infos.slice();
  }

  setTitle(title) {
    this.title = title;
  }

  static makeFlight(rawflightList) {
    let Flight = Object.assign(new flightList(), {
      id: rawflightList.id,
      title: rawflightList.title,
    });

    rawflightList.Infos.forEach(Info => Flight.add(Initfos.makeInfo(Info)));
    return Flight;
  }

  _validateIndex(index) { // _ in name indicates "private" method
    if (!(index in this.Infos)) {
      throw new ReferenceError(`invalid index: ${index}`);
    }
  }
}

module.exports = flightList;