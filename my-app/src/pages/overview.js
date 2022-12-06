import React, { useRef, useEffect, useState } from 'react';
import './overview.css';
import OverviewComponent from '../components/OverviewComponent';

let vis;

function Overview({ geodata, wwtpdata, aggcounts }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const barRef = useRef();
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(600);

    useEffect(initVis, [geodata, wwtpdata, aggcounts])

    function initVis() {
        if (geodata && wwtpdata && aggcounts) {
            const d3Props = {
                geodata,
                wwtpdata,
                aggcounts
            }
            vis = new OverviewComponent(svgRef.current, d3Props);
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
        <div id="countryselector" ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            <div id="left" style={{ height: "100%", width: "90%" }}><h3>Country Overview</h3>
                <div id="panel1" className="panel">
                    <p>Treated Wastewater Discharge </p>
                    <svg ref={barRef} className="graph" style={{ height: "550px", width: "100%" }}></svg>
                </div>
                <div id="panel2" className="panel">
                    <p> River Discharge </p>
                    <svg ref={barRef} className="graph" style={{ height: "550px", width: "100%" }}></svg>
                </div>
                <div id="pane3" className="panel">
                    <p> Dilution Factor </p>
                    <svg ref={barRef} className="graph" style={{ height: "550px", width: "100%" }}></svg>
                </div>
            </div>
            <div id="right" style={{ height: "100%", width: "10%" }}><svg ref={svgRef} style={{ height: "100%", width: "100%", viewBox: "0 0 100 100" }}></svg></div>
        </div>
    )
}

export default Overview;
