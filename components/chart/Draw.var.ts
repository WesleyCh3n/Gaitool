import * as d3 from "d3";

export var layout = {
  width: 1000,
  boxWidth: 200,
  boxHeight: 200,
  lineHeight: 200,
  areaHeight: 100,
  navHeight: 100,
  margin: { t: 10, r: 50, b: 30, l: 50, },
  getWidth: function () {
    return this.width - this.margin.l - this.margin.r;
  },
  getLineHeight: function () {
    return this.lineHeight - this.margin.t - this.margin.b;
  },
  getBoxHeight: function () {
    return this.boxHeight - this.margin.t - this.margin.b;
  },
  getAreaHeight: function () {
    return this.areaHeight - this.margin.t - this.margin.b;
  },
  getNavTickHeight: function () {
    return this.navHeight - this.margin.t - this.margin.b;
  },
};

// in order to update x domain with different brush area, this need to be global
export var xScale = d3.scaleLinear().range([0, layout.getWidth()]);
// export var xScaleNav = d3.scaleLinear().range([0, layout.getWidth()]);

export var selectRange = {
  index: {
    s: 0,
    e: 0,
  },
  value: {
    s: 0,
    e: 0,
  },
}
