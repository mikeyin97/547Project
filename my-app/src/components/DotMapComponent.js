import * as d3 from 'd3';
import * as topojson from 'topojson';

class DotMapComponent {
  containerEl;
  props;
  svgCanvas;
  constructor(containerEl, props) {
    this.containerEl = containerEl;
    this.props = props;
    this.svgCanvas = d3.select(containerEl);
    this.initMap();
  }

  initMap = () => {
    const { svgCanvas } = this;

    var width = 960,
      height = 600;

    var svg = svgCanvas.append("svg")
      .attr("width", width)
      .attr("height", height);

    var path = d3.geoPath().projection(null);

    d3.json("../data/world_map_reduced.json", function (error, us) {
      if (error) return console.error(error);
      svg.append("path")
        .datum(topojson.mesh(us))
        .attr("d", path);
    });
  }
}

export default DotMapComponent;
