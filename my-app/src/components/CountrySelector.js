import React, {useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './GeoChart.css';

function GeoChart({geodata, wwtpdata}){
    const svgRef = useRef();
    const wrapperRef = useRef();
    const barRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedCountriesStrings, setSelectedCountriesStrings] = useState([]);
    

    var zoom = null;
    // const dimensions = useResizeObserver(wrapperRef);
    
    function onCountryClick(event, feature) {
        setSelectedCountry(selectedCountry === feature ? null : feature); 
        setSelectedCountries(selectedCountries => [...selectedCountries, feature]);
        setSelectedCountriesStrings(selectedCountriesStrings => [...selectedCountriesStrings, feature.properties.brk_name]);
    }

    function getAndUpdateCountries(countries){
        var str = "Selected Countries: "
        countries.forEach((country) => {
            str = str + country.properties.brk_name + ", "
        })
        return (str);
    }

    useEffect(() => {
        const svgCanvas = d3.select(svgRef.current)
        const svg = svgCanvas.select("g");

        const barCanvas = d3.select(barRef.current)
        const barsvg = barCanvas.select("g");
        const xax = barsvg.select("#xax");
        const yax = barsvg.select("#yax");

        svg.selectAll(".country")
        .data(geodata.features)
        .join("path")
        .attr("stroke-width", function(feature) {
            if (selectedCountriesStrings.includes(feature.properties.brk_name)){
                return (1.0)
            } else{
                return(0.3)
            }
        })
        .attr("stroke", function(feature) {
            if (selectedCountriesStrings.includes(feature.properties.brk_name)){
                return ("#fff900")
            } else {
                return("#262626")
            }
        });

        var width = 500;
        var height = 400;
        var margintop = 50;
        var marginleft = 80;
        // bar chart x-axis
        
        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(selectedCountriesStrings.map(function(d) { return d; }))
        .padding(0.2);
        
        xax
        .call(d3.axisBottom(x))
        .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

        var y = d3.scaleLinear()
        .domain([0, height])
        .range([ 400, 0]);
        
        yax
        .attr("transform", "translate(" + marginleft + "," + margintop + ")")
        .call(d3.axisLeft(y));

        console.log(x("Canada"));
        console.log(y(100));

        barsvg.selectAll("rect:not(#bg)").remove();

        barsvg.selectAll("bar")
        .data(selectedCountriesStrings)
        .enter()
        .append("rect")
        .attr("transform", "translate(" + marginleft + "," + margintop + ")")
        .attr("x", function(d) { 
            return x(d);
        })
        .attr("y", function(d) {

            return y(100);
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(100); })
        .attr("fill", "#69b3a2");
          
        
    }, [selectedCountriesStrings]);

    useEffect(() => {
        const svgCanvas = d3.select(svgRef.current)
        svgCanvas.selectAll("*").remove();
        const svg = svgCanvas.append("g");

        const barCanvas = d3.select(barRef.current)
        barCanvas.selectAll("*").remove();
        const barsvg = barCanvas.append("g");
        const xax = barsvg.append("g").attr("id","xax");
        const yax = barsvg.append("g").attr("id","yax");

        barsvg.append('rect')
        .attr('x', "0")
        .attr('y', "0")
        .attr("id","bg")
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('stroke', 'black')
        .attr('fill', '#d0e7fd')
        .attr('z-index', '0');

        const width = 1500;
        const height = 1000;

        const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
        const pathGenerator = d3.geoPath().projection(projection);

        const colorScale = d3.scaleLinear().domain([0, 10]).range(["#81e3ff", "#81e3ff"]);

        var radius = d3.scaleSqrt().domain([0, 10146131]).range([0, 15]);
        

        svg.append('rect')
        .attr('x', "-500%")
        .attr('y', "-500%")
        .attr('width', '1000%')
        .attr('height', '1000%')
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2')
        .attr("id","bg2")
        .attr('z-index', '0');

        svg.selectAll(".country")
        .data(geodata.features)
        .join("path")
        .on("click", (event, feature) => {
            onCountryClick(event, feature)
        })
        .attr("class", "country")
        .transition()
        .duration(1000)
        .attr("stroke-width", 0.3)
        .attr("stroke", function(feature) {
            if (selectedCountriesStrings.includes(feature.properties.brk_name)){
                return ("#ffffff")
            } else{
                return("#262626")
            }
            
        })
        .attr('z-index', '100')
        .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
        .attr("d", feature => pathGenerator(feature));


        var zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", function (event) {
            d3.select('#right svg g').attr("transform", event.transform)
        })
        svg.call(zoom);




    }, [geodata, wwtpdata]);
    

    return (
        // <div ref = {wrapperRef} style={{height:"1000px", width:"2000px", "backgroundColor" :"#000e26"}}>
            
        //     <div><p>Hello</p></div>
        //     <svg ref = {svgRef} style={{height:"1000px", width:"1000px", "backgroundColor" :"#000e26"}}></svg>
        // </div>
        <div ref = {wrapperRef} style={{height:"1000px", width:"100%"}}>
            <div id = "left"><p>{getAndUpdateCountries(selectedCountries)}</p>
                <div id = "panel">
                    <svg ref = {barRef} style={{height:"550px", width:"100%"}}></svg>

                </div>
            
            
            </div>
            <div id = "right"><svg ref = {svgRef} style={{height:"1000px", width:"100%"}}></svg></div>
        </div>
    )
}
export default GeoChart;