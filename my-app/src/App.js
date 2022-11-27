import React from 'react';
import './App.css';

import Navbar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages';
import About from './pages/about';
import Overview from './pages/overview';
import Contacts from './pages/contacts';
import GeoChart from './pages/GeoChart';
import CountrySelector from './pages/CountrySelector';

import geodata from "./data/customgeo.json";
import wwtpdata from "./data/wwtpdata.json";
import status_counts from "./data/status_counts.json";
import agg_counts from "./data/agg_counts.json";
import level_counts from "./data/level_counts.json";

function App() {
  return (
    <Router>
      <div className="App">
      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/about' element={<About/>} />
        <Route exact path='/overview' element={<Overview/>} />
        <Route exact path='/comparison' element={<CountrySelector geodata = {geodata} wwtpdata = {wwtpdata} statuscounts = {status_counts} levelcounts = {level_counts} aggcounts = {agg_counts}/>} />
        <Route exact path='/distribution' element={<GeoChart geodata = {geodata} wwtpdata = {wwtpdata}/>} />
        <Route exact path='/contacts' element={<Contacts/>} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
