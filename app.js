// Rainfall graph
var format = d3.format(",");

var country_id_map, rain_bounds, rain_g, rain_title, rain_tooltip, rain_x, rain_y;
var rain_cum_bounds, rain_cum_g, rain_cum_title, rain_cum_tooltip, rain_cum_x, rain_cum_y, rain_cum_line;


var rain_svg = d3.select('#rainfall');

// data filtering
// set from map
var selected_country = 'USA';
// set from slider
var yearOfView = '1991';
// selected country and year's statistics

var rainfallStats = null;
var rain_svg_margin = { top: 30, right: 20, bottom: 30, left: 40 };


rain_svg.attr("class", "auto-width");
rain_svg.style("height", "46%");

var rain_cum_svg = d3.select('#info-wrapper');
rain_cum_svg.attr("class", "auto-width");
rain_cum_svg.style("height", "47%");


d3.json('./data/country_id_map.json', function(data) {
  country_id_map = data;

  rain_bounds = rain_svg.node().getBoundingClientRect(),
    r_width = rain_bounds.width - rain_svg_margin.left - rain_svg_margin.right,
    r_height = rain_bounds.height - rain_svg_margin.top - rain_svg_margin.bottom,
    rain_x = d3.scaleBand(),
    rain_y = d3.scaleLinear();

  rain_cum_bounds = rain_cum_svg.node().getBoundingClientRect(),
    r_cum_width = rain_cum_bounds.width - rain_svg_margin.left - rain_svg_margin.right,
    r_cum_height = rain_cum_bounds.height - rain_svg_margin.top - rain_svg_margin.bottom,
    rain_cum_x = d3.scaleBand(),
    rain_cum_y = d3.scaleLinear();

  rain_g = rain_svg.append("g")
    .attr("transform", "translate(" + rain_svg_margin.left + "," + rain_svg_margin.top + ")");

  rain_cum_g = rain_cum_svg.append("g")
    .attr("transform", "translate(" + rain_svg_margin.left + "," + rain_svg_margin.top + ")");

  rain_g.append("g")
    .attr("class", "axis axis--x");

  rain_g.append("g")
    .attr("class", "axis axis--y");

  rain_cum_g.append("g")
    .attr("class", "c_axis c_axis--x");

  rain_cum_g.append("g")
    .attr("class", "c_axis c_axis--y");

  rain_title = rain_g.append("text") // Title
    .attr("x", (r_width / 2))
    .attr("y", 0 - (rain_svg_margin.top / 4))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text("Rainfall Distribution in year " + yearOfView + " in " + country_id_map[selected_country]);

  rain_g.append("text") // text label for the y axis
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - rain_svg_margin.left)
    .attr("x", 0 - (r_height / 2))
    .attr("dy", "0.71em")
    .attr('class', 'axis-label')
    .text("Rainfall in mm");

  rain_g.append("text") // text label for the x axis
    .attr("x", r_width / 2)
    .attr("y", r_height + rain_svg_margin.bottom)
    .attr('class', 'axis-label')
    .text("Month");

  rain_tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "Rainfall(mm): <span>" + d.Rainfall + "</span>";
    });


  rain_cum_title = rain_cum_g.append("text") // Title
    .attr("x", (r_cum_width / 2.2))
    .attr("y", 0 - (rain_svg_margin.top / 4))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text("Highest Rainfall in " + country_id_map[selected_country] + ' from 1991-2016');

  rain_cum_g.append("text") // text label for the y axis
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - rain_svg_margin.left)
    .attr("x", 0 - (r_cum_height / 2))
    .attr("dx", "-.8em")

    .attr("dy", "0.71em")
    .attr('class', 'axis-label')
    .text("Rainfall in mm");

  rain_cum_g.append("text") // text label for the x axis
    .attr("x", r_cum_width / 2)
    .attr("y", r_cum_height + rain_svg_margin.bottom)
    .attr("dy", ".30em")
    .attr('class', 'axis-label')
    .text("Year");

  rain_cum_tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "Rainfall(mm): <span>" + d.Rainfall + "</span>";
    });

  rain_g.call(rain_tooltip);
  rain_cum_g.call(rain_cum_tooltip);
})

