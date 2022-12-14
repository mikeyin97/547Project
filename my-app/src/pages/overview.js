import React, { useRef, useEffect, useState } from 'react';
import './overview.css';
import OverviewComponent from '../components/OverviewComponent';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

let vis;

function Overview({ page, setPage, selectedCountriesStrings, setSelectedCountriesStrings, geodata, wwtpdata, aggcounts, levelcounts, statuscounts, aggcountssort }) {
    const wrapperRef = useRef();
    const svgRef = useRef();
    const barRef = useRef();
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [selectedCountriesCounts, setSelectedCountriesCounts] = useState({});
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [maxCount, setMaxCount] = useState(false);
    const [sortby, setSortby] = useState("key");

    useEffect(initVis, [geodata, wwtpdata, aggcounts, levelcounts, statuscounts, aggcountssort, setHoveredCountry, selectedCountriesCounts, selectedCountriesStrings, selectedCountry, setSelectedCountriesStrings]);
    useEffect(updateHighlight, [hoveredCountry]);

    useEffect(() => {
        setPage("Overview")
    });

    function updateHighlight() {
        vis.highlightCountry(hoveredCountry);
    }

    function initVis() {
        if (geodata && wwtpdata && aggcounts) {
            const d3Props = {
                geodata,
                wwtpdata,
                aggcounts,
                levelcounts,
                statuscounts,
                aggcountssort,
                setHoveredCountry,
                selectedCountriesCounts,
                setSelectedCountriesCounts,
                selectedCountry,
                setSelectedCountry,
                selectedCountriesStrings,
                setSelectedCountriesStrings,
            }
            vis = new OverviewComponent(svgRef.current, barRef.current, d3Props);
        }
    }

    useEffect(() => {
        var countriesStr = document.getElementById("countriesStr")
        countriesStr.innerHTML = (vis.getAndUpdateCountries(selectedCountriesStrings, selectedCountriesCounts, selectedCountry));
        vis.highlightSelected(selectedCountriesStrings);
    }, [selectedCountriesStrings, maxCount])

    function clickedSort(val, tagName) {
        if (val !== sortby) {
            setSortby(val)
        }
        if (val === "key") {
            document.getElementById("byKey" + tagName).disabled = true;
            document.getElementById("byValue" + tagName).disabled = false;
        }
        if (val === "value") {
            document.getElementById("byValue" + tagName).disabled = true;
            document.getElementById("byKey" + tagName).disabled = false;
        }
    }
    return (
        <div id="overview" ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            <div id="overview-main" style={{ width: "67%" }}><h3>Country Overview</h3>
                <div id="chart1" className="overview-panel">
                    <Tooltip className="tooltip" title={<h4>Average dilution factor (DF) within the country. DF is the ratio of contaminant concentration in the effluent water to the receiving water.</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Dilution Factor</Button></Tooltip>
                    <div ref={barRef} className="graph" style={{ height: "88%", width: "100%" }}></div>
                </div>
                <div id="chart2" className="overview-panel">
                    <Tooltip className="tooltip" title={<h4>Average volume of total wastewater discharged by each WWTP within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Wastewater Discharge</Button></Tooltip>
                    <div ref={barRef} className="graph" style={{ height: "88%", width: "100%" }}></div>
                </div>
                <div id="chart3" className="overview-panel">
                    <Tooltip className="tooltip" title={<h4>Average volume of total discharge into outfall rivers by each WWTP within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>River Discharge</Button></Tooltip>
                    <div ref={barRef} className="graph" style={{ height: "88%", width: "100%" }}></div>
                </div>
                <div id="chart4" className="overview-panel">
                    <Tooltip className="tooltip" title={<h4>Average population served by each WWTP within the country</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Population Served</Button></Tooltip>
                    <div ref={barRef} className="graph" style={{ height: "88%", width: "100%" }}></div>
                </div>
                <div id="chart5" className="overview-panel">
                    <Tooltip className="tooltip" title={<h4>Average design capacity for each WWTP within the country. **This value is only reported for countries in Europe and the United States</h4>} arrow placement="right"><Button sx={{ m: 1 }}>Design Capacity</Button></Tooltip>
                    <div ref={barRef} className="graph" style={{ height: "88%", width: "100%" }}></div>
                </div>
                {/*<div id="chart6" className="overview-panel">
                    <p> Level </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>*/}
            </div>

            <div id="overview-side" style={{ width: "33%" }}>
                <div ref={svgRef} style={{ width: "100%", height: "50%" }}> </div>
                <div style={{ width: "100%", height: "50%" }}>
                    <button id="reset" class="anybutton"> Reset the Map</button>
                    <div id="overview-countriesStrDiv"><h4 id="countriesStr"></h4></div>
                    <div id="overview-menupanel">
                        <h4 id="bcopts">Dilution Factor Chart Options</h4>
                        <div id="sortingOptions">
                            <button id="byKey" onClick={() => clickedSort("key", "")}> Sort by Country Name </button>
                            <button id="byValue" onClick={() => clickedSort("value", "")}> Sort by Dilution Factor </button>
                        </div>
                    </div>
                    <div id="overview-menupanel1">
                        <h4 id="bcopts">Wastewater Discharge Chart Options</h4>
                        <div id="sortingOptions">
                            <button id="byKey1" onClick={() => clickedSort("key", "1")}> Sort by Country Name </button>
                            <button id="byValue1" onClick={() => clickedSort("value", "1")}> Sort by Wastewater Discharge </button>
                        </div>
                    </div>
                    <div id="overview-menupanel2">
                        <h4 id="bcopts"> River Discharge Chart Options</h4>
                        <div id="sortingOptions">
                            <button id="byKey2" onClick={() => clickedSort("key", "2")}> Sort by Country Name </button>
                            <button id="byValue2" onClick={() => clickedSort("value", "2")}> Sort by River Discharge </button>
                        </div>
                    </div>
                    <div id="overview-menupanel3">
                        <h4 id="bcopts">Population Served Chart Options</h4>
                        <div id="sortingOptions">
                            <button id="byKey3" onClick={() => clickedSort("key", "3")}> Sort by Country Name </button>
                            <button id="byValue3" onClick={() => clickedSort("value", "3")}> Sort by Population Served </button>
                        </div>
                    </div>
                    <div id="overview-menupanel4">
                        <h4 id="bcopts">Design Capacity Chart Options</h4>
                        <div id="sortingOptions">
                            <button id="byKey4" onClick={() => clickedSort("key", "4")}> Sort by Country Name </button>
                            <button id="byValue4" onClick={() => clickedSort("value", "4")}> Sort by Design Capacity </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview;
