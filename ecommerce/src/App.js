import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import './App.css';
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'

function App() {

  

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/">
            <Homepage />
          </Route>
          <Route path="/buyer">
            <BuyerLogin />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
