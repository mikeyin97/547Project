import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './GeoChart.css';

function GeoChart({ page, setPage, selectedCountriesStrings, setSelectedCountriesStrings, geodata, wwtpdata, levelcountstrans }) {
    const svgRef = useRef();
    const barRef = useRef();
    const wrapperRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [maxCount, setMaxCount] = useState(false);

    // const [selectedCountriesStrings, setSelectedCountriesStrings] = useState(new Set());
    const [selectedCountriesCounts, setSelectedCountriesCounts] = useState({});
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [countryIndex, setCountryIndex] = useState(-1);
    const [clicked, setClicked] = useState(true);
    const [selectedOnly, setSelectedOnly] = useState(false); 
    const [sortby, setSortby] = useState("key");
    var zoom = null;

    useEffect(() => {
        setPage("Distribution")
    });

    function onCountryClick(event, feature) {
        var a = document.getElementById("countriesStr").innerHTML.indexOf("(");
        var b = document.getElementById("countriesStr").innerHTML.indexOf("/10");
        var count = parseInt(document.getElementById("countriesStr").innerHTML.slice(a + 1, b))
        setSelectedCountry(feature);
        if (count <= 9) {
            
            setSelectedCountriesStrings(selectedCountriesStrings => new Set([...selectedCountriesStrings, feature.properties.brk_name]));

            var copy = selectedCountriesCounts;
            if (!(feature.properties.brk_name in copy)) {
                copy[feature.properties.brk_name] = true;
            }
            setSelectedCountriesCounts(copy);
        }
        setHoveredCountry(feature.properties.brk_name);

    }

    function onCountryClick2(event, feature) {
        var a = document.getElementById("countriesStr").innerHTML.indexOf("(");
        var b = document.getElementById("countriesStr").innerHTML.indexOf("/10");
        var count = parseInt(document.getElementById("countriesStr").innerHTML.slice(a + 1, b))
        // setSelectedCountry(feature);
        if (count <= 9) {
            
            setSelectedCountriesStrings(selectedCountriesStrings => new Set([...selectedCountriesStrings, feature.data.country]));

            var copy = selectedCountriesCounts;
            if (!(feature.data.country in copy)) {
                copy[feature.data.country] = true;
            }
            // setSelectedCountriesCounts(copy);
        }
    }


    useEffect(() => {
        if (selectedOnly){
            if (selectedCountriesStrings.has(hoveredCountry)) {
                setCountryIndex([...selectedCountriesStrings].indexOf(hoveredCountry));
            } else {
                setCountryIndex(-1);
            }
        } else {
            if (selectedCountriesStrings.has(hoveredCountry)) {
                setCountryIndex([...selectedCountriesStrings].indexOf(hoveredCountry));
            } else {
                setCountryIndex(-1);
            }
            var bars = document.querySelectorAll("[type=barchartbar]");
            var countries = document.getElementsByClassName("country");
            var xaxvals = document.querySelectorAll("[type=xaxval]");
            if (hoveredCountry){
                
                [...bars].forEach((bar) => {
                    if (bar.classList.contains(hoveredCountry.split(' ').join(''))) {
                        bar.style.opacity = "0.4"
                    } else {
                        bar.style.opacity = "1"
                    }
    
                });

                [...countries].forEach((c) => {
                    var compare = c.getAttribute("countryName").split(' ').join('')
                    if (compare === (hoveredCountry.split(' ').join(''))) {
                        c.style.filter = "brightness(80%)";
                        // connect(c, countryBar, "red", 10)
                    } else {
                        c.style.filter = "brightness(100%)";
                    }
                });
                [...xaxvals].forEach((val) => {
                    var compare = val.innerHTML.split(' ').join('')
                    if (compare === (truncate(hoveredCountry, 14).split(' ').join(''))) {
                        val.style.color = "green";
                        val.style.fontWeight = "900";
                    } else {
                        val.style.color = "black";
                        val.style.fontWeight = "20";
                    }
    
                });
            } else {
                [...bars].forEach((bar) => {
                        bar.style.opacity = "1"
                });
            }
        }
        
    }, [hoveredCountry, selectedCountry, selectedCountriesStrings]);

    useEffect(() => {
        var bars = document.querySelectorAll("[type=barchartbar]");
        var xaxvals = document.querySelectorAll("[type=xaxval]");
        var countries = document.getElementsByClassName("country");
        if (countryIndex !== -1) {
            var country = [...selectedCountriesStrings][countryIndex];
            var countryBar = null;

            [...bars].forEach((bar) => {
                try{
                    if (bar.classList.contains(country.split(' ').join(''))) {
                        if (!countryBar) {
                            countryBar = bar;
                        }
    
                        bar.style.opacity = "0.4"
                    } else {
                        bar.style.opacity = "1"
                    }
    
                } catch{}
                
            });

            var clonexaxvals = [...xaxvals]
            clonexaxvals.forEach((val) => {
                var compare = val.innerHTML.split(' ').join('')
                try{
                    if (compare === (country.split(' ').join(''))) {
                        val.style.color = "#04290e";
                        val.style.fontWeight = "900";
                    } else {
                        val.style.color = "black";
                        val.style.fontWeight = "20";
                    }
     
                } catch{}
                
            });
            [...countries].forEach((c) => {
                var compare = c.getAttribute("countryName").split(' ').join('')
                if (compare === (country.split(' ').join(''))) {
                    c.style.filter = "brightness(80%)";
                    // connect(c, countryBar, "red", 10)
                } else {
                    c.style.filter = "brightness(100%)";
                }
            })
        } else {
            [...bars].forEach((bar) => {
                bar.style.opacity = "1"
            })
            var clonexaxvals = [...xaxvals]
            clonexaxvals.forEach((val) => {
                val.style.fontWeight = "20";
                val.style.color = "black";
            });
            [...countries].forEach((c) => {
                c.style.filter = "brightness(100%)";
            })
        }
    }, [countryIndex, page, selectedCountriesStrings]);

    function getAndUpdateCountries(countriesStrings, countryCounts, country) {
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
            setMaxCount(true);
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

    useEffect(() => {
       
        const svgCanvas = d3.select(svgRef.current)
        svgCanvas.selectAll("*").remove();
        const svg = svgCanvas.append("g");

        const width = 1200;
        const height = 1000;

        svg.append('rect')
            .attr('x', "-500%")
            .attr('y', "-500%")
            .attr('width', '1000%')
            .attr('height', '1000%')
            .attr('stroke', 'black')
            .attr('fill', '#69a3b2')
            .attr("id", "bg2")
            .attr('z-index', '0');

        const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
        const pathGenerator = d3.geoPath().projection(projection);

        const colorScale = d3.scaleLinear().domain([0, 10]).range(["#81e3ff", "#81e3ff"]);

        var radius = d3.scaleSqrt().domain([0, 10146131]).range([0, 15]);

        svg.selectAll(".country")
            .data(geodata.features)
            .join("path")


            .on("click", (event, feature) => {
                onCountryClick(event, feature)
            })
            .on("mouseout", (event, feature) => {
                onCountryExit(event, feature.properties.brk_name)
            })
            .on("mouseover", (event, feature) => {
                onCountryHover(event, feature.properties.brk_name)
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
                    return ("#EF2F2F")
                } else {
                    return ("#262626")
                }
            })
            .attr('z-index', '100')
            .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
            .attr("d", feature => pathGenerator(feature))
            .attr("transform", "translate(300,-60)")

        var zoom = d3.zoom().scaleExtent([0.5, 10]).on("zoom", function (event) {
            d3.select('svg g').attr("transform", event.transform)
        })

        svg.call(zoom);

        document.getElementById("byKey").disabled = true;


        svg.selectAll("circle")
            .data(wwtpdata.features)
            .enter()
            .append("circle")
            .attr("fill", function (d, i) {
                if (d.properties.LEVEL === "Advanced") {
                    return "black"
                } else if (d.properties.LEVEL === "Secondary") {
                    return "blue"
                } else {
                    return "darkgreen"
                }
            })
            .style("opacity", "0.2")
            .attr("cx", function (d) {
                return projection(d.geometry.coordinates)[0];
            })
            .attr("cy", function (d) {
                return projection(d.geometry.coordinates)[1];
            })
            .attr("r", 0.3)
            //.attr("r", function(d) { return radius(d.properties.POP_SERVED); })
            .attr("class", "locations")
            .attr("transform", "translate(300,-60)");
    }, [geodata, wwtpdata]);


    useEffect(() =>{
        var countriesStr = document.getElementById("countriesStr")
        countriesStr.innerHTML = (getAndUpdateCountries(selectedCountriesStrings, selectedCountriesCounts, selectedCountry));
        const svgCanvas = d3.select(svgRef.current)
        const svg = svgCanvas.select("g");
        const colorScale = d3.scaleLinear().domain([0, 10]).range(["#81e3ff", "#81e3ff"]);
        const width = 1200;
        const height = 1000;
        const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
        const pathGenerator = d3.geoPath().projection(projection);
        
        svg.selectAll(".country")
        .data(geodata.features)
        .join("path")


        .on("click", (event, feature) => {
            onCountryClick(event, feature)
        })
        .on("mouseout", (event, feature) => {
            onCountryExit(event, feature.properties.brk_name)
        })
        .on("mouseover", (event, feature) => {
            onCountryHover(event, feature.properties.brk_name)
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
                return ("#EF2F2F")
            } else {
                return ("#262626")
            }
        })
        .attr('z-index', '100')
        .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
        .attr("d", feature => pathGenerator(feature))
        .attr("transform", "translate(300,-60)")

    }, [selectedCountriesStrings, maxCount, selectedCountry])

    function onCountryHover(event, feature) {
        setHoveredCountry(feature);
    }

    function onCountryExit(event, feature) {
        setHoveredCountry(null);
    }

    function truncate(str, length) {
        if (str.length > length) {
            const regex1 = /\(/;
            const regex2 = /\)/;
            const i1 = str.search(regex1);
            const i2 = str.search(regex2);
            if (i1 !== -1 && i2 !== -1){
                return str.substring(i1+1, i2);
            } else {
                return str.slice(0, length);
            }
        } else return str;
    }

    useEffect(() => {
        
        var levelSubgroups = ["Primary", "Secondary", "Advanced"]
        const countries = []
        const countries_short = []

        levelcountstrans.forEach(function (data) {
            countries.push(data.country)
            countries_short.push(truncate(data.country, 14))
        });
        const barCanvas = d3.select(".graph")
        barCanvas.selectAll("*").remove();
        const barSVG = barCanvas.append('svg')

            .attr('id', 'barcanvas')
            .attr('height', '100%')
            .attr('width', '100%');
        
        
        const gbar = barSVG.append("g").attr("y", "100");
        
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

                    
        gbar.append("rect").attr("x",2200).attr("y",70).attr("width", 10).attr("height", 10).style("fill", "black")
        gbar.append("rect").attr("x",2200).attr("y",100).attr("width", 10).attr("height", 10).style("fill", "blue")
        gbar.append("rect").attr("x",2200).attr("y",130).attr("width", 10).attr("height", 10).style("fill", "darkgreen")
        gbar.append("text").attr("x", 2220).attr("y", 75).text("Advanced").style("font-size", "15px").attr("alignment-baseline","middle")
        gbar.append("text").attr("x", 2220).attr("y", 105).text("Secondary").style("font-size", "15px").attr("alignment-baseline","middle")
        gbar.append("text").attr("x", 2220).attr("y", 135).text("Primary").style("font-size", "15px").attr("alignment-baseline","middle")



        gbar.append("text").attr("x", "40%").attr("y", "5%").text("Number of WWTPs per Country (stacked by level)").style("font-size", "15px").attr("alignment-baseline","middle")
        // define the scales
        var width = 2100,
            height = 120,
            margintop = 25,
            marginleft = 70;

        // define x-axis
        if (selectedOnly){
            var xScale = d3.scaleBand()
            .range([0, width])
            .domain(selectedCountriesStrings)
            .padding(0.2)
        } else{
            var xScale = d3.scaleBand()
            .range([0, width])
            .domain(countries_short)
            .padding(0.2)
        }
        

        // scale x-axis
        xax.call(d3.axisBottom(xScale))
            .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
            .selectAll("text")
            .attr("type", "xaxval")
            .attr("transform", "translate(-15,5)rotate(-90)")
            .style("text-anchor", "end");

        
        // define y-axis
       
        var levelColors = d3.scaleOrdinal()
            .domain(levelSubgroups)
            .range(["darkgreen", 'blue', 'black'])

        //stack the data? --> stack per subgroup
        var maxH = 0;
        var stackedData = null;
        if (selectedOnly){
            var newObj = []
            levelcountstrans.forEach((data) => {

                if (selectedCountriesStrings.has(data.country)){
                    newObj.push(data)
                    maxH = Math.max(maxH, data.Advanced + data.Primary + data.Secondary)
                }
            }
            )
            stackedData = d3.stack()
            .keys(levelSubgroups)
            (newObj)
        } else{
            stackedData = d3.stack()
            .keys(levelSubgroups)
            (levelcountstrans)
        }
        
        if (selectedOnly){}
        else{
            maxH = 18000;
        }

        var yScale = d3.scaleLinear()
        .domain([0, maxH])
        .range([height, 0]);

        // scale y-axis
        yax
            .attr("transform", "translate(" + marginleft + "," + margintop + ")")
            .call(d3.axisLeft(yScale));

        var levelColors = d3.scaleOrdinal()
            .domain(levelSubgroups)
            .range(["darkgreen", 'blue', 'black'])

        //stack the data, stack per subgroup
        var stackedData = null;
        if (selectedOnly) {
            stackedData = d3.stack()
            .keys(levelSubgroups)
            (newObj)
        } else {
            stackedData = d3.stack()
            .keys(levelSubgroups)
            (levelcountstrans)
        }

        

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
                return d;
            }).enter()
            .append("rect")
            .attr("x", function (d) {
                if (selectedOnly){
                    return xScale(d.data.country) + marginleft;
                } else{
                    return xScale(truncate(d.data.country, 14)) + marginleft;
                }
                
            })
            .attr("y", function (d) {
                return yScale(d[1]) + margintop;
            })
            .attr("class", function (d) { return d.data.country.split(' ').join('') + " littlebar"; })
            .attr("type", "barchartbar")
            .on("mouseover", function (event, d) {
                onCountryHover(event, d.data.country);
            })
            .on("mouseout", function (event, d) {
                onCountryExit(event, d.data.country);
            })
            .on("click", function(event, d) { 
                onCountryClick2(event, d);
            })
            .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr("width", xScale.bandwidth())
            .attr('filter', "saturation(100%)")
            .attr('opacity', "1")

            var sorting = function (a, b) {
                return d3.descending((a.Advanced + a.Primary + a.Secondary), (b.Advanced + b.Primary + b.Secondary));
            };
            var sortingKey = function (a, b) {
                return d3.ascending(a.country, b.country);
            };
            sortX("#byValue", levelcountstrans, sorting, xScale, gbar, xax, marginleft, margintop, height);
            sortX("#byKey", levelcountstrans, sortingKey, xScale, gbar, xax, marginleft, margintop, height);

    }, [levelcountstrans, selectedOnly , selectedCountriesStrings, sortby]);


    useEffect(() => {
        if (!selectedOnly){
            var bars = document.querySelectorAll("[type=barchartbar]");
            [...bars].forEach((bar) => {
                var selected = false
                selectedCountriesStrings.forEach((country) => {
                    if (bar.classList.contains(country.split(' ').join(''))) {
                        selected = true
                        bar.style.outline = "2px solid red";
                    } 
                })
                if (!selected){
                    bar.style.outline = "none";
                }
                
            
            });
        }
        
    }, [selectedCountriesStrings, sortby, selectedOnly])
    
    useEffect(() => {
        var bars = document.querySelectorAll("[type=barchartbar]");
        var countries = document.getElementsByClassName("country");



        if (countryIndex !== -1) {
            var country = [...selectedCountriesStrings][countryIndex];
            var countryBar = null;

            if (country){
                [...countries].forEach((c) => {
                    var compare = c.getAttribute("countryName").split(' ').join('')
                    if (compare === (country.split(' ').join(''))) {
                        c.style.filter = "brightness(80%)";
                        // connect(c, countryBar, "red", 10)
                    } else {
                        c.style.filter = "brightness(100%)";
                    }
    
                })
            }

            // [...bars].forEach((bar) => {
            //     if (bar.classList.contains(country.split(' ').join(''))) {
            //         if (!countryBar) {
            //             countryBar = bar;
            //         }

            //         bar.style.outline = "2px solid red";
            //     } else {
            //         bar.style.outline = "none";
            //     }

            // });

            



        } else {

            // [...bars].forEach((bar) => {
            //     bar.style.outline = "none";

            // });


            [...countries].forEach((c) => {

                c.style.filter = "brightness(100%)";



            })
        }

    }, [countryIndex, page, selectedCountry, sortby, selectedOnly]);

    function clickedSort(val){
        if (val != sortby){
            setSortby(val)
        }
        if (val == "key") {
            document.getElementById("byKey").disabled = true;
            document.getElementById("byValue").disabled = false;
        }
        if (val == "value") {
            document.getElementById("byValue").disabled = true;
            document.getElementById("byKey").disabled = false;
        }
        
    }
    function sortX(tagName, aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height) {
        d3.select(tagName).on("click", function () {
            aggArr.sort(sorting)

            if (selectedOnly){
                var newObj = []
                aggArr.forEach((d) => {
                    if (selectedCountriesStrings.has(d.country)){
                        newObj.push(d)
                    }
                })
                xScale.domain(newObj.map(function (d) {
                    return (d.country);
                }));
            } else{
                xScale.domain(aggArr.map(function (d) {
                    return truncate(d.country, 14);
                }));
            }
            
            
            gbar.selectAll(".littlebar")
                .attr("x", function (d, i) {
                    if (selectedOnly){
                        return xScale(d) + marginleft;
                    } else{
                        return xScale(truncate(d, 14)) + marginleft;
                    }
                })
            // scale x-axis
            // scale x-axis
            xax.call(d3.axisBottom(xScale))
                .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
                .selectAll("text")
                .attr("transform", "translate(-15,5)rotate(-90)")
                .style("text-anchor", "end");
        });
    }

    function handleChangeChk(){
        var sortOptions = document.getElementById("sortingOptions")
        if (document.getElementById("selectedOnly").checked){
            setSelectedOnly(true);
            sortOptions.style.display = "none";
        } else {
            setSelectedOnly(false);
            sortOptions.style.display = "block";
        }
    }   

    return (
        <div id="distribution" ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            <div id="top"><svg ref={svgRef} style={{ height: "100%", width: "100%" }}></svg></div>
            <div id="countriesStrDiv2"><h4 id="countriesStr"></h4></div>
            <div id="menupanel"> 
                <h4 id = "bcopts">Bar Chart Options</h4>
                <form>
                <input type="checkbox" onChange={()=>handleChangeChk()} id="selectedOnly" name="selectedOnly" value="selected"></input><label htmlFor="selectedOnly"> Show selected countries only?</label><br></br>
                </form>
                
                <div id = "sortingOptions">
                <button id="byKey" onClick = {()=>clickedSort("key")}> Sort Alphabetically</button>
                <button id="byValue" onClick = {()=>clickedSort("value")}> Sort Largest -> Smallest (# of WWTPs) </button>
                </div>
                
            </div>
            <div id = "dotlegend">
                <span className="dot" id="advanceddot"></span> Advanced<br></br>
                <span className="dot" id="secondarydot"></span> Secondary<br></br>
                <span className="dot" id="primarydot"></span> Primary<br></br>

            </div>
            <div id="bottom">
                
                <svg ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></svg>
            </div>
        </div>
    );
}
export default GeoChart;
