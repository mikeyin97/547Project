import React, {useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './GeoChart.css';

function GeoChart({geodata, wwtpdata, statuscounts, levelcounts, aggcounts}){
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
        const barCanvases = d3.selectAll(".graph");

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

        barCanvases.each(function(d, i){
            // to do => check if selected country is in the csvs
            const barCanvas = d3.select(this);
            const barsvg = barCanvas.select("g");
            const xax = barsvg.select("#xax");
            const yax = barsvg.select("#yax");
            var width = 700;
            var height = 400;
            var margintop = 50;
            var marginleft = 80;
            // bar chart x-axis
            
            var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(selectedCountriesStrings.map(function(d) { return d; }))
            .padding(0.2);
  
            var subgroups = ["Primary", "Secondary", "Advanced"]

            var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])


            var col = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#e41a1c','#377eb8','#4daf4a'])

            xax
            .call(d3.axisBottom(x))
            .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

            var maxH = 0;
            if (i === 0) { //treatment level
                selectedCountriesStrings.forEach((country) => {
                    for (const [key, value] of Object.entries(levelcounts[country])) {
                        maxH = Math.max(maxH, value + 4);
                    }
                })
            } else if (i === 1) { // dilution factor
                selectedCountriesStrings.forEach((country) => {
                    maxH = Math.max(maxH, aggcounts[country].DF_mean + 100);
                })
            } else if (i === 2) { // population served
                selectedCountriesStrings.forEach((country) => {
                    maxH = Math.max(maxH, aggcounts[country].POP_SERVED_mean + 100);
                })
            }
            
            var y = d3.scaleLinear()
            .domain([0, maxH])
            .range([ height, 0]);
            
            yax
            .attr("transform", "translate(" + marginleft + "," + margintop + ")")
            .call(d3.axisLeft(y));

            barsvg.selectAll("rect:not(#bg)").remove();

            if ((i === 1) || (i === 2)){
                barsvg.selectAll("bar")
                .data(selectedCountriesStrings)
                .enter()
                .append("rect")
                .attr("transform", "translate(" + marginleft + "," + margintop + ")")
                .attr("x", function(d) { 
                    return x(d);
                })
                .attr("y", function(d) {
                    var val = 0;
                    var aggcount = aggcounts[d];
                    if (i === 0) { //treatment level
                        val = 100;
                    } else if (i === 1) { // dilution factor
                        val = aggcount.DF_mean
                    } else if (i === 2) { // population served
                        val = aggcount.POP_SERVED_mean
                    }
                    return y(val);
                })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { 
                    var val = 0;
                    var aggcount = aggcounts[d];
                    if (i === 0) { //treatment level
                        val = 100;
                    } else if (i === 1) { // dilution factor
                        val = aggcount.DF_mean
                    } else if (i === 2) { // population served
                        val = aggcount.POP_SERVED_mean
                    }
                    return height - y(val); })
                .attr("fill", function(d) { 
                    return "#69b3a2"
                    }
                );
            } else if (i === 0) {
                barsvg.append("g").selectAll("g")
                .data(selectedCountriesStrings)
                .enter()
                .append("g")
                
                .attr("transform", function(d){
                    return ("translate(" + (marginleft + x(d)) + "," + margintop + ")")
                })
                .selectAll("rect")
                .data(function(d) {
                    var newdata = []
                    subgroups.forEach((group) => {
                        newdata.push([d, group])
                    })
                    return newdata;
                })
                .enter()
                .append("rect")
                // .attr("test", function(d){
                //     console.log(d);
                // })
                .attr("x", function(d) {
                    return xSubgroup(d[1]);
                })
                .attr("y", function(d) {
                    console.log(levelcounts[d[0]])
                    if (d[1] in levelcounts[d[0]]){
                        return y(levelcounts[d[0]][d[1]]);
                    } else {
                        return 0;
                    }      
                })
                .attr("width", xSubgroup.bandwidth())
                .attr("height", function(d) {
                    if (d[1] in levelcounts[d[0]]){
                        return height - y(levelcounts[d[0]][d[1]]);
                    } else {
                        return 0;
                    }} )
                .attr("fill", function(d) {
                    return col(d);
                })
            }
        })
    }, [selectedCountriesStrings]);

    useEffect(() => {
        const svgCanvas = d3.select(svgRef.current)
        svgCanvas.selectAll("*").remove();
        const svg = svgCanvas.append("g");

        const barCanvases = d3.selectAll(".graph");
        barCanvases.each(function(d, i){
            const barCanvas = d3.select(this);
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
        })

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
        <div id ="countryselector" ref = {wrapperRef} style={{height:"100%", width:"100%"}}>
            <div id = "left"><h3>{getAndUpdateCountries(selectedCountries)}</h3>
                <div id = "panel1" className = "panel">
                    <p> Treatment Level </p>
                    <svg ref = {barRef} className = "graph" style={{height:"550px", width:"100%"}}></svg>
                </div>
                <div id = "panel2" className = "panel">
                    <p> Dilution Factor </p>
                    <svg ref = {barRef} className = "graph" style={{height:"550px", width:"100%"}}></svg>
                </div>
                <div id = "panel3" className = "panel">
                    <p> Population Served </p>
                    <svg ref = {barRef} className = "graph" style={{height:"550px", width:"100%"}}></svg>
                </div>
            
                <div id = "panel4" className = "panel">
                    <p>yay </p>
                </div>
            </div>
            <div id = "right"><svg ref = {svgRef} style={{height:"100%", width:"100%", viewBox:"0 0 100 100"}}></svg></div>
        </div>
    )
}
export default GeoChart;
