// Set svg space wit margins
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
(5) updates circles by x axis
(6) updates circles by y axis
(7) render state names
(8) circles with tool tip
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
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// (4) function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// (5) function used for updating X circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// (6) function used for updating Y circles group with a transition to
// new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// (7) function used for updating state names
function renderAbbr(abbrGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  abbrGroup.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]))
  .attr("y", d => newYScale(d[chosenYAxis]) + 2)
  .attr("text-anchor", "middle");
}

// (8) function used for updating circles group with new tooltip - (review)
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Age (Median):";
  }
  else {
    xLabel = "Income (Median):";
  }

  var yLabel;

  if (chosenYAxis === "smokes") {
    yLabel = "Smokers (%):";
  }
  if (chosenYAxis === "obesity") {
    yLabel = "Obesity (%):";
  }
  else {
    yLabel = "Healthcare (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-20, -20])
    .html(function(d) {
      return (`${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
  .on("mouseover", function(data) {
    toolTip.show(data, this);
  })

  // onmouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

  // Console log chosen labels
  console.log('--- Chosen Labels ---') // <--- rm
  console.log(xLabel);
  console.log(yLabel);

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
      // x axis data
      d.smokes = +d.smokes;
      d.obesity = +d.obesity;
      d.healthcare = +d.healthcare;
      // y axist data
      d.age = +d.age;
      d.poverty = +d.poverty;
      d.income = +d.income;
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
  var yAxis = chartGroup.append("g")
  .call(leftAxis);

  // append initial circles - (review)
  var circlesGroup = chartGroup.selectAll("circle")
  .data(newsData)
  .enter()
  .append("circle")
  .attr("class", "stateCircle")
  .attr("cx", d => xLinearScale(d[chosenXAxis])) // - (r.here)
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 10)
  .attr("opacity", ".9");

  // append initial states
  var abbrGroup = chartGroup.selectAll("circles")
    .data(newsData)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .text(d => d.abbr)
    .attr("font-size", "8px")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 2)
    .attr("text-anchor", "middle");

  /*
  This begins the appending and creation of xLabel elements
  */
  
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

  // Age is an x-label
  var xLabelAge = xLabelsGroup.append("text")
  .attr("x", 0) // x stays put for x axis
  .attr("y", 40) // y positive is moving down 20 pixels
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");

  // Age is an x-label
  var xLabelIncome = xLabelsGroup.append("text")
  .attr("x", 0) // x stays put for x axis
  .attr("y", 60) // y positive is moving down 20 pixels
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

  /*
  Below begins the appending and creation of yLabel elements
  */

  // append y axis labels - (review)
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)"); // rotation for y-axis

  // Smokes is an yLabel
  var yLabelSmokes = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left) // - (r.here)
  .attr("x", 0 - (height / 2))
  .attr("value", "smokes") // value to grab for event listener
  .attr("dy", "1em")
  .classed("active", true)
  .text("Smokes (%)");

  // Obesity is an yLabel
  var yLabelObesity = yLabelsGroup.append("text")
  .attr("y", 20 - margin.left) // - (r.here)
  .attr("x", 0 - (height / 2))
  .attr("value", "obesity") // value to grab for event listener
  .attr("dy", "1em")
  .classed("inactive", true)
  .text("Obesity (%)");

  // Healthcare is an yLabel
  var yLabelHealthcare = yLabelsGroup.append("text")
  .attr("y", 40 - margin.left) // - (r.here)
  .attr("x", 0 - (height / 2))
  .attr("value", "healthcare") // value to grab for event listener
  .attr("dy", "1em")
  .classed("inactive", true)
  .text("Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    
    console.log(`CLicked value is: ${value}`); // <--- rm

    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(newsData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // update Abbr
      renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      // changes xAxis classes to change bold text
      if (chosenXAxis === "poverty") {
        xLabelPoverty // active
          .classed("active", true)
          .classed("inactive", false);
        xLabelAge
          .classed("active", false)
          .classed("inactive", true);
        xLabelIncome
        .classed("active", false)
        .classed("inactive", true);
      }
      else if (chosenXAxis === "age") {
        xLabelPoverty
          .classed("active", false)
          .classed("inactive", true);
        xLabelAge // active
          .classed("active", true)
          .classed("inactive", false);
        xLabelIncome
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        xLabelPoverty
          .classed("active", false)
          .classed("inactive", true);
        xLabelAge
          .classed("active", false)
          .classed("inactive", true);
        xLabelIncome // active
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
  // y axis labels event listener - (review)
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");

    console.log(`CLicked value is: ${value}`); // <--- rm

    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value which
      // was declared during yLabel declarations in classed
      chosenYAxis = value; // <-- (r.here)

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(newsData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // update Abbr
      renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      // changes yAxis classes to change bold text
      if (chosenYAxis === "smokes") {
        yLabelSmokes // active
          .classed("active", true)
          .classed("inactive", false);
        yLabelObesity
          .classed("active", false)
          .classed("inactive", true);
        yLabelHealthcare
        .classed("active", false)
        .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        yLabelSmokes
          .classed("active", false)
          .classed("inactive", true);
        yLabelObesity // active
          .classed("active", true)
          .classed("inactive", false);
        yLabelHealthcare
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        yLabelSmokes
          .classed("active", false)
          .classed("inactive", true);
        yLabelObesity
          .classed("active", false)
          .classed("inactive", true);
        yLabelHealthcare // active
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
})()
