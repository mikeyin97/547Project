import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './GeoChart.css';

function GeoChart({ geodata, wwtpdata }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null);
    // const dimensions = useResizeObserver(wrapperRef);
    const onCountryClick = useCallback(([event, feature, zoom]) => {
        const svg = d3.select(svgRef.current).select("g");
        setSelectedCountry(selectedCountry === feature ? null : feature); // fix for usa and russia
        // console.log(selectedCountry.properties.admin);
        if (zoom) {
            //svg.select("g").call(zoom.transform, d3.zoomIdentity.scale(1));
            var zoom_again = d3.zoom().on("zoom", function (event) {
                d3.select('svg g').attr("transform", event.transform)
            })
            svg.call(zoom_again);
        }
    }, [selectedCountry])

    useEffect(() => {
        const svgCanvas = d3.select(svgRef.current)
        svgCanvas.selectAll("*").remove();
        const svg = svgCanvas.append("g");
        const width = 1500;
        const height = 1000;

        const projection = d3.geoMercator().fitSize([width, height], selectedCountry || geodata).precision(100);
        const pathGenerator = d3.geoPath().projection(projection);

        const colorScale = d3.scaleLinear().domain([0, 10]).range(["#81e3ff", "#81e3ff"]);

        var radius = d3.scaleSqrt().domain([0, 10146131]).range([0, 15]);
        var zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width + 1000, height]])
            .on("zoom", function (event) {
                d3.select('svg g').attr("transform", event.transform)
            })

        svg.selectAll(".country")
            .data(geodata.features)
            .join("path")
            .on("click", (event, feature) => {
                onCountryClick(event, feature, zoom)
            })
            .attr("class", "country")
            .transition()
            .duration(1000)
            .attr("stroke-width", 0.3)
            .attr("stroke", "#262626")
            .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
            .attr("d", feature => pathGenerator(feature));

        svg.selectAll("circle")
            .data(wwtpdata.features)
            .enter()
            .append("circle")
            .attr("fill", function (d, i) {
                if (d.properties.LEVEL === "Advanced") {
                    return "green"
                } else if (d.properties.LEVEL === "Secondary") {
                    return "yellow"
                } else {
                    return "red"
                }
            })
            .style("opacity", "0.5")
            .attr("cx", function (d) {
                return projection(d.geometry.coordinates)[0];
            })
            .attr("cy", function (d) {
                return projection(d.geometry.coordinates)[1];
            })
            .attr("r", 0.3)
            //.attr("r", function(d) { return radius(d.properties.POP_SERVED); })
            .attr("class", "locations");
        svg.call(zoom);
    }, [geodata, wwtpdata, selectedCountry, onCountryClick]);

    return (
        <div id="geochart" ref={wrapperRef} style={{ height: "1000px", width: "100%" }}>
            <div id="right"><svg ref={svgRef} style={{ height: "100%", width: "100%" }}></svg></div>
        </div>
    );
}
export default GeoChart;
