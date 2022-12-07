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
    // mapCanvas.selectAll("*").remove();
    const gmap = mapCanvas.append("g");
    //svgCanvas.classed("svg-container", true)
    //.attr("preserveAspectRatio", "xMinYMin meet")
    //.attr("viewBox", "0 0 100 100")
    // Class to make it responsive.
    //.classed("svg-content-responsive", true)

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
      .attr("class", "country")
      .transition()
      .duration(1000)
      .attr("stroke-width", 0.3)
      .attr('z-index', '100')
      .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
      .attr("d", feature => pathGenerator(feature))
      .attr("stroke", feature => "#262626");

    var zoom = d3.zoom().on("zoom", function (event) {
      d3.select('#panel1 svg g').attr("transform", event.transform)
    })
    gmap.call(zoom);
  }

  initOverview = () => {
    const { props: { aggcounts } } = this;
    const barCanvases = d3.selectAll(".graph");

    barCanvases.each(function (d, i) {
      const barCanvas = d3.select(this);
      // barCanvas.selectAll("*").remove();
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

      // define the scales
      var width = 1550,
        height = 200,
        margintop = 50,
        marginleft = 100;

      // all countries
      const countries = Object.keys(aggcounts)

      // define x-axis
      var xScale = d3.scaleBand()
        .range([0, width])
        .domain(countries)
        .padding(0.2)

      // scale x-axis
      xax
        .call(d3.axisBottom(xScale))
        .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-90)")
        .style("text-anchor", "end");

      // calculate max values
      var maxH = 0;
      if (i === 0) { // wastewater discharge
        countries.forEach((country) => {
          maxH = Math.max(maxH, aggcounts[country].WASTE_DIS_mean);
        })
      } else if (i === 1) { // river discharge
        countries.forEach((country) => {
          maxH = Math.max(maxH, aggcounts[country].RIVER_DIS_mean);
        })
      } else if (i === 2) { // dilution factor
        countries.forEach((country) => {
          maxH = Math.max(maxH, aggcounts[country].DF_mean);
        })
      }

      // define y-axis
      var yScale = d3.scaleLinear()
        .domain([0, maxH + 100])
        .range([height, 0]);

      // scale y-axis
      yax
        .attr("transform", "translate(" + marginleft + "," + margintop + ")")
        .call(d3.axisLeft(yScale));

      // barsvg.selectAll("rect:not(#bgbar)").remove();

      // draw bars
      gbar.selectAll("bar")
        .data(countries)
        .enter()
        .append("rect")
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
          }
          return height - yScale(val);
        })
        .attr("fill", function (d) {
          return "#69b3a2"
        }
        );
    });
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
