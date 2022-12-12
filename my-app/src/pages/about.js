import React, { useRef, useEffect, useState } from 'react';
import './About.css';
  
function About({page, setPage}) {
  
  useEffect(() => {
    setPage("About")
  });

  return (
    <div>


      <div class = "aboutitle header">
        <h1 >About <span id = "title"> Wastewater Treatment Plant (WWTP) Visualizer </span></h1>
        <p>Goal: This dashboard allows users to compare and contrast WWTP metrics across countries to better understand patterns and trends across WWTP variables. <br></br><br></br>
        There are three main pages: <br></br><br></br>
        - <span id = "title">Overview </span>: Users can compare WWTP metrics across a global distribution, to see where specific countries lie in comparison to the rest of the world. <br></br>
        - <span id = "title">Comparison </span>: Users can compare WWTP metrics across a filtered set for more detailed comparison across a smaller set of countries. <br></br>
        - <span id = "title">Global Distribution </span>: Users can view the distribution of WWTPs across the world on a spatial map and on a distribution graph.<br></br>
        </p>

      </div>

      <div class = "aboutitle">
      <h1>Features</h1>
      <p> 
      - Graphs and map are linked, hovering over one highlights the other, allowing users to quickly pick out the mark of interest on the graph. <br></br>
      - Selected countries are synced across views, e.g. selecting countries on the "Overview" panel can allow them to carry over into the "Comparison", facilitating efficient comparison between countries of interest. 
      </p>

      </div>
    </div>

  );
};
  
export default About;
