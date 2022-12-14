import * as d3 from 'd3';

class OverviewComponent {

  mapContainer;
  barContainer;
  mapCanvas;
  barCanvases;
  props;

  constructor(mapContainer, barContainer, props) {
    this.mapContainer = mapContainer;
    this.barContainer = barContainer;
    this.props = props;

    d3.select(mapContainer).selectAll("*").remove();

    this.mapCanvas = d3.select(mapContainer)
      .append('div')
      // contianer class
      .classed('svg-container', true)
      .append("svg")
      // attributes needed for no arbitrary width and height
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 720 550")
      // Class to make it responsive.
      .classed("svg-content-responsive", true);

    this.barCanvases = d3.select(barContainer);

    this.initMap();
    this.initOverview();
  }

  onCountryClick2 = (event, feature) => {
    var a = document.getElementById("countriesStr").innerHTML.indexOf("(");
    var b = document.getElementById("countriesStr").innerHTML.indexOf("/10");
    var count = parseInt(document.getElementById("countriesStr").innerHTML.slice(a + 1, b))
    // setSelectedCountry(feature);
    if (count <= 9) {
      this.props.setSelectedCountriesStrings(oldstrings => new Set([...oldstrings, feature]));
      var copy = this.props.selectedCountriesCounts;
      if (!(feature in copy)) {
        copy[feature] = true;
      }
      // setSelectedCountriesCounts(copy);
    }
  }

  onCountryClick = (event, feature) => {
    var a = document.getElementById("countriesStr").innerHTML.indexOf("(");
    var b = document.getElementById("countriesStr").innerHTML.indexOf("/10");
    var count = parseInt(document.getElementById("countriesStr").innerHTML.slice(a + 1, b))
    this.props.setSelectedCountry(feature);
    if (count <= 9) {
      this.props.setSelectedCountriesStrings(oldstrings => new Set([...oldstrings, feature.properties.brk_name]));
      var copy = this.props.selectedCountriesCounts;
      if (!(feature.properties.brk_name in copy)) {
        copy[feature.properties.brk_name] = true;
      }
      this.props.setSelectedCountriesCounts(copy);
    }
    this.props.setHoveredCountry(feature.properties.brk_name);
  }

  componentDidUpdate = () => {
    var countriesStr = document.getElementById("countriesStr")
    countriesStr.innerHTML = (this.getAndUpdateCountries(this.props.selectedCountriesStrings, this.props.selectedCountriesCounts, this.props.selectedCountry));
  }

  initMap = () => {
    const { mapCanvas, props: { geodata }, props } = this;
    const gmap = mapCanvas.append("g");

    // map dimension
    const width = 720;
    const height = 550;
    const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
    const pathGenerator = d3.geoPath().projection(projection);
    const colorScale = d3.scaleLinear().domain([0, 10]).range(["#56B4E9", "#56B4E9"]);

    // map attributes
    gmap.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('stroke', 'black')
      .attr('fill', '#9ad6e6')
      .attr("id", "bgmap")
      .attr('z-index', '0')
      .attr("transform", "translate(0, 0)");

    gmap.selectAll(".country")
      .data(geodata.features)
      .join("path")
      .on("click", (event, feature) => {
        this.props.setHoveredCountry(feature.properties.brk_name)
        this.onCountryClick(event, feature)
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
      .attr("stroke-width", function (feature) {
        if (props.selectedCountriesStrings.has(feature.properties.brk_name)) {
          return (2.0)
        } else {
          return (0.3)
        }
      })
      .attr("stroke", function (feature) {
        if (props.selectedCountriesStrings.has(feature.properties.brk_name)) {
          return ("#D55E00")
        } else {
          return ("#262626")
        }
      })
      .attr('z-index', '100')
      .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
      .attr("d", feature => pathGenerator(feature))

    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", function (event) {
        d3.select('#overview-side svg g').attr("transform", event.transform)
      })
    gmap.call(zoom);

    d3.select("#reset").on("click", function () {
      console.log("reset");
      gmap.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });
    this.highlightSelected(this.props.selectedCountriesStrings);
  }