var rainfallDataProcessing = function(isUpdate) {
  d3.csv('./data/rainfall.csv', function(data) {
    var country_filterData = data.filter(function(d) {
      if (d['ISO3'] == selected_country) {
        return d
      }
    })
    if (country_filterData.length > 0) {


      cum_year_filterData = {}
      country_filterData.forEach(function(d) {
        if (!cum_year_filterData[d.Year]) {
          cum_year_filterData[d.Year] = d
        } else {
          cum_year_filterData[d.Year] = parseInt(d.Rainfall) > parseInt(cum_year_filterData[d.Year].Rainfall) ? d : cum_year_filterData[d.Year]
        }
      })
      cum_year_filterData = Object.values(cum_year_filterData)

      var filterData = country_filterData.filter(function(d) {
        if (d['Year'] == yearOfView) {
          return d
        }
      })

      rainfallStats = filterData

      rain_x.domain(filterData.map(function(d, i) {
        return d.Statistics;
      }));
      rain_cum_x.domain(cum_year_filterData.map(function(d, i) {
        return d.Year;
      }));

      if (isUpdate) {
        rain_title.text("Rainfall Distribution in year " + yearOfView + " in " + country_id_map[selected_country]);
        rain_cum_title.text("Highest Rainfall in " + country_id_map[selected_country] + " from 1991-2016");

        updateBarChart(filterData)
        updateLineChart(cum_year_filterData)
      } else {
        rain_y.domain([0, d3.max(filterData, function(d, i) {
          return parseFloat(d.Rainfall);
        })]);

        rain_cum_y.domain([0, d3.max(cum_year_filterData, function(d, i) {
          return parseFloat(d.Rainfall);
        })]);

        drawBarChart(filterData)
        drawLineChart(cum_year_filterData)
      }
    }
  })
};


function drawBarChart(r_data) {
  rain_x.rangeRound([0, r_width]);
  rain_y.rangeRound([r_height, 0]);
  rain_x.padding([0.2]);
  rain_g.select(".axis--x")
    .attr("transform", "translate(0," + r_height + ")")
    .call(d3.axisBottom(rain_x));
  rain_g.select(".axis--y")
    .call(d3.axisLeft(rain_y));
  rain_g.selectAll(".rainfall_bar")
    .data(r_data)
    .enter().append("rect")
    .attr('class', 'rainfall_bar')
    .attr('width', rain_x.bandwidth())
    .attr('x', function(d, i) {
      return rain_x(d.Statistics);
    })
    // to produce bar transition from bottom to top instead of top to bottom
    .attr("y", function(d) {
      return rain_y(0);
    })
    .attr("height", 0)
    .transition()
    .duration(800)
    .attr('y', function(d) {
      return rain_y(parseFloat(d.Rainfall));
    })
    .attr('height', function(d) {
      return r_height - rain_y(d.Rainfall);
    })
    .delay(function(d, i) { return (i * 50) });


  rain_g.selectAll('rect')
    .on("mouseover", rain_tooltip.show)
    .on("mouseout", rain_tooltip.hide)

}

