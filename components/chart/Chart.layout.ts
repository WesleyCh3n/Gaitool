export var layout = {
  width: 1000,
  boxWidth: 200,
  boxHeight: 205,
  lineHeight: 240,
  areaHeight: 100,
  navHeight: 100,
  margin: { t: 20, r: 50, b: 30, l: 50, },
  getWidth: function () {
    return this.width - this.margin.l - this.margin.r;
  },
  getLineHeight: function () {
    return this.lineHeight - this.margin.t - this.margin.b;
  },
  getBoxHeight: function () {
    return this.boxHeight - this.margin.b;
  },
  getAreaHeight: function () {
    return this.areaHeight - this.margin.t - this.margin.b;
  },
  getNavTickHeight: function () {
    return this.navHeight - this.margin.b - 20;
  },
};
