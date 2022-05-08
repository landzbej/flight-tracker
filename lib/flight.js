const nextId = require("./next-id");

class Info {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.done = false;
  }

  toString() {
    let marker = this.isDone() ? Info.DONE_MARKER : Info.UNDONE_MARKER;
    return `[${marker}] ${this.title}`;
  }

  markDone() {
    this.done = true;
  }

  markUndone() {
    this.done = false;
  }

  isDone() {
    return this.done;
  }

  setTitle(title) {
    this.title = title;
  }

  static makeInfo(rawInfo) {
    return Object.assign(new Info(), rawInfo);
  }
}

Info.DONE_MARKER = "X";
Info.UNDONE_MARKER = " ";

module.exports = Info;