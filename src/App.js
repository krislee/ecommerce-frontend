import React, {useState} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.css';
// import './styles/Card.css'
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'
import ItemPage from './screens/ItemPage';
import CartPage from './screens/CartPage';
import Checkout from './screens/Checkout/CheckoutPage'
import UserProfile from './screens/UserProfile'
// STRIPE
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const stripePromise = loadStripe('pk_test_51HnnIMIYuoOQip6pUnsYnuXlHlEZDBIrXMRatY8FOKakcOsFN08ptoIPrHIthMNBo8n58lvQGNoh5bYAfJFmgc6R00ufne9cZV')

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

  const grabLoginInfo = async (username, loggedIn, token) => {
    // setUsername(username);
    localStorage.setItem("username", username);
    setLoggedIn(loggedIn);
    localStorage.setItem("loggedIn", loggedIn);
    setToken(token);
    localStorage.setItem("token", token);
    const cartResponse = await fetch(`${backend}/buyer/cart`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
      }
    })
    const data = await cartResponse.json();
    if(data.cart === "No cart available") {
        localStorage.setItem("cartItems", false);
    } else {
        localStorage.setItem("cartItems", true);
    }
  }


  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/checkout">
            <Elements stripe={stripePromise}>
              <Checkout backend={backend} grabPaymenIntentInfo={grabPaymenIntentInfo} paymenIntentInfo={paymenIntentInfo}/>
            </Elements>
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

// https://github.com/stripe/react-stripe-elements/issues/468