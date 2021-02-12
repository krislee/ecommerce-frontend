import React, {useState} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.css';
// import './styles/Card.css'
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'
import ItemPage from './screens/ItemPage';
import CartPage from './screens/Cart/CartPage';
import Checkout from './screens/Checkout/CheckoutPage'
import UserProfile from './screens/UserProfile/UserProfile'
// STRIPE
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import 'bootstrap/dist/css/bootstrap.min.css';
// Font for Roboto
import 'fontsource-roboto';

function App() {

   /* ------- VARIABLES ------- */
  const stripePromise = loadStripe('pk_test_51HnnIMIYuoOQip6pUnsYnuXlHlEZDBIrXMRatY8FOKakcOsFN08ptoIPrHIthMNBo8n58lvQGNoh5bYAfJFmgc6R00ufne9cZV')
  const backend = `https://elecommerce.herokuapp.com`

   /* ------- STATES ------- */
  const [url, setURL] = useState('');
  const [loggedOut, setLoggedOut] = useState(false)

   /* ------- UPDATE STATES ------- */

  // Update loggedOut state if loggedIn() returns null whenever we call loggedIn function in our useEffects or on<Event> functions
  const grabLoggedOut = (loggedOut) => setLoggedOut(loggedOut)

  // grabURL gets passed to Homepage then to Item component. Item component receives both the itemURL and grabURL, and when we click on the item, grabURL is called to update the url state at App component with the itemURL. The url state gets passed to ItemPage component, which will let us fetch using that url. Using the url state to fetch to the server means we are going to the item page THROUGH the homepage.
  const grabURL = (url) => {
    setURL(url);
  }
   /* ------- CHECK IF USER IS LOGGED IN BEFORE RUNNING FUNCTIONS ------- */
   const loggedIn = () => localStorage.getItem('token')

  const grabLoginInfo = async (token) => {
    localStorage.setItem("token", token);
    const cartResponse = await fetch(`${backend}/buyer/cart`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': loggedIn()
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
              <Checkout backend={backend} loggedIn={loggedIn} loggedOut={loggedOut} grabLoggedOut={grabLoggedOut}/>
            </Elements>
          </Route>
          <Route path="/buyer">
            <BuyerLogin backend={backend} loggedIn={loggedIn} grabLoginInfo={grabLoginInfo}/>
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
            <Elements stripe={stripePromise}>
              <UserProfile backend={backend} loggedIn={loggedIn}/>
            </Elements>
          </Route>
          <Route path="">
            <Homepage grabURL={grabURL} backend={backend} loggedIn={loggedIn}/>
          </Route>
        </Switch>
      </BrowserRouter>
      
    </div>
  );
}

export default App;

// https://github.com/stripe/react-stripe-elements/issues/468