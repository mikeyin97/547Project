import React, { useRef, useEffect, useState } from 'react';
import './overview.css';
import OverviewComponent from '../components/OverviewComponent';

let vis;

function Overview({ geodata, wwtpdata, aggcounts, levelcounts, statuscounts }) {
    const wrapperRef = useRef();
    const svgRef = useRef();
    const barRef = useRef();
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(600);

    useEffect(initVis, [geodata, wwtpdata, aggcounts, levelcounts, statuscounts])

    function initVis() {
        if (geodata && wwtpdata && aggcounts) {
            const d3Props = {
                geodata,
                wwtpdata,
                aggcounts,
                levelcounts, 
                statuscounts
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
            <div id="left" style={{ width: "100%" }}><h3>Country Overview</h3>
                <div id="panel1">
                    <div ref={svgRef}> </div>
                </div>
                <div id="chart1" className="panel">
                    <p>Treated Wastewater Discharge </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
                <div id="chart2" className="panel">
                    <p> River Discharge </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
                <div id="chart3" className="panel">
                    <p> Dilution Factor </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
                <div id="chart4" className="panel">
                    <p> Design Capacity </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
                <div id="chart5" className="panel">
                    <p> Population Served </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
                <div id="chart6" className="panel">
                    <p> Level </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
                <div id="chart7" className="panel">
                    <p> Status </p>
                    <div ref={barRef} className="graph" style={{ height: "90%", width: "100%" }}></div>
                </div>
            </div>
        </div>
    )
}

export default Overview;
