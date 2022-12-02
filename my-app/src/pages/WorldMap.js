import React, { useRef, useEffect } from 'react';
import './GeoChart.css';
import DotMapComponent from '../components/DotMapComponent';

let vis;

function WorldMap({ geodata, wwtpdata }) {
    const svgRef = useRef();
    const wrapperRef = useRef();

    useEffect(initVis, [geodata, wwtpdata])

    function initVis() {
        if (geodata && wwtpdata) {
            const d3Props = {
                geodata,
                wwtpdata,
            }
            vis = new DotMapComponent(svgRef.current, d3Props);
        }
    }

    return (
        <div ref = {wrapperRef} style={{height:"1000px", width:"100%"}}>
            <div><svg ref = {svgRef} style={{height:"1000px", width:"100%"}}></svg></div>
        </div>
    )
}

export default WorldMap;
