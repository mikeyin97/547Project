import React, {useState} from 'react';
import GeoChart from './components/GeoChart';
import CountrySelector from './components/CountrySelector';
import geodata from "./customgeo.json";
import wwtpdata from "./wwtpdata.json";
import status_counts from "./status_counts.json";
import agg_counts from "./agg_counts.json";
import level_counts from "./level_counts.json";
import wwtpdatatest from "./wwtpdatatest.json";
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Wastewater Treatment Visualization</h1>
      {/* <GeoChart geodata = {geodata} wwtpdata = {wwtpdata}/> */}
      <CountrySelector geodata = {geodata} wwtpdata = {wwtpdata} statuscounts = {status_counts} levelcounts = {level_counts} aggcounts = {agg_counts}/>
    </div>
  );
}

export default App;