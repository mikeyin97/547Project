import React, { useRef, useEffect } from 'react';
import './GeoChart.css';
import OverviewComponent from '../components/OverviewComponent';

let vis;

function Overview({ geodata, wwtpdata, aggcounts }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const barRef = useRef();

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

    return (
        <div id="countryselector" ref={wrapperRef} style={{ height: "100%", width: "100%" }}>
            <div id="left" style={{ height: "90%", width: "82%" }}><h3>Country Overview</h3>
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
            <div id="right" style={{ height: "100%", width: "18%" }}><svg ref={svgRef} style={{ height: "100%", width: "100%", viewBox: "0 0 100 100" }}></svg></div>
        </div>
    )
}

export default Overview;
