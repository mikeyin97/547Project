import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './GeoChart.css';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';


function GeoChart({ page, setPage, selectedCountriesStrings, setSelectedCountriesStrings, geodata, wwtpdata, statuscounts, levelcounts, aggcounts }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const barRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [maxCount, setMaxCount] = useState(false);

    // const [selectedCountriesStrings, setSelectedCountriesStrings] = useState(new Set());
    const [selectedCountriesCounts, setSelectedCountriesCounts] = useState({});
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [countryIndex, setCountryIndex] = useState(-1);
    const [clicked, setClicked] = useState(true);

    useEffect(() => {
        setPage("Comparison")
    });

    var zoom = null;
    // const dimensions = useResizeObserver(wrapperRef);

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
        setClicked(Math.random())
        setHoveredCountry(feature.properties.brk_name);

    }

    useEffect(() => {
        if (selectedCountriesStrings.has(hoveredCountry)) {
            setCountryIndex([...selectedCountriesStrings].indexOf(hoveredCountry));
        } else {
            setCountryIndex(-1);
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

                    bar.style.filter = "brightness(50%)";
                } else {
                    bar.style.filter = "brightness(100%)";
                }

            });

            var clonexaxvals = [...xaxvals]
            clonexaxvals.forEach((val) => {
                var compare = val.innerHTML.split(' ').join('')
                if (compare === (country.split(' ').join(''))) {
                    val.style.color = "#0072B2";
                    val.style.fontWeight = "bold";
                } else {
                    val.style.color = "black";
                    val.style.fontWeight = "normal";
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
                bar.style.filter = "brightness(100%)";

            })

            var clonexaxvals = [...xaxvals]
            clonexaxvals.forEach((val) => {
                val.style.fontWeight = "normal";
                val.style.color = "black";


            });


            [...countries].forEach((c) => {

                c.style.filter = "brightness(100%)";



            })
        }

    }, [countryIndex, page]);

    function getOffset(el) {
        var rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            width: rect.width || el.offsetWidth,
            height: rect.height || el.offsetHeight
        };
    }

    function connect(div1, div2, color, thickness) { // draw a line connecting elements
        var off1 = getOffset(div1);
        var off2 = getOffset(div2);
        // bottom right
        var x1 = off1.left + off1.width;
        var y1 = off1.top + off1.height;
        // top right
        var x2 = off2.left + off2.width;
        var y2 = off2.top;
        // distance
        var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
        // center
        var cx = ((x1 + x2) / 2) - (length / 2);
        var cy = ((y1 + y2) / 2) - (thickness / 2);
        // angle
        var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
        // make hr
        var htmlLine = "<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
        //
        // alert(htmlLine);
        document.body.innerHTML += htmlLine;
    }


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
        var xaxvals = document.querySelectorAll("[type=xaxval]");
        [...xaxvals].forEach((val) => {
            xaxvals.onmouseover = function () { onCountryHover(null, val.innerHTML) }

        });
    }, [selectedCountriesStrings])

    useEffect(() => {

        const svgCanvas = d3.select(svgRef.current)
        svgCanvas.selectAll("*").remove();
        const svg = svgCanvas.append("g");

        const barCanvases = d3.selectAll(".graph");
        barCanvases.each(function (d, i) {
            const barCanvas = d3.select(this);
            barCanvas.selectAll("*").remove();
            const barsvg = barCanvas.append("g");
            const xax = barsvg.append("g").attr("id", "xax");
            const yax = barsvg.append("g").attr("id", "yax");

            barsvg.append('rect')
                .attr('x', "0")
                .attr('y', "0")
                .attr("id", "bg")
                .attr('width', '100%')
                .attr('height', '65%')
                .attr('stroke', 'black')
                .attr('fill', '#d0e7fd')
                .attr('z-index', '0');

            barsvg.append("text")
                .attr("class", "ylabels")
                .attr("text-anchor", "end")
                .attr("y", 10)
                .attr("x", 50)
                .attr("dy", function (feature) {
                    return "1.5em";
                }
                )
                .attr("dx", function (feature) {
                    if (i === 0) {
                        return "-150px"
                    } else if (i === 1) {
                        return "-180px"
                    } else if (i === 2) {
                        return "-70px"
                    } else if (i === 3) {
                        return "-80px"
                    } else if (i === 4) {

                        return "-160px"
                    } else if (i === 5) {

                        return "-80px"
                    }
                }
                )
                .attr("text-align", "center")
                .attr("transform", "rotate(-90)")
                .attr("display", "none")
                .text(function () {
                    if (i === 0) {
                        return "# of WWTPs"
                    } else if (i === 1) {
                        return "DF"
                    } else if (i === 2) {
                        return "Wastewater Discharge (m^3 / day)"

                    } else if (i === 3) {
                        return "Outfall Discharge (m^3 / day)"

                    } else if (i === 4) {
                        return "Population"
                    } else if (i === 5) {
                        return "Design Capacity (m^3 / day)"
                    }
                });
        })

        const width = 1300;
        const height = 1100;
        const projection = d3.geoMercator().fitSize([width, height], geodata).precision(100);
        const pathGenerator = d3.geoPath().projection(projection);
        const colorScale = d3.scaleLinear().domain([0, 10]).range(["#56B4E9", "#56B4E9"]);
        var radius = d3.scaleSqrt().domain([0, 10146131]).range([0, 15]);

        svg.append('rect')
            .attr('x', "-500%")
            .attr('y', "-500%")
            .attr('width', '1000%')
            .attr('height', '1000%')
            .attr('stroke', 'black')
            .attr('fill', '#9ad6e6')
            .attr("id", "bg2")
            .attr('z-index', '0');

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
                    return ("#D55E00")
                } else {
                    return ("#262626")
                }
            })
            .attr('z-index', '100')
            .attr("transform", "translate(-50,0)")
            .attr("fill", feature => colorScale(Math.floor(Math.random() * 11)))
            .attr("d", feature => pathGenerator(feature))


        var zoom = d3.zoom()
            .scaleExtent([0.7, 10])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", function (event) {
                d3.select('#right svg g').attr("transform", event.transform)
            });
        svg.call(zoom);
        d3.select("#reset").on("click", function () {
            console.log("reset");
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });

    }, [geodata, wwtpdata]);

    function onCountryHover(event, feature) {
        setHoveredCountry(feature);
    }

    function onCountryExit(event, feature) {
        setHoveredCountry(null);
    }

    useEffect(() => {
        var ylabels = document.getElementsByClassName("ylabels");
        [...ylabels].forEach(label => {
            label.style.display = "inline";
        });

        var countriesStr = document.getElementById("countriesStr")
        countriesStr.innerHTML = (getAndUpdateCountries(selectedCountriesStrings, selectedCountriesCounts, selectedCountry));
        const svgCanvas = d3.select(svgRef.current)
        const svg = svgCanvas.select("g");
        const barCanvases = d3.selectAll(".graph");
        svg.selectAll(".country")
            .data(geodata.features)
            .join("path")
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
            });

        barCanvases.each(function (d, i) {
            // to do => check if selected country is in the csvs
            const barCanvas = d3.select(this);
            const barsvg = barCanvas.select("g");
            const xax = barsvg.select("#xax");
            const yax = barsvg.select("#yax");
            var width = 400;
            var height = 270;
            var margintop = 20;
            var marginleft = 100;
            // bar chart x-axis

            var x = d3.scaleBand()
                .range([0, width])
                .domain([...selectedCountriesStrings].map(function (d) { return d }))
                .padding(0.2);

            var subgroups = ["Primary", "Secondary", "Advanced"]

            var xSubgroup = d3.scaleBand()
                .domain(subgroups)
                .range([0, x.bandwidth()])
                .padding([0.05])


            var col = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#e41a1c', '#377eb8', '#4daf4a'])


            xax
                .call(d3.axisBottom(x))
                .attr("transform", "translate(" + marginleft + "," + (margintop + height) + ")")
                .selectAll("text")
                .attr("type", "xaxval")
                .attr('text-align', "center")
                .attr('font-size', "12px")
                .attr("transform", "translate(15,0)rotate(-15)")
                .style("text-anchor", "end");

            var maxH = 0;
            if (i === 0) { //treatment level
                selectedCountriesStrings.forEach((country) => {
                    try {

                        var val = Object.values(levelcounts[country]).reduce((a, b) => a + b, 0);
                        maxH = Math.max(maxH, val + 4);
                    } catch { }

                })
            } else if (i === 1) { // dilution factor
                selectedCountriesStrings.forEach((country) => {
                    try {
                        maxH = Math.max(maxH, aggcounts[country].DF_mean + 100);
                    } catch { }

                })
            } else if (i === 2) { // population served
                selectedCountriesStrings.forEach((country) => {
                    try {

                        maxH = Math.max(maxH, aggcounts[country].RIVER_DIS_mean + 100);
                    } catch { }

                })
            } else if (i === 3) { // design capacity
                selectedCountriesStrings.forEach((country) => {
                    try {

                        maxH = Math.max(maxH, aggcounts[country].WASTE_DIS_mean + 100);
                    } catch { }

                })
            } else if (i === 4) { // river discharge
                selectedCountriesStrings.forEach((country) => {
                    try {
                        maxH = Math.max(maxH, aggcounts[country].POP_SERVED_mean + 100);
                    } catch { }

                })
            } else if (i === 5) { // waste discharge
                selectedCountriesStrings.forEach((country) => {
                    try {
                        maxH = Math.max(maxH, aggcounts[country].DESIGN_CAP_mean + 100);
                    } catch { }

                })
            }

            var y = d3.scaleLinear()
                .domain([0, maxH])
                .range([height, 0]);

            yax
                .attr("transform", "translate(" + marginleft + "," + margintop + ")")
                .call(d3.axisLeft(y));

            barsvg.selectAll("rect:not(#bg)").remove();


            if ((i === 0) || (i === 1) || (i === 2) || (i === 3) || (i === 4) || (i === 5)) {
                barsvg.selectAll("bar")
                    .data(selectedCountriesStrings)
                    .enter()
                    .append("rect")
                    .attr("transform", "translate(" + marginleft + "," + margintop + ")")

                    .attr("x", function (d) {
                        return x(d);
                    })
                    .attr("y", function (d) {
                        try {
                            var val = 0;
                            var aggcount = aggcounts[d];
                            var levelcount = levelcounts[d];
                            if (i === 0) { //number of wwtps
                                val = Object.values(levelcount).reduce((a, b) => a + b, 0);
                            } else if (i === 1) { // dilution factor
                                val = aggcount.DF_mean
                            } else if (i === 2) { // population served
                                val = aggcount.RIVER_DIS_mean
                            } else if (i === 3) { // design capacity
                                val = aggcount.WASTE_DIS_mean
                            } else if (i === 4) { // outfall discharge
                                val = aggcount.POP_SERVED_mean
                            } else if (i === 5) { // outfall discharge
                                val = aggcount.DESIGN_CAP_mean
                            }
                            return y(val);
                        } catch { }

                    })
                    .attr("class", function (d) {
                        try {
                            return d.split(' ').join('');;
                        } catch { }
                    })
                    .attr("type", "barchartbar")
                    .attr("width", x.bandwidth())
                    .on("mouseover", function (event, d) {
                        onCountryHover(event, d);
                    })
                    .on("mouseout", function (event, d) {
                        onCountryExit(event, d);
                    })
                    .attr("height", function (d) {
                        try {
                            var val = 0;
                            var aggcount = aggcounts[d];
                            var levelcount = levelcounts[d];
                            if (i === 0) { //treatment level
                                val = Object.values(levelcount).reduce((a, b) => a + b, 0);
                            } else if (i === 1) { // dilution factor
                                val = aggcount.DF_mean
                            } else if (i === 2) { // population served
                                val = aggcount.RIVER_DIS_mean
                            } else if (i === 3) { // design capacity
                                val = aggcount.WASTE_DIS_mean
                            } else if (i === 4) { // outfall discharge
                                val = aggcount.POP_SERVED_mean
                            } else if (i === 5) { // outfall discharge
                                val = aggcount.DESIGN_CAP_mean
                            }
                            return height - y(val);
                        } catch { }
                    })

                    .attr("fill", function (d) {
                        return "#009E73"
                    }
                    );
            } else if (i === 0) {
                barsvg.append("g").selectAll("g")
                    .data(selectedCountriesStrings)
                    .enter()
                    .append("g")

                    .attr("transform", function (d) {
                        return ("translate(" + (marginleft + x(d)) + "," + margintop + ")")
                    })
                    .selectAll("rect")
                    .data(function (d) {
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
                    .attr("class", function (d) { return d[0].split(' ').join(''); })
                    .attr("type", "barchartbar")
                    .on("mouseover", function (event, d) {
                        onCountryHover(event, d[0]);
                    })
                    .on("mouseout", function (event, d) {
                        onCountryExit(event, d[0]);
                    })
                    .attr("x", function (d) {
                        return xSubgroup(d[1]);
                    })
                    .attr("y", function (d) {
                        try {
                            if (d[1] in levelcounts[d[0]]) {
                                return y(levelcounts[d[0]][d[1]]);
                            } else {
                                return 0;
                            }
                        } catch { }

                    })
                    .attr("width", xSubgroup.bandwidth())
                    .attr("height", function (d) {
                        try {
                            if (d[1] in levelcounts[d[0]]) {
                                return height - y(levelcounts[d[0]][d[1]]);
                            } else {
                                return 0;
                            }
                        }
                        catch { }
                    }
                    )
                    .attr("fill", function (d) {
                        return col(d);
                    })



                var size = 10
                barsvg.selectAll("mydots")
                    .data(subgroups)
                    .enter()
                    .append("rect")
                    .attr("x", 50)
                    .attr("y", function (d, i) { return 50 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
                    .attr("width", size)
                    .attr("height", size)
                    .style("fill", function (d) { return col(d) })
                    .attr("transform", "translate(500,-10)")

                barsvg.selectAll("mylabels")
                    .data(subgroups)
                    .enter()
                    .append("text")
                    .attr("x", 100 + size * 1.2)
                    .attr("y", function (d, i) { return 50 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
                    .style("fill", function (d) { return col(d) })
                    .text(function (d) { return d })
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
                    .attr("transform", "translate(350,-10)")




            }
        })
    }, [selectedCountriesStrings, selectedCountry, maxCount, clicked, page]);

    return (
        // <div ref = {wrapperRef} style={{height:"1000px", width:"2000px", "backgroundColor" :"#000e26"}}>

        //     <div><p>Hello</p></div>
        //     <svg ref = {svgRef} style={{height:"1000px", width:"1000px", "backgroundColor" :"#000e26"}}></svg>
        // </div>
        <div id="countryselector" ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            <div id="left">
                {/* <div id="panel1" className="panel l">
                    <Tooltip className = "tooltip" title={<h4>Number of WWTPs at each level of treatment</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Country WWTPs at Each Treatment Level</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div> */}
                <div id="panel1" className="panel l">
                    <Tooltip className="tooltip" title={<h4>Total Number of WWTPs within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Number of WWTPs</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div>
                <div id="panel2" className="panel r">
                    <Tooltip className="tooltip" title={<h4>Average dilution factor (DF) within the country. DF is the ratio of contaminant concentration in the effluent water to the receiving water.</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Dilution Factor</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div>
                <div id="panel2" className="panel l">
                    <Tooltip className="tooltip" title={<h4>Average volume of total wastewater discharged by each WWTP within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Wastewater Discharge</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div>
                <div id="panel4" className="panel r">
                    <Tooltip className="tooltip" title={<h4>Average volume of total discharge into outfall rivers by each WWTP within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>River Discharge</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div>
                <div id="panel5" className="panel l">
                    <Tooltip className="tooltip" title={<h4>Average population served by each WWTP within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Population Served</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div>
                <div id="panel6" className="panel r">
                    <Tooltip className="tooltip" title={<h4>Average design capacity for each WWTP within the country. **This value is only reported for countries in Europe and the United States</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Design Capacity</Button></Tooltip>
                    <svg ref={barRef} className="graph" style={{ height: "135%", width: "100%" }}></svg>
                </div>
                <div id="panel4" className="panel">
                </div>
            </div>
            <div id="right">
                <button id="reset" class="comparison-reset-button"> Reset the Map</button>
                <div id="countriesStrDiv"><h4 id="countriesStr"></h4></div>
                <svg ref={svgRef} style={{ height: "100%", width: "100%", viewBox: "0 0 100 100" }}></svg>
            </div>
        </div>
    )
}
export default GeoChart;
