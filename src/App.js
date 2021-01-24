import React, {useState} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.css';
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'
import ItemPage from './screens/ItemPage';
import CartPage from './screens/CartPage';

function App() {

  const backend = 'http://localhost:3001'
  // const backend = `https://elecommerce.herokuapp.com`

  const [url, setURL] = useState('');

  const grabURL = (url) => {
    setURL(url);
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/buyer">
            <BuyerLogin backend={backend}/>
          </Route>
          <Route path="/seller">
            <SellerLogin backend={backend}/>
          </Route>
          <Route path='/store'>
            <ItemPage url={url} backend={backend}/>
          </Route>
          <Route path="/cart">
            <CartPage backend={backend}/>
          </Route>
          <Route path="">
            <Homepage grabURL={grabURL} backend={backend}/>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
