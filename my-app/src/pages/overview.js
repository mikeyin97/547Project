import React, { useRef, useEffect, useState } from 'react';
import './overview.css';
import OverviewComponent from '../components/OverviewComponent';

let vis;

function Overview({ page, setPage, selectedCountriesStrings, setSelectedCountriesStrings, geodata, wwtpdata, aggcounts, levelcounts, statuscounts, aggcountssort }) {
    const wrapperRef = useRef();
    const svgRef = useRef();
    const barRef = useRef();
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(600)
    const [hoveredCountry, setHoveredCountry] = useState(null);

    useEffect(initVis, [geodata, wwtpdata, aggcounts, levelcounts, statuscounts, aggcountssort, setHoveredCountry]);
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
                setHoveredCountry
            }
            vis = new OverviewComponent(svgRef.current, barRef.current, d3Props);
        }
    }

    function handleResizeEvent() {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                setWidth(window.innerWidth);
                setHeight(window.innerHeight);
            }, 300);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }

    function updateVisOnResize() {
        vis && vis.resize(width, height);
    }


    return (
        <div id="overview" ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            <div id="overview-main" style={{ width: "67%" }}><h3>Country Overview</h3>
                <div id="chart1" className="overview-panel">
                    <div ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></div>
                </div>
                <div id="chart2" className="overview-panel">
                    <div ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></div>
                </div>
                <div id="chart3" className="overview-panel">
                    <div ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></div>
                </div>
                <div id="chart4" className="overview-panel">
                    <div ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></div>
                </div>
                <div id="chart5" className="overview-panel">
                    <div ref={barRef} className="graph" style={{ height: "100%", width: "100%" }}></div>
                </div>
                {/*<div id="chart6" className="overview-panel">
                    <p> Level </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>*/}
            </div>
            <div id="overview-side" style={{ width: "33%" }}>
                <div ref={svgRef} style={{ width: "100%", height: "50%" }}> </div>
                <div style={{ width: "100%", height: "50%" }}>
                    <button id="byKey"> Sort by Country Name </button>
                    <button id="byValue"> Sort by Water Discharge</button>
                    <button id="byKey1"> Sort by Country Name </button>
                    <button id="byValue1"> Sort by River Discharge </button>
                    <button id="byKey2"> Sort by Country Name </button>
                    <button id="byValue2"> Sort by Dilution Factor </button>
                    <button id="byKey3"> Sort by Country Name </button>
                    <button id="byValue3"> Sort by Design Capacity </button>
                    <button id="byKey4"> Sort by Country Name </button>
                    <button id="byValue4"> Sort by Population Served </button>
                </div>
            </div>
        </div>
    )
}

export default Overview;
