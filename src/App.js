import React, {useState} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.css';
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'
import ItemPage from './screens/ItemPage';
import CartPage from './screens/CartPage';
import Checkout from './screens/Checkout/CheckoutPage'
import UserProfile from './screens/UserProfile'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import collectCard from "./components/Card";

function App() {

  // const backend = 'http://localhost:3001'
  const backend = `https://elecommerce.herokuapp.com`

  const [url, setURL] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  // const [username, setUsername] = useState('')
  // const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [paymenIntentInfo, setPaymenIntentInfo] = useState('')

  const grabURL = (url) => {
    setURL(url);
  }

  const grabPaymenIntentInfo = (paymenIntentInfo) => {
    setPaymenIntentInfo(paymenIntentInfo);
    console.log(paymenIntentInfo);
  }

  const grabLoginInfo = (username, loggedIn, token) => {
    // setUsername(username);
    localStorage.setItem("username", username);
    // setLoggedIn(loggedIn);
    localStorage.setItem("loggedIn", loggedIn);
    // setToken(token);
    localStorage.setItem("token", token);
  }


  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/checkout">
            <Checkout backend={backend} grabPaymenIntentInfo={grabPaymenIntentInfo} paymenIntentInfo={paymenIntentInfo}/>
          </Route>
          <Route path="/buyer">
            <BuyerLogin backend={backend} grabLoginInfo={grabLoginInfo}/>
          </Route>
          <Route path="/seller">
            <SellerLogin backend={backend}/>
          </Route>
          <Route path='/store'>
            <ItemPage url={url} backend={backend} loggedIn={loggedIn}/>
          </Route>
          <Route path="/cart">
            <CartPage backend={backend} loggedIn={loggedIn} />
          </Route>
          <Route path="/profile">
            <UserProfile backend={backend} loggedIn={loggedIn}/>
          </Route>
          <Route path="">
            <Homepage grabURL={grabURL} backend={backend} loggedIn={token}/>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
