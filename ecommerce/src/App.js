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
          <Route path="/buyer" exact component={BuyerLogin} />
          <Route path="/seller" exact component={SellerLogin} />
          {/* <Route path="/store" exact component={SellerLogin} /> */}
          <Route path="" exact component={Homepage} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
