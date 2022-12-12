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
                })
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
                if (bar.classList.contains(country.split(' ').join(''))) {
                    if (!countryBar) {
                        countryBar = bar;
                    }

                    bar.style.opacity = "0.4"
                } else {
                    bar.style.opacity = "1"
                }

            });

            var clonexaxvals = [...xaxvals]
            clonexaxvals.forEach((val) => {
                var compare = val.innerHTML.split(' ').join('')
                if (compare === (country.split(' ').join(''))) {
                    val.style.color = "#04290e";
                    val.style.fontWeight = "900";
                } else {
                    val.style.color = "black";
                    val.style.fontWeight = "20";
                }

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
        const width = 1000;
        const height = 800;

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
            .attr("transform", "translate(100,-60)")

        var zoom = d3.zoom().scaleExtent([0.5, 10]).on("zoom", function (event) {
            d3.select('svg g').attr("transform", event.transform)
        })

        svg.call(zoom);


        // svg.selectAll("circle")
        //     .data(wwtpdata.features)
        //     .enter()
        //     .append("circle")
        //     .attr("fill", function (d, i) {
        //         if (d.properties.LEVEL === "Advanced") {
        //             return "black"
        //         } else if (d.properties.LEVEL === "Secondary") {
        //             return "blue"
        //         } else {
        //             return "darkgreen"
        //         }
        //     })
        //     .style("opacity", "0.5")
        //     .attr("cx", function (d) {
        //         return projection(d.geometry.coordinates)[0];
        //     })
        //     .attr("cy", function (d) {
        //         return projection(d.geometry.coordinates)[1];
        //     })
        //     .attr("r", 0.3)
        //     //.attr("r", function(d) { return radius(d.properties.POP_SERVED); })
        //     .attr("class", "locations")
        //     .attr("transform", "translate(100,-60)");
    }, [geodata, wwtpdata, selectedCountriesStrings, selectedCountry]);


    useEffect(() =>{
        var countriesStr = document.getElementById("countriesStr")
        countriesStr.innerHTML = (getAndUpdateCountries(selectedCountriesStrings, selectedCountriesCounts, selectedCountry));
        const svgCanvas = d3.select(svgRef.current)
        const svg = svgCanvas.select("g");
        const colorScale = d3.scaleLinear().domain([0, 10]).range(["#81e3ff", "#81e3ff"]);
        const width = 1000;
        const height = 800;
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
        .attr("transform", "translate(100,-60)")

    }, [selectedCountriesStrings, maxCount, selectedCountry])

    function onCountryHover(event, feature) {
        setHoveredCountry(feature);
    }

    function onCountryExit(event, feature) {
        setHoveredCountry(null);
    }

    function truncate(str, length) {
        if (str.length > length) {
            return str.slice(0, length);
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

        // define the scales
        var width = 1750,
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
            .attr("transform", "translate(-10,5)rotate(-90)")
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
        var stackedData = d3.stack()
            .keys(levelSubgroups)
            (levelcountstrans)

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
            .attr("class", "littlebar")
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
            .attr("class", function (d) { return d.data.country.split(' ').join(''); })
            .attr("type", "barchartbar")
            .on("mouseover", function (event, d) {
                onCountryHover(event, d.data.country);
            })
            .on("mouseout", function (event, d) {
                onCountryExit(event, d.data.country);
            })
            .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr("width", xScale.bandwidth())
            .attr('filter', "saturation(100%)")
            .attr('opacity', "1")
    }, [levelcountstrans, selectedOnly , selectedCountriesStrings]);


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
        
    }, [selectedCountriesStrings])
    
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

    }, [countryIndex, page, selectedCountry]);

    function sortX(tagName, aggArr, sorting, xScale, gbar, xax, marginleft, margintop, height) {
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
                    return xScale(truncate(d.data.country, 14)) + marginleft;
                    //return xScale(d);
                })
            // scale x-axis
            // scale x-axis
            xax.call(d3.axisBottom(xScale))
                .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
                .selectAll("text")
                .attr("transform", "translate(-10,5)rotate(-90)")
                .style("text-anchor", "end");
        });
    }

    return (
        <div id="distribution" ref={wrapperRef} style={{ height: "1000px", width: "100%" }}>
            <div id="top"><svg ref={svgRef} style={{ height: "100%", width: "100%" }}></svg></div>
            <div id="countriesStrDiv2"><h4 id="countriesStr"></h4></div>
            <div id="bottom"><svg ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></svg></div>
        </div>
    );
}
export default GeoChart;
