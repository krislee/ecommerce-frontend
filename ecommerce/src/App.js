import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import './App.css';
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/buyer">
            <BuyerLogin />
          </Route>
          <Route path="/seller">
            <SellerLogin />
          </Route>
          <Route path="/">
            <Homepage />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
