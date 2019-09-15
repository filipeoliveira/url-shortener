'use strict'

class Statistics {

  constructor() {
    this.start = process.hrtime();
    this.end = null;
  }

  calculate() {
    let hrend = process.hrtime(this.start);
    this.end = (hrend[1] / 1000000)

    return this.end + "ms";
  }

}

module.exports = Statistics
