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
      <h1>Hello</h1>
    </div>
  );
};
  
export default About;