  initOverview = () => {
    const { props: { aggcounts, aggcountssort, levelcounts, statuscounts } } = this;
    var { props: { setHoveredCountry } } = this;

    const countries = Object.keys(aggcounts);
    var sortX = this.sortX;
    var truncate = this.truncate;

    // cross page linking
    var onCountryClick2 = this.onCountryClick2;
    var getAndUpdateCountries = this.getAndUpdateCountries;
    var countriesStr = document.getElementById("countriesStr")
    countriesStr.innerHTML = (getAndUpdateCountries(this.props.selectedCountriesStrings, this.props.selectedCountriesCounts, this.props.selectedCountry));

    const barCanvases = d3.selectAll(".graph");
    // convert to an array
    var aggArr = [];
    Object.values(aggcountssort).forEach(function (data) {
      aggArr.push(data);
    });

    console.log("My arr!!");
    console.log(aggArr);
    console.log(aggcounts);
    // define the scales for each bar chart
    var width = 1500,
      height = 100,
      margintop = 10,
      marginleft = 72;

    // draw each bar chart
    barCanvases.each(function (d, i) {
      const barCanvas = d3.select(this);
      barCanvas.selectAll("*").remove();
      const barSVG = barCanvas.append('svg')
        .attr('height', '100%')
        .attr('width', '100%');
      const gbar = barSVG.append("g")
        .attr('width', width)
        .attr('height', height);

      // the barchart panel
      gbar.append('rect')
        .attr('x', "0")
        .attr('y', "0")
        .attr("id", "bgbar")
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('stroke', 'black')
        .attr('fill', '#d0e7fd')
        .attr('z-index', '0');

      // the components for axis
      gbar.append("g").attr("id", "xax");
      gbar.append("g").attr("id", "yax");
      const xax = gbar.select("#xax");
      const yax = gbar.select("#yax");

      // calculate max values
      var maxH = 0;
      if (i === 0) { // wastewater discharge
        maxH = d3.max(aggArr, function (d) {
          return d.DF_mean;
        });
      } else if (i === 1) { // river discharge
        maxH = d3.max(aggArr, function (d) {
          return d.WASTE_DIS_mean;
        });
      } else if (i === 2) { // dilution factor
        maxH = d3.max(aggArr, function (d) {
          return d.RIVER_DIS_mean;
        });
      } else if (i === 3) { // design capacity
        maxH = d3.max(aggArr, function (d) {
          return d.POP_SERVED_mean;
        });
      } else if (i === 4) { // population served
        maxH = d3.max(aggArr, function (d) {
          return d.DESIGN_CAP_mean;
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

      // define x-axis scale
      var xScale = d3.scaleBand()
        .range([0, width])
        .domain(aggArr.map(function (d) {
          return truncate(d.country, 14);
        }))
        .padding(0.2);

      // define y-axis scale
      var yScale = d3.scaleLinear()
        .domain([0, maxH])
        .range([height, 0]);

      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      // draw x-axis
      xax.attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
        .call(xAxis)
        // labels
        .selectAll("text")
        .attr("type", "xaxval")
        .attr('text-align', "center")
        .attr("transform", "translate(-10,0)rotate(-90)")
        .style("text-anchor", "end");

      // TODO: mouse events of axis
      d3.select("#xax").selectAll(".tick").nodes().forEach((xVal) => {
        var xValName = d3.select(xVal).data()[0]
        d3.select(xVal)
          .on("mouseover", (event) => {
            setHoveredCountry(xValName);
          }).on("mouseout", (event) => {
            setHoveredCountry(null);
          });
      });

      // draw y-axis
      yax.attr("transform", "translate(" + marginleft + "," + margintop + ")")
        .call(yAxis);

      // draw bars
      if ((i === 0) || (i === 1) || (i === 2) || (i === 3) || (i === 4)) {
        gbar.selectAll("bar")
          .data(countries)
          .enter()
          .append("rect")
          .attr("type", "barchartbar")
          .attr("class", function (d) {
            return d.split(' ').join('') + " littlebar";
          })
          .attr("transform", "translate(" + marginleft + "," + margintop + ")")
          .attr("x", function (d) {
            return xScale(truncate(d, 14));
          })
          .attr("y", function (d) {
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.DF_mean;
            } else if (i === 1) {
              val = aggcount.WASTE_DIS_mean;
            } else if (i === 2) {
              val = aggcount.RIVER_DIS_mean;
            } else if (i === 3) {
              val = aggcount.POP_SERVED_mean;
            } else if (i === 4) {
              val = aggcount.DESIGN_CAP_mean;
            }
            return yScale(val);
          })
          .attr("width", xScale.bandwidth())
          .attr("height", function (d) {
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.DF_mean;
            } else if (i === 1) {
              val = aggcount.WASTE_DIS_mean;
            } else if (i === 2) {
              val = aggcount.RIVER_DIS_mean;
            } else if (i === 3) {
              val = aggcount.POP_SERVED_mean;
            } else if (i === 4) {
              val = aggcount.DESIGN_CAP_mean;
            }
            return height - yScale(val);
          })
          .attr("yValue", function (d) {
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.DF_mean;
            } else if (i === 1) {
              val = aggcount.WASTE_DIS_mean;
            } else if (i === 2) {
              val = aggcount.RIVER_DIS_mean;
            } else if (i === 3) {
              val = aggcount.POP_SERVED_mean;
            } else if (i === 4) {
              val = aggcount.DESIGN_CAP_mean;
            }
            return val;
          })
          .attr("fill", function (d) {
            return "#009E73"
          }).on("mouseout", (event, feature) => {
            setHoveredCountry(null);
          })
          .on("mouseover", (event, feature) => {
            setHoveredCountry(feature);
          }).on("click", function (event, d) {
            console.log(d);
            onCountryClick2(event, d);
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

      // add sorting
      var sorting = null;
      var sortingKey = function (a, b) {
        return d3.ascending(a.country, b.country);
      };
      if (i === 0) {
        sorting = function (a, b) {
          return d3.descending(a.DF_mean, b.DF_mean);
        };
        sortX("#byValue", aggArr, sorting, xScale, gbar, xax, xAxis, truncate);
        sortX("#byKey", aggArr, sortingKey, xScale, gbar, xax, xAxis, truncate);
      } else if (i === 1) {
        sorting = function (a, b) {
          return d3.descending(a.WASTE_DIS_mean, b.WASTE_DIS_mean);
        };
        sortX("#byValue1", aggArr, sorting, xScale, gbar, xax, xAxis, truncate);
        sortX("#byKey1", aggArr, sortingKey, xScale, gbar, xax, xAxis, truncate);
      } else if (i === 2) {
        sorting = function (a, b) {
          return d3.descending(a.RIVER_DIS_mean, b.RIVER_DIS_mean);
        };
        sortX("#byValue2", aggArr, sorting, xScale, gbar, xax, xAxis, truncate);
        sortX("#byKey2", aggArr, sortingKey, xScale, gbar, xax, xAxis, truncate);
      } else if (i === 3) {
        sorting = function (a, b) {
          return d3.descending(a.POP_SERVED_mean, b.POP_SERVED_mean);
        }
        sortX("#byValue3", aggArr, sorting, xScale, gbar, xax, xAxis, truncate);
        sortX("#byKey3", aggArr, sortingKey, xScale, gbar, xax, xAxis, truncate);
      } else if (i === 4) {
        sorting = function (a, b) {
          return d3.descending(a.DESIGN_CAP_mean, b.DESIGN_CAP_mean);
        };
        sortX("#byValue4", aggArr, sorting, xScale, gbar, xax, xAxis, truncate);
        sortX("#byKey4", aggArr, sortingKey, xScale, gbar, xax, xAxis, truncate);
      }

      // zoom the bar charts
      const extent = [[0, 0], [width, height]];

      var zoomed = (event) => {
        // zoom the x-axis
        const xrange = [0, width].map(d => event.transform.applyX(d));
        xScale.range(xrange);
        // zoom the y-axis
        var newMaxH = 0;
        gbar.selectAll(".littlebar")
          .filter(function () {
            return d3.select(this).attr("x") >= 0 && d3.select(this).attr("x") <= 1500; // filter by single value
          })
          .nodes().forEach((b) => {
            var val = d3.select(b).attr("yValue");
            const yVal = +val;
            newMaxH = Math.max(newMaxH, yVal);
          });
        yScale.domain([0, newMaxH])
          .range([height, 0]);
        // re-draw
        gbar.selectAll(".littlebar")
          .transition()
          .duration(1)
          .attr("x", function (d, i) {
            return xScale(truncate(d, 14));
          })
          .attr("width", xScale.bandwidth())
          .attr("y", function (d) {
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.DF_mean;
            } else if (i === 1) {
              val = aggcount.WASTE_DIS_mean;
            } else if (i === 2) {
              val = aggcount.RIVER_DIS_mean;
            } else if (i === 3) {
              val = aggcount.POP_SERVED_mean;
            } else if (i === 4) {
              val = aggcount.DESIGN_CAP_mean;
            }
            return yScale(val);
          }).attr("height", function (d) {
            if (xScale(truncate(d, 14)) < 0 || xScale(truncate(d, 14)) > 1500) {
              return 0;
            }
            var val = 0;
            var aggcount = aggcounts[d];
            if (i === 0) {
              val = aggcount.DF_mean;
            } else if (i === 1) {
              val = aggcount.WASTE_DIS_mean;
            } else if (i === 2) {
              val = aggcount.RIVER_DIS_mean;
            } else if (i === 3) {
              val = aggcount.POP_SERVED_mean;
            } else if (i === 4) {
              val = aggcount.DESIGN_CAP_mean;
            }
            return height - yScale(val);
          });
        xax.call(xAxis.scale(xScale));
        yax.call(yAxis.scale(yScale));
      };

      var barZoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed);

      gbar.call(barZoom); //.on("mousedown.zoom", null);
    });
  }

  truncate = (str, length) => {
    if (str.length > length) {
      const regex1 = /\(/;
      const regex2 = /\)/;
      const i1 = str.search(regex1);
      const i2 = str.search(regex2);
      if (i1 !== -1 && i2 !== -1) {
        return str.substring(i1 + 1, i2);
      } else {
        return str.slice(0, length);
      }
    } else return str;
  }

  sortX = (tagName, aggArr, sorting, xScale, gbar, xax, xAxis, truncate) => {
    d3.select(tagName).on("click", function () {
      aggArr.sort(sorting)
      xScale.domain(aggArr.map(function (d) {
        return truncate(d.country, 14);
      }));
      gbar.selectAll(".littlebar")
        .transition()
        .duration(50)
        .attr("x", function (d, i) {
          return xScale(truncate(d, 14));
        });
      // re-draw
      xax.call(xAxis.scale(xScale));
    });
  }

  getAndUpdateCountries = (countriesStrings, countryCounts, country) => {
    if (country) {
      if (countryCounts[country.properties.brk_name] === true) {
        countryCounts[country.properties.brk_name] = false
      } else if (countryCounts[country.properties.brk_name] === false) {
        countriesStrings.delete(country.properties.brk_name)
        delete countryCounts[country.properties.brk_name];
      }
    }

    var countryStringsSet = new Set(countriesStrings);
    var setcount = countryStringsSet.size;
    if (setcount >= 11) {
      this.props.setMaxCount(true);
    }

    var str = "Selected Countries (" + setcount + "/10): "
    countryStringsSet.forEach((country) => {
      str = str + country + ", "
    })

    if (str.slice(-2) === ", ") {
      str = str.substring(0, str.length - 2);
    }
    return (str);
  }

  highlightCountry = (hoveredCountry) => {
    var bars = document.querySelectorAll("[type=barchartbar]");
    var xaxvals = document.querySelectorAll("[type=xaxval]");
    var countries = document.getElementsByClassName("country");

    if (hoveredCountry) {
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
          val.style.color = "#0072B2";
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
        } else {
          c.style.filter = "brightness(100%)";
        }
      })
    }
  }

  highlightSelected = (selectedCountriesStrings) => {
    var bars = document.querySelectorAll("[type=barchartbar]");
    [...bars].forEach((bar) => {
      var selected = false
      selectedCountriesStrings.forEach((country) => {
        console.log(country);
        if (bar.classList.contains(country.split(' ').join(''))) {
          console.log(bar);
          selected = true
          bar.style.outline = "2px solid red";
        }
      })
      if (!selected) {
        bar.style.outline = "none";
      }
    });
    const { mapCanvas, props: { geodata } } = this;
    const width = 720;
    const height = 550;
    const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
    const pathGenerator = d3.geoPath().projection(projection);
    const colorScale = d3.scaleLinear().domain([0, 10]).range(["#56B4E9", "#56B4E9"]);

    const svg = mapCanvas.select("g");
    svg.selectAll(".country")
      .data(geodata.features)
      .join("path")
      .on("click", (event, feature) => {
        this.onCountryClick(event, feature)
      })
      .on("mouseout", (event, feature) => {
        this.props.setHoveredCountry(null)
      })
      .on("mouseover", (event, feature) => {
        this.props.setHoveredCountry(feature.properties.brk_name)
      })
      .attr("class", "country")

      .attr("countryName", function (feature) { return feature.properties.brk_name; })
      .attr("stroke-width", function (feature) {
        if (selectedCountriesStrings.has(feature.properties.brk_name)) {
          return (2.0)
        } else {
          return (0.3)
        }
      })
      .attr("stroke", function (feature) {
        if (selectedCountriesStrings.has(feature.properties.brk_name)) {
          return ("#D55E00")
        } else {
          return ("#262626")
        }
      })
      .attr('z-index', '100')
      .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
      .attr("d", feature => pathGenerator(feature));
  }
}

export default OverviewComponent;
