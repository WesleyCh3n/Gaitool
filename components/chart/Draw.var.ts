import * as d3 from 'd3';

export var margin      = { top: 10, right: 50, bottom: 20, left: 50 };
export var width       = 1000 - margin.left - margin.right;
export var areaHeight  = 80 - margin.top - margin.bottom;
export var lineHeight  = 150 - margin.top - margin.bottom;
export var brushHeight = 50

export var brushXScale = d3.scaleLinear().range([0, width]);
export var xScale = d3.scaleLinear().range([0, width]);
