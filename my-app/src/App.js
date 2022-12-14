import React, { useRef, useEffect, useState } from 'react';
import './App.css';


import Navbar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages';
import About from './pages/about';
import Overview from './pages/overview';
import Contacts from './pages/contacts';
import GeoChart from './pages/GeoChart';
import CountrySelector from './pages/CountrySelector';
import WorldMap from './pages/WorldMap'

import geodata from "./data/customgeo.json";
import worlddata from "./data/world_map_reduced.json"
import wwtpdata from "./data/wwtpdata.json";
import status_counts from "./data/status_counts.json";
import agg_counts from "./data/agg_counts.json";
import level_counts from "./data/level_counts.json"
import level_counts_trans from "./data/level_counts_trans.json"
import agg_counts_sort from "./data/agg_counts_sort.json"

function App() {
  const [selectedCountriesStrings, setSelectedCountriesStrings] = useState(new Set());
  const [page, setPage] = useState("about")

  useEffect(() => {
    // console.log(selectedCountriesStrings);
  }, [selectedCountriesStrings]);

  return (
    <Router>
      <div className="App">
      <Navbar/>
      <Routes>
        <Route exact path='/' element={<Home/>}/>
        <Route exact path='/about' element={<About page = {page} setPage = {setPage}/>}/>
        <Route exact path='/overview' element={<Overview page = {page} setPage = {setPage} selectedCountriesStrings = {selectedCountriesStrings} setSelectedCountriesStrings = {setSelectedCountriesStrings} geodata = {geodata} wwtpdata = {wwtpdata} aggcounts = {agg_counts} levelcounts = {level_counts} statuscounts = {status_counts} aggcountssort = {agg_counts_sort}/>}/>
        <Route exact path='/comparison' element={<CountrySelector page = {page} setPage = {setPage} selectedCountriesStrings = {selectedCountriesStrings} setSelectedCountriesStrings = {setSelectedCountriesStrings} geodata = {geodata} wwtpdata = {wwtpdata} statuscounts = {status_counts} levelcounts = {level_counts} aggcounts = {agg_counts}/>}/>
        <Route exact path='/distribution' element={<GeoChart page = {page} setPage = {setPage} selectedCountriesStrings = {selectedCountriesStrings} setSelectedCountriesStrings = {setSelectedCountriesStrings} geodata = {geodata} wwtpdata = {wwtpdata} levelcountstrans = {level_counts_trans}/>}/>
        <Route exact path='/contacts' element={<Contacts/>}/>
      </Routes>
      </div>
    </Router>
  );
}

export default App;
