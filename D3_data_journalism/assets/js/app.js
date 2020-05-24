// Boiler plate margin code
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Declare a dafault x and y axis to show
// Chosen axis will change based on selections
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";

/*
Functions for updating 
(1) xScales,
(2) yScales,
(2) xAxis,
(3) yAxis,
(4) circles group,
(5) circles with tool tip
*/

// (1) function used for updating x-scale var upon click on axis label
function xScale(newsData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(newsData, d => d[chosenXAxis]) * 0.8,
      d3.max(newsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]); // x scale needs width

  return xLinearScale;

}

// (2) function used for updating y-scale var upon click on axis label
function yScale(newsData, chosenYAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(newsData, d => d[chosenYAxis]) * 0.8,
      d3.max(newsData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]); // y scale needs height

  return xLinearScale;

}

// (3) function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// (4) function used for updating xAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var bottomAxis = d3.axisLeft(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// (5) function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// (6) function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "% Poverty:";
  }
  else {
    label = "Age: Median";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}



// Extract data from CSV
(async function(){
    var newsData = await d3.csv("assets/data/data.csv").catch(function(error) {
      console.log(error);
    });
    // Print the tvData
    console.log(newsData);

    // Parse data and cast elements
    // Check Chrome Dev for live update
    newsData.forEach(function(d) {
        d.smokes = +d.smokes;
        d.poverty = +d.poverty;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(newsData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(newsData, chosenYAxis);
    
    // Create initial axis functions - (bp)
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis - (review)
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
    .call(leftAxis);

    // append initial circles - (review)
    var circlesGroup = chartGroup.selectAll("circle")
    .data(newsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis])) // - (r.here)
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

    // Create group for two x-axis labels
    // Creating this group makes transforming easier
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Poverty is an x-label
    var xLabelPoverty = xLabelsGroup.append("text")
    .attr("x", 0) // x stays put for x axis
    .attr("y", 20) // y positive is moving down 20 pixels
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("% Poverty");

    // Smoking is a y-label
    var xLabelAge = xLabelsGroup.append("text")
    .attr("x", 0) // x stays put
    .attr("y", 40) // y moves down additional 20
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");


    // append y axis labels - (review)
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)"); // rotation for y-axis

    // append y axis labels - (review)
    var yLabelSmoking = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left) // - (r.here)
    .attr("x", 0 - (height / 2))
    .attr("value", "age") // value to grab for event listener
    .attr("dy", "1em")
    .classed("active", true)
    .text("Smokers (%)");

  })()
