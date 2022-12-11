import * as d3 from 'd3';

class OverviewComponent {

  mapContainer;
  barContainer;
  mapCanvas;
  barCanvases;
  props;

  constructor(mapContainer, barContainer, props) {
    console.log("nooo");
    this.mapContainer = mapContainer;
    this.barContainer = barContainer;
    this.props = props;

    console.log(typeof (d3.select(mapContainer)));
    console.log(d3.select(mapContainer))
    d3.select(mapContainer).selectAll("*").remove();

    this.mapCanvas = d3.select(mapContainer)
      .append('div')
      // contianer class
      .classed('svg-container', true)
      .append("svg")
      // attributes needed for no arbitrary width and height
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 1000 400")
      // Class to make it responsive.
      .classed("svg-content-responsive", true);
    this.barCanvases = d3.select(barContainer);


    this.initMap();
    this.initOverview();
  }

  initMap = () => {
    const { mapCanvas, props: { geodata } } = this;
    const gmap = mapCanvas.append("g");

    // map dimension
    const width = 1000;
    const height = 400;
    const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
    const pathGenerator = d3.geoPath().projection(projection);
    const colorScale = d3.scaleLinear().domain([0, 10]).range(["#81e3ff", "#81e3ff"]);

    // map attributes
    gmap.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('stroke', 'black')
      .attr('fill', '#69a3b2')
      .attr("id", "bgmap")
      .attr('z-index', '0');

    gmap.selectAll(".country")
      .data(geodata.features)
      .join("path")
      .on("click", (event, feature) => {
        this.props.setHoveredCountry(feature.properties.brk_name)
      })
      .on("mouseout", (event, feature) => {
        this.props.setHoveredCountry(null)
      })
      .on("mouseover", (event, feature) => {
        this.props.setHoveredCountry(feature.properties.brk_name)
      })
      .attr("class", "country")
      .transition()
      .duration(1000)
      .attr("stroke-width", 0.3)
      .attr('z-index', '100')
      .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
      .attr("d", feature => pathGenerator(feature))
      .attr("stroke", feature => "#262626");

    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height + 105]])
      .on("zoom", function (event) {
        d3.select('#overview-map svg g').attr("transform", event.transform)
      })
    gmap.call(zoom);
  }

  initOverview = () => {
    const { props: { aggcounts, aggcountssort, levelcounts, statuscounts } } = this;
    var { props: { setHoveredCountry } } = this;
    const barCanvases = d3.selectAll(".graph");
    var aggArr = [];
    Object.values(aggcountssort).forEach(function (data) {
      aggArr.push(data);
    });
    console.log("woo");
    console.log(aggArr);

    // define the scales
    var width = 1600,
      height = 200,
      margintop = 50,
      marginleft = 70;

    // all countries
    const countries = Object.keys(aggcounts);
    var sortX = this.sortX;

    barCanvases.each(function (d, i) {
      const barCanvas = d3.select(this);
      barCanvas.selectAll("*").remove();
      const barSVG = barCanvas.append('svg')
        .attr('height', '100%')
        .attr('width', '100%');
      const gbar = barSVG.append("g");

      gbar.append("g").attr("id", "xax");
      gbar.append("g").attr("id", "yax");
      const xax = gbar.select("#xax");
      const yax = gbar.select("#yax");

      // The barchart panels
      gbar.append('rect')
        .attr('x', "0")
        .attr('y', "0")
        .attr("id", "bgbar")
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('stroke', 'black')
        .attr('fill', '#d0e7fd')
        .attr('z-index', '0');

      // define x-axis
      var xScale = d3.scaleBand()
        .range([0, width])
        .domain(aggArr.map(function (d) {
          return d.country;
        }))
        .padding(0.2)

      // scale x-axis
      xax
        .call(d3.axisBottom(xScale))
        .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
        .selectAll("text")
        .attr("type", "xaxval")
        .attr('text-align', "center")
        .attr("transform", "translate(-10,0)rotate(-90)")
        .style("text-anchor", "end");

      d3.select("#xax").selectAll(".tick").nodes().forEach((xVal) => {
        var xValName = d3.select(xVal).data()[0]
        //console.log(xVal)
        //console.log(xValName)
        d3.select(xVal)
          .on("mouseover", (event) => {
            setHoveredCountry(xValName);
          }).on("mouseout", (event) => {
            setHoveredCountry(null);
          });
      });

      // calculate max values
      var maxH = 0;
      if (i === 0) { // wastewater discharge
        maxH = d3.max(aggArr, function (d) {
          return d.WASTE_DIS_mean;
        });
      } else if (i === 1) { // river discharge
        maxH = d3.max(aggArr, function (d) {
          return d.RIVER_DIS_mean;
        });
      } else if (i === 2) { // dilution factor
        maxH = d3.max(aggArr, function (d) {
          return d.DF_mean;
        });
      } else if (i === 3) { // design capacity
        maxH = d3.max(aggArr, function (d) {
          return d.DESIGN_CAP_mean;
        });
      } else if (i === 4) { // population served
        maxH = d3.max(aggArr, function (d) {
          return d.POP_SERVED_mean;
        });
      } else if (i === 5) { // level
        countries.forEach((country) => {
          try {
            for (const [key, value] of Object.entries(levelcounts[country])) {
              maxH = Math.max(maxH, value);
            }
          } catch { }
        })
      } else if (i === 6) { // status
        countries.forEach((country) => {
          try {
            for (const [key, value] of Object.entries(statuscounts[country])) {
              maxH = Math.max(maxH, value);
            }
          } catch { }
        })
      }

      // define y-axis
      var yScale = d3.scaleLinear()
        .domain([0, maxH])
        .range([height, 0]);

      // scale y-axis
      yax
        .attr("transform", "translate(" + marginleft + "," + margintop + ")")
        .call(d3.axisLeft(yScale));

      barSVG.selectAll("rect:not(#bgbar)").remove();

      // draw bars
      if ((i === 0) || (i === 1) || (i === 2) || (i === 3) || (i === 4)) {
        gbar.selectAll("bar")
          .data(countries)
          .enter()
          .append("rect")
          .attr("type", "barchartbar")
          .attr("class", "littlebar")
          .attr("transform", "translate(" + marginleft + "," + margintop + ")")
          .attr("x", function (d) {
            return xScale(d);
          })
          .attr("y", function (d) {
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.WASTE_DIS_mean
            } else if (i === 1) {
              val = aggcount.RIVER_DIS_mean
            } else if (i === 2) {
              val = aggcount.DF_mean
            } else if (i === 3) {
              val = aggcount.DESIGN_CAP_mean
            } else if (i === 4) {
              val = aggcount.POP_SERVED_mean
            }
            return yScale(val);
          })
          .attr("width", xScale.bandwidth())
          .attr("height", function (d) {
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.WASTE_DIS_mean
            } else if (i === 1) {
              val = aggcount.RIVER_DIS_mean
            } else if (i === 2) {
              val = aggcount.DF_mean
            } else if (i === 3) {
              val = aggcount.DESIGN_CAP_mean
            } else if (i === 4) {
              val = aggcount.POP_SERVED_mean
            }
            return height - yScale(val);
          })
          .attr("fill", function (d) {
            return "#69b3a2"
          }).on("mouseout", (event, feature) => {
            setHoveredCountry(null);
          })
          .on("mouseover", (event, feature) => {
            setHoveredCountry(feature);
          });
      } else if (i === 5) {
        var levelSubgroups = ["Primary", "Secondary", "Advanced"]
        var xLevelSubgroups = d3.scaleBand()
          .domain(levelSubgroups)
          .range([0, xScale.bandwidth()])
          .padding([0.05])

        var levelColors = d3.scaleOrdinal()
          .domain(levelSubgroups)
          .range(['#e41a1c', '#377eb8', '#4daf4a'])

        gbar.append("g").selectAll("g")
          .data(countries)
          .enter()
          .append("g")
          .attr("transform", function (d) {
            return ("translate(" + (marginleft + xScale(d)) + "," + margintop + ")")
          })
          .selectAll("rect")
          .data(function (d) {
            var newdata = []
            levelSubgroups.forEach((group) => {
              newdata.push([d, group])
            })
            return newdata;
          })
          .enter()
          .append("rect")
          .attr("type", "barchartbar")
          .attr("x", function (d) {
            return xLevelSubgroups(d[1]);
          })
          .attr("y", function (d) {
            try {
              if (d[1] in levelcounts[d[0]]) {
                return yScale(levelcounts[d[0]][d[1]]);
              } else {
                return 0;
              }
            } catch { }
          })
          .attr("width", xLevelSubgroups.bandwidth())
          .attr("height", function (d) {
            try {
              if (d[1] in levelcounts[d[0]]) {
                return height - yScale(levelcounts[d[0]][d[1]]);
              } else {
                return 0;
              }
            }
            catch { }
          })
          .attr("fill", function (d) {
            return levelColors(d);
          })

        // legend and names
        var size = 10
        gbar.selectAll("legend")
          .data(levelSubgroups)
          .enter()
          .append("rect")
          .attr("x", 50)
          .attr("y", function (d, i) { return 50 + i * (size + 5) }) // 50 is where the first dot appears. (size + 5) is the distance between dots
          .attr("width", size)
          .attr("height", size)
          .style("fill", function (d) { return levelColors(d) })
          .attr("transform", "translate(500,-10)")
        gbar.selectAll("legendname")
          .data(levelSubgroups)
          .enter()
          .append("text")
          .attr("x", 100 + size * 1.2)
          .attr("y", function (d, i) { return 50 + i * (size + 5) + (size / 2) })
          .style("fill", function (d) { return levelColors(d) })
          .text(function (d) { return d })
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .attr("transform", "translate(350,-10)")
      } else if (i === 6) {
        var statusSubgroups = ['Not Reported', 'Closed', 'Projected', 'Operational',
          'Decommissioned', 'Under Construction', 'Non-Operational',
          'Construction Completed', 'Proposed']
        var xStatusSubgroups = d3.scaleBand()
          .domain(statusSubgroups)
          .range([0, xScale.bandwidth()])
          .padding([0.05])

        var colStatus = d3.scaleOrdinal()
          .domain(statusSubgroups)
          .range(['#587c7c', '#003f5e', '#007c84', '#e8d666', '#9ea615', '#bbe0ce', '#fedcc1', '#f7a08c', '#f1573f'])

        gbar.append("g").selectAll("g")
          .data(countries)
          .enter()
          .append("g")
          .attr("transform", function (d) {
            return ("translate(" + (marginleft + xScale(d)) + "," + margintop + ")")
          })
          .selectAll("rect")
          .data(function (d) {
            var newdata = []
            statusSubgroups.forEach((group) => {
              newdata.push([d, group])
            })
            return newdata;
          })
          .enter()
          .append("rect")
          .attr("type", "barchartbar")
          .attr("x", function (d) {
            return xStatusSubgroups(d[1]);
          })
          .attr("y", function (d) {
            try {
              if (d[1] in statuscounts[d[0]]) {
                return yScale(statuscounts[d[0]][d[1]]);
              } else {
                return 0;
              }
            } catch { }
          })
          .attr("width", xStatusSubgroups.bandwidth())
          .attr("height", function (d) {
            try {
              if (d[1] in statuscounts[d[0]]) {
                return height - yScale(statuscounts[d[0]][d[1]]);
              } else {
                return 0;
              }
            }
            catch { }
          })
          .attr("fill", function (d) {
            return colStatus(d);
          })
      }

      var sorting = null;
      if (i === 0) {
        sorting = function (a, b) {
          return d3.descending(a.WASTE_DIS_mean, b.WASTE_DIS_mean);
        }
        sortX("#byValue", aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height);
      } else if (i === 1) {
        sorting = function (a, b) {
          return d3.descending(a.RIVER_DIS_mean, b.RIVER_DIS_mean);
        }
        sortX("#byValue1", aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height);
      } else if (i === 2) {
        sorting = function (a, b) {
          return d3.descending(a.DF_mean, b.DF_mean);
        }
        sortX("#byValue2", aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height);
      } else if (i === 3) {
        sorting = function (a, b) {
          return d3.descending(a.DESIGN_CAP_mean, b.DESIGN_CAP_mean);
        }
        sortX("#byValue3", aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height);
      } else if (i === 4) {
        sorting = function (a, b) {
          return d3.descending(a.POP_SERVED_mean, b.POP_SERVED_mean);
        }
        sortX("#byValue4", aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height);
      }
    });
  }

  sortX = (tagName, aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height) => {
    d3.select(tagName).on("click", function () {
      console.log(tagName);
      aggArr.sort(sorting)
      console.log(aggArr)
      xScale.domain(aggArr.map(function (d) {
        return d.country;
      }));
      gbar.selectAll(".littlebar")
        .transition()
        .duration(1000)
        .attr("x", function (d, i) {
          return xScale(d);
        })
      // scale x-axis
      xax
        .call(d3.axisBottom(xScale))
        .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
        .selectAll("text")
        .attr("type", "xaxval")
        .attr('text-align', "center")
        .attr("transform", "translate(-10,0)rotate(-90)")
        .style("text-anchor", "end");
    });
  }

  highlightCountry = (hoveredCountry) => {
    var bars = document.querySelectorAll("[type=barchartbar]");
    var xaxvals = document.querySelectorAll("[type=xaxval]");
    var countries = document.getElementsByClassName("country");

    if (hoveredCountry) {
      console.log(hoveredCountry);

      // hilight bars
      [...bars].forEach((bar) => {
        var country = d3.select(bar).data()[0];
        if (country === hoveredCountry) {
          bar.style.filter = "brightness(50%)";
        } else {
          bar.style.filter = "brightness(100%)";
        }
      });

      // hilight the axis name
      xaxvals.forEach((val) => {
        var country = d3.select(val).data()[0];
        if (country === hoveredCountry) {
          val.style.color = "#04290e";
          val.style.fontWeight = "900";
        } else {
          val.style.color = "black";
          val.style.fontWeight = "20";
        }
      });

      // hilight the map
      [...countries].forEach((c) => {
        var countryData = d3.select(c).data();
        var country = countryData[0].properties.brk_name;
        if (country === hoveredCountry) {
          c.style.filter = "brightness(80%)";
          // connect(c, countryBar, "red", 10)
        } else {
          c.style.filter = "brightness(100%)";
        }
      })
    }
  }

  resize = (width, height) => {
    const { mapCanvas } = this;
    mapCanvas.selectAll("*").remove();
    const barCanvases = d3.selectAll(".graph");
    barCanvases.each(function (d, i) {
    });
  }
}

export default OverviewComponent;
