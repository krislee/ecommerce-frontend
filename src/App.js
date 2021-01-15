import React, {useState} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.css';
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'
import ItemPage from './screens/ItemPage';
import CartPage from './screens/CartPage';

function App() {

  const localURL = 'http://localhost:3001'

  const [url, setURL] = useState('');

  const grabURL = (url) => {
    setURL(url);
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/buyer" exact component={BuyerLogin} />
          <Route path="/seller" exact component={SellerLogin} />
          <Route path='/store'>
            <ItemPage url={url}/>
          </Route>
          <Route path="/cart">
            <CartPage url={localURL}/>
          </Route>
          <Route path="">
            <Homepage grabURL={grabURL}/>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