function drawLineChart(cr_data) {
  rain_cum_x.rangeRound([0, r_cum_width]);
  rain_cum_y.rangeRound([r_cum_height, 0]);
  // rain_cum_x.padding([0.2]);
  rain_cum_g.select(".c_axis--x")
    .attr("transform", "translate(0," + r_cum_height + ")")
    .call(d3.axisBottom(rain_cum_x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");
  rain_cum_g.select(".c_axis--y")
    .call(d3.axisLeft(rain_cum_y));
  rain_cum_line = d3.line()
    .x(function(d, i) { return rain_cum_x(d.Year); })
    .y(function(d, i) { return rain_cum_y(parseFloat(d.Rainfall)); })

  rain_cum_g.data(cr_data);
  data = cr_data
  rain_cum_g.append("path")
    .datum(cr_data)
    .attr("class", "rain_line")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("fill", "none")
    .attr("d", rain_cum_line);

  rain_cum_g.selectAll(".dot")
    .data(cr_data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", function(d, i) { return rain_cum_x(d.Year) })
    .attr("cy", function(d, i) { return rain_cum_y(parseFloat(d.Rainfall)) })
    .attr("r", 3)
    .on("mouseover", rain_cum_tooltip.show)
    .on("mouseout", rain_cum_tooltip.hide)
}

rainfallDataProcessing(false)

function updateBarChart(r_data) {
  rain_y.domain([0, d3.max(r_data, function(d, i) {
    return parseFloat(d.Rainfall);
  })]);
  rain_g.select(".axis--y")
    .call(d3.axisLeft(rain_y));

  rain_g.selectAll('rect')
    .data(r_data)
    .transition()
    .delay(function(d, i) { return i * 50; })
    .duration(500)
    .attr('y', function(d) {
      return rain_y(parseFloat(d.Rainfall));
    })
    .attr('height', function(d) {
      return r_height - rain_y(d.Rainfall);
    })

}

function updateLineChart(cr_data) {
  rain_cum_y.domain([0, d3.max(cr_data, function(d, i) {
    return parseFloat(d.Rainfall);
  })]);
  rain_cum_g.select(".c_axis--y")
    .call(d3.axisLeft(rain_cum_y));

  rain_cum_svg.select(".rain_line")
    .datum(cr_data)
    .transition()
    .delay(function(d, i) { return i * 50; })
    .duration(1000)
    .attr("d", rain_cum_line);

  rain_cum_svg.selectAll(".dot")
    .data(cr_data)
    .transition()
    .delay(function(d, i) { return i * 50; })
    .duration(1000)
    .attr("cx", function(d, i) { return rain_cum_x(d.Year) })
    .attr("cy", function(d, i) { return rain_cum_y(parseFloat(d.Rainfall)) })
    .attr("r", 3)
    .on("mouseover", rain_cum_tooltip.show)
    .on("mouseout", rain_cum_tooltip.hide)
}



d3.select("#mySlider").on("change", function() {
  yearOfView = this.value
  rain_title.text("Rainfall Distribution in year " + yearOfView + " in " + country_id_map[selected_country]);

  rainfallDataProcessing(true)

  selectedValue = this.value
  yearOfView = selectedValue
  queue()
    .defer(d3.json, "data/world_countries.json")
    .defer(d3.csv, "data/country_avg_temp.csv")
    .await(ready);
});




// Code for Rainfall graph ends here

var map_tip = d3.tip()
  .attr('class', 'd3-tip s')
  .offset(function(d) {
    if (d.properties.name === "Russia") {
      // Set tooltips
      return [-10, 200]
    } else return [-10, 0]
  })
  .html(function(d) {
    if (isNaN(d.temperature)) {
      return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Temperature: </strong><span class='details'>" +
        format(d.temperature) + "<br></span>" + "<strong>Tempertature compared to 1991: </strong><span class='details'>" + format(d.difference) + "<br></span>";
    } else {
      return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Temperature: </strong><span class='details'>" +
        format(d.temperature) + "°C <br></span>" + "<strong>Tempertature compared to 1991: </strong><span class='details'>" + format(d.difference) + "°C <br></span>";
    }
  })
var map_margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 730 - map_margin.left - map_margin.right,
  height = 600 - map_margin.top - map_margin.bottom;
var map_color = d3.scaleThreshold()
  .domain([-100, -1, -0.5, -0.1, 0, 0.1, 1, 1.5, 2, 2.5])
  .range(["rgb(255,255,255)", "rgb(66,146,198)", "rgb(123,169,201)", "rgb(198,219,239)", "rgb(250,240,230)", "rgb(255,204,153)", "rgb(255,178,102)", "rgb(255,128,0)", "rgb(255,0,0)", "rgb(204,0,0)"])
var path = d3.geoPath();
var map_svg = d3.select(".map-wrapper")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append('g')
  .attr('class', 'map');
var projection = d3.geoMercator().scale(100)
  .translate([width / 2, height / 2.1]);
var path = d3.geoPath().projection(projection);
map_svg.call(map_tip);
queue()
  .defer(d3.json, "data/world_countries.json")
  .defer(d3.csv, "data/country_avg_temp.csv")
  .await(ready);

var map_g = map_svg.append("g")
  .attr("class", "legendThreshold")
  .attr("transform", "translate(0,20)");
map_g.append("text")
  .attr("class", "caption")
  .attr("x", 0)
  .attr("y", -6)
  .text("Temperature difference (°C)");
var map_label = ['No data', '<-1', '-1~-0.5', '-0.5~-0.1', '-0.1~0.1', '0.1~0.5', '0.5~1', '1~1.5', '1.5~2', '>2'];
var map_legend = d3.legendColor()
  .labels(function(d) { return map_label[d.i]; })
  .shapePadding(4)
  .scale(map_color);
map_svg.select(".legendThreshold")
  .call(map_legend);

function filterCriteria(d) {
  return d.year === yearOfView;
}

function startTempFilter(d) {
  return d.year === '1991';
}

function ready(error, data, temperature) {
  var startTemp = temperature.filter(startTempFilter);
  var filteredTemp = temperature.filter(filterCriteria);
  var startTemps = {};
  var temperatureById = {};
  var differences = {};
  startTemp.forEach(function(d) { startTemps[d.id] = +d.temperature; })
  filteredTemp.forEach(function(d) { temperatureById[d.id] = +d.temperature; });
  data.features.forEach(function(d) { d.temperature = temperatureById[d.id] });

  startTemp.forEach(function(d) {
    if (isNaN(temperatureById[d.id])) {
      differences[d.id] = -100;
    } else {
      differences[d.id] = (temperatureById[d.id] - startTemps[d.id]).toFixed(3);
    }
  });
  data.features.forEach(function(d) { d.difference = differences[d.id] });
  map_svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", function(d) {
      if (typeof differences[d.id] === "undefined") {
        return "rgb(255,255,255)";
      } else {
        return map_color(differences[d.id]);
      }
    })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style("opacity", 0.8)
    // tooltips
    .style("stroke", "white")
    .style('stroke-width', 0.3)
    .on('mouseover', function(d) {
      if (d.geometry.coordinates[0][0][0][1] <= 0) {
        map_tip.direction('n').show(d);
      } else {
        map_tip.direction('s').show(d);
      }
      d3.select(this)
        .style("opacity", 1)
        .style("stroke", "white")
        .style("stroke-width", 3);
    })
    .on('click', function(d) {
      selected_country = d['id']
      rainfallDataProcessing(true)

    })
    .on('mouseout', function(d) {
      map_tip.hide(d);

      d3.select(this)
        .style("opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", 0.3);
    }).attr("transform", "scale(1)"); // determine if it would be better to have larger map later
  map_svg.append("path")
    .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
    .attr("class", "names")
    .attr("d", path);
}




seaLevel = {

}
// SETUP
// var data;
var svg_sea = d3.select("#vis1"),
  margin_sea = { top: 30, right: 20, bottom: 30, left: 40 },
  x = d3.scaleLinear(),
  y = d3.scaleLinear();

var bounds_sea = svg_sea.node().getBoundingClientRect(),
  width = bounds_sea.width - margin_sea.left - margin_sea.right,
  height = bounds_sea.height - margin_sea.top - margin_sea.bottom;


var g_sea = svg_sea.append("g")
  .attr("transform", "translate(" + margin_sea.left + "," + margin_sea.top + ")");

g_sea.append("g")
  .attr("class", "axis axis--x");

g_sea.append("g")
  .attr("class", "axis axis--y");

// label "Sea Level"
g_sea.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .text("Global Sea Level: GMSL");

// label "year"
g_sea.append("text")
  .attr("x", width)
  .attr("y", height - 20)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .text("Year");

// Heading
g_sea.append("text")
  .attr("x", width - 10)
  .attr("y", -10)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .style("font-size", "14px")
  .style("text-decoration", "underline")
  .text("Global Sea Level from 1994 to 2014");


d3.csv("data/sealevel.csv", function(d) {
  x.domain(d3.extent(d, function(d) { return d.Time; })); // [A, B, C, D...]
  y.domain([0, d3.max(d, function(d, i) { return d.GMSL; })]);
  draw(d);
})


function draw(d) {
  x.rangeRound([0, width]);
  y.rangeRound([height, 0]);

  g_sea.select(".axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g_sea.select(".axis--y")
    .call(d3.axisLeft(y).ticks(20));

  var line = d3.line()
    .x(function(d, i) { return x(d.Time); })
    .y(function(d, i) { return y(d.GMSL); })

  // g.data(d);
  // data = d
  g_sea.append("path")
    .datum(d)
    .attr("class", "line")
    .attr("stroke", "#FDC40D")
    .attr("stroke-width", 7)
    .attr("fill", "none")
    .attr("d", line);

  // g.selectAll(".dot")
  //     .data(d)
  //   .enter().append("circle") 
  //     .attr("class", "dot") 
  //     .attr("cx", function(d, i) { return x(d.Time) })
  //     .attr("cy", function(d, i) { return y(d.GMSL) })
  //     .attr("r", 5)

}



CO2Emissions = {

}
// set the dimensions and margins of the graph
var margin_co2 = { top: 10, right: 30, bottom: 30, left: 40 };

// append the svg object to the body of the page
var svg_co2 = d3.select("#vis2")
  .append("svg")
  .attr("width", width + margin_co2.left + margin_co2.right)
  .attr("height", height + margin_co2.top + margin_co2.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin_co2.left + "," + margin_co2.top + ")");


svg_co2.append("text")
  .attr("x", width)
  .attr("y", height - 20)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .text("Year");

svg_co2.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .text("Annual CO2 emissions by world region");

// Heading
svg_co2.append("text")
  .attr("x", width - 10)
  .attr("y", -10)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .style("font-size", "14px")
  .style("text-decoration", "underline")
  .text("CO2 Emissions from 1990 to 2018");

// svg_co2.append("text")
// .datum(function(d) {
//   return {
//     name: d.Entity,
//     value: d.values[d.values.length - 1]
//   };
// })
// .attr("transform", function(d) {
//   return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
// })
// .attr("x", 3)
// .attr("dy", ".35em")
// .text(function(d) {
//   return d.Entity;
// });

//Read the data
d3.csv("data/co-demo.csv", function(data) {

  // group the data: I want to draw one line per group
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Entity; })
    .entries(data);

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Year; }))
    .range([0, width]);
  svg_co2.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.emissions; })])
    .range([height, 0]);
  svg_co2.append("g")
    .call(d3.axisLeft(y));

  // color palette
  var res = sumstat.map(function(d) { return d.key }) // list of group names
  var color_co2 = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#EB2396', '#a65628', '#f781bf', '#999999'])

  // Draw the line
  svg_co2.selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", function(d) { return color_co2(d.key) })
    // .attr("stroke", "#63E15D")
    .attr("stroke-width", 5.5)
    .attr("d", function(d) {
      return d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(+d.emissions); })
        (d.values)
    })
  // ------------------------------------------------------
  // Legend 
  var ordinal = d3.scaleOrdinal()
    .domain(["Asia", "China", "US", "India", "South America", "North America", "Europe", "Africa"])
    .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#a65628', '#f781bf', '#ff7f00', '#EB2396']);

  svg_co2.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(40,15)");

  var legendOrdinal = d3.legendColor()
    //d3 symbol creates a path-string, for example
    //"M0,-8.059274488676564L9.306048591020996,
    //8.059274488676564 -9.306048591020996,8.059274488676564Z"
    .shape("path", d3.symbol().type(d3.symbolTriangle).size(100)())
    .shapePadding(5)
    //use cellFilter to hide the "e" cell
    .cellFilter(function(d) { return d.label !== "e" })
    .scale(ordinal);

  svg_co2.select(".legendOrdinal")
    .call(legendOrdinal);

  // var mouseG = svg_co2.append("g")
  //   .attr("class", "mouse-over-effects");
  // mouseG.append("path") // this is the black vertical line to follow mouse
  //   .attr("class", "mouse-line")
  //   .style("stroke", "black")
  //   .style("stroke-width", "1px")
  //   .style("opacity", "0");

  // var lines = document.getElementsByClassName('line');

  // var mousePerLine = mouseG.selectAll('.mouse-per-line')
  //   .data(sumstat)
  //   .enter()
  //   .append("g")
  //   .attr("class", "mouse-per-line");

  // mousePerLine.append("circle")
  //   .attr("r", 7)
  //   .style("stroke", function (d) {
  //     return color(d.name);
  //   })
  //   .style("fill", "none")
  //   .style("stroke-width", "1px")
  //   .style("opacity", "0");

  // mousePerLine.append("text")
  //   .attr("transform", "translate(10,3)");

  // mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
  //   .attr('width', width) // can't catch mouse events on a g element
  //   .attr('height', height)
  //   .attr('fill', 'none')
  //   .attr('pointer-events', 'all')
  //   .on('mouseout', function () { // on mouse out hide line, circles and text
  //     d3.select(".mouse-line")
  //       .style("opacity", "0");
  //     d3.selectAll(".mouse-per-line circle")
  //       .style("opacity", "0");
  //     d3.selectAll(".mouse-per-line text")
  //       .style("opacity", "0");
  //   })
  //   .on('mouseover', function () { // on mouse in show line, circles and text
  //     d3.select(".mouse-line")
  //       .style("opacity", "1");
  //     d3.selectAll(".mouse-per-line circle")
  //       .style("opacity", "1");
  //     d3.selectAll(".mouse-per-line text")
  //       .style("opacity", "1");
  //   })
  //   .on('mousemove', function () { // mouse moving over canvas
  //     var mouse = d3.mouse(this);
  //     d3.select(".mouse-line")
  //       .attr("d", function () {
  //         var d = "M" + mouse[0] + "," + height;
  //         d += " " + mouse[0] + "," + 0;
  //         return d;
  //       });

  //     d3.selectAll(".mouse-per-line")
  //       .attr("transform", function (d, i) {
  //         console.log(width / mouse[0])
  //         var xDate = x.invert(mouse[0]),
  //           bisect = d3.bisector(function (d) { return d.key; }).right;
  //         idx = bisect(d.values, xDate);

  //         var beginning = 0,
  //           end = lines[i].getTotalLength(),
  //           target = null;

  //         while (true) {
  //           target = Math.floor((beginning + end) / 2);
  //           pos = lines[i].getPointAtLength(target);
  //           if ((target === end || target === beginning) && pos.x !== mouse[0]) {
  //             break;
  //           }
  //           if (pos.x > mouse[0]) end = target;
  //           else if (pos.x < mouse[0]) beginning = target;
  //           else break; //position found
  //         }

  //         d3.select(this).select('text')
  //           .text(y.invert(pos.y).toFixed(2));

  //         return "translate(" + mouse[0] + "," + pos.y + ")";
  //       });
  //   })
})