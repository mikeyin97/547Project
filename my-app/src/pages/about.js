import React, { useRef, useEffect, useState } from 'react';
  
function About({page, setPage}) {
  
  useEffect(() => {
    setPage("About")
  });

  return (
    <div
    style={{
      display: 'flex',
      justifyContent: 'Left',
      alignItems: 'Left',
      height: '10vh'
    }}
    >
      <h1>About Wastewater Treatment Plant Visualizer (WWTP)</h1>
      <p> blah blah</p>

      <h1>Usage Guide</h1>
    </div>
  );
};
  
export default About;
