import React, { useState, useEffect, useRef } from 'react';
import TestComponent from '../components/TestComponent'

let vis;

export default function ReactComponent() {
  const [data, setData] = useState(null);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  const [active, setActive] = useState(null);
  const refElement = useRef(null);

  useEffect(fetchData, []);
  useEffect(handleResizeEvent, []);
  useEffect(initVis, [ data, width, height ]);
  useEffect(updateVisOnResize, [ width, height ]);

  function fetchData() {
    Promise.resolve().then(() => setData(['a', 'b', 'c']));
  }

  function handleResizeEvent() {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      }, 300);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  function initVis() {
    if(data && data.length) {
      const d3Props = {
        data,
        width,
        height,
        onDatapointClick: setActive
      };
      vis = new TestComponent(refElement.current, d3Props);
    }
  }

  function updateVisOnResize() {
    vis && vis.resize(width, height);
  }

  return (
    <div className='react-world'>
      <div>{active}</div>
      <div ref={refElement}/>
    </div>
  );
}
