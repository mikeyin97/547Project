import React, {useState} from 'react';
import GeoChart from './components/GeoChart';
import CountrySelector from './components/CountrySelector';
import geodata from "./customgeo.json";
import wwtpdata from "./wwtpdata.json";
import wwtpdatatest from "./wwtpdatatest.json";
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Wastewater Treatement Visualization</h1>
      {/* <GeoChart geodata = {geodata} wwtpdata = {wwtpdata}/> */}
      <CountrySelector geodata = {geodata} wwtpdata = {wwtpdata}/>
    </div>
  );
}

export default App;