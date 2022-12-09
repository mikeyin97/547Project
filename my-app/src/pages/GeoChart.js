import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './GeoChart.css';

function GeoChart({ geodata, wwtpdata, levelcountstrans }) {
    const svgRef = useRef();
    const barRef = useRef();
    const wrapperRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null);

    console.log(typeof (levelcountstrans))
    console.log(levelcountstrans)

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

    useEffect(() => {
        var levelSubgroups = ["Primary", "Secondary", "Advanced"]
        const countries = []
        levelcountstrans.forEach(function (data) {
            countries.push(data.country)
        });
        const barCanvas = d3.select(".graph");
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
        var width = 1300,
            height = 200,
            margintop = 50,
            marginleft = 70;

        // define x-axis
        var xScale = d3.scaleBand()
            .range([0, width])
            .domain(countries)
            .padding(0.2)

        // scale x-axis
        xax.call(d3.axisBottom(xScale))
            .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-90)")
            .style("text-anchor", "end");

        const maxH = 40000; //44457
        // define y-axis
        var yScale = d3.scaleLinear()
            .domain([0, maxH])
            .range([height, 0]);

        // scale y-axis
        yax
            .attr("transform", "translate(" + marginleft + "," + margintop + ")")
            .call(d3.axisLeft(yScale));

        var levelColors = d3.scaleOrdinal()
            .domain(levelSubgroups)
            .range(['#e41a1c', '#377eb8', '#4daf4a'])

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
            .keys(levelSubgroups)
            (levelcountstrans)
        console.log(stackedData)

        gbar.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("transform", function (d) {
                return ("translate(" + (marginleft + xScale(d)) + "," + margintop + ")")
            })
            .attr("fill", function (d) {
                return levelColors(d.key);
            })
            .selectAll("rect")
            .data(function (d) {
                console.log(d);
                return d;
            }).enter()
            .append("rect")
            .attr("x", function (d) {
                return xScale(d.data.country)
            })
            .attr("y", function (d) {
                console.log(d[0]);
                console.log(d[1]);
                return yScale(d[1]);
            })
            .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr("width", xScale.bandwidth())
    }, [levelcountstrans]);

    return (
        <div id="geochart" ref={wrapperRef} style={{ height: "1000px", width: "100%" }}>
            <div id="left"><svg ref={svgRef} style={{ height: "100%", width: "100%" }}></svg></div>
            <div id="right"><svg ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></svg></div>
        </div>
    );
}
export default GeoChart;
