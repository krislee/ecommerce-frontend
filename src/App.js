import React, {useState, useEffect} from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';

import NavBar from './components/NavigationBar'
import Homepage from './screens/Homepage'
import AllItems from './screens/ElectronicItems/AllItemsPage'
import BuyerLogin from './screens/LoginRegister/BuyerLogin'
import SellerLogin from './screens/LoginRegister/SellerLogin'
import BuyerRegister from './screens/LoginRegister/BuyerRegister'
import SellerRegister from './screens/LoginRegister/SellerRegister'
import ItemPage from './screens/ElectronicItems/ItemPage';
import CartPage from './screens/Cart/CartPage';
import Checkout from './screens/Checkout/CheckoutPage'
import UserProfile from './screens/UserProfile/UserProfile'
import OrderComplete from './screens/Checkout/OrderComplete'
// STRIPE
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import 'bootstrap/dist/css/bootstrap.min.css';
// Font for Roboto
import 'fontsource-roboto';
import IndividualOrder from './screens/UserProfile/IndividualOrder';

function App() {

  /* ------- VARIABLES ------- */
  const stripePromise = loadStripe('pk_test_51HnnIMIYuoOQip6pUnsYnuXlHlEZDBIrXMRatY8FOKakcOsFN08ptoIPrHIthMNBo8n58lvQGNoh5bYAfJFmgc6R00ufne9cZV')
  const backend = `https://elecommerce.herokuapp.com`

  /* ------- STATES ------- */
  const [url, setURL] = useState('');
  const [loggedOut, setLoggedOut] = useState(false)
  const [cartID, setCartID] = useState('')
  const [orderID, setOrderID] = useState("")

  const [successfulPaymentIntent, setSuccessfulPaymentIntent] = useState({})

  /* ------- UPDATE STATES ------- */

  // Update loggedOut state if loggedIn() returns null whenever we call loggedIn function in our useEffects or on<Event> functions
  const grabLoggedOut = (loggedOut) => setLoggedOut(loggedOut)

  // grabURL gets passed to Homepage then to Item component. Item component receives both the itemURL and grabURL, and when we click on the item, grabURL is called to update the url state at App component with the itemURL. The url state gets passed to ItemPage component, which will let us fetch using that url. Using the url state to fetch to the server means we are going to the item page THROUGH the homepage.
  const grabURL = (url) => setURL(url);

  // Update the cartID state after fetching for the cart items in checkout to store the logged in or guest session cart's ID
  const grabCartID = (cartID) => setCartID(cartID)

  // Pass the orderID state to User Profile to pass it down to Order component, where the OrderID state gets updated when we click on an order
  // const grabOrderID = (orderID) => setOrderID(orderID)
  const grabSuccessfulPaymentIntent = (paymentIntent) => setSuccessfulPaymentIntent(paymentIntent)

  /* ------- CHECK IF USER IS LOGGED IN BEFORE RUNNING FUNCTIONS ------- */
   const loggedIn = () => localStorage.getItem('token')

  /* ------- NAV BAR UPDATE ------- */
  const [totalCartQuantity, setTotalCartQuantity] = useState(0)
  const grabTotalCartQuantity = (totalCartQuantity) => setTotalCartQuantity(totalCartQuantity)

  useEffect(() => {
    async function getCartItems() {
      if(localStorage.getItem('token')){
        const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        });
        const cartItemsData = await cartItemsResponse.json();
        console.log(cartItemsData.cart)
        if(typeof cartItemsData.cart == 'string') {
            grabTotalCartQuantity(0)
        } else {
          grabTotalCartQuantity(cartItemsData.cart.TotalItems)
        }
      } else {
        const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const cartItemsData = await cartItemsResponse.json();
        console.log(cartItemsData);
        if (typeof cartItemsData.cart == "string")  {
          grabTotalCartQuantity(0)
        } else {
          grabTotalCartQuantity(cartItemsData.totalItems)
        }
      }
    };
    getCartItems();
},[])

  return (
    <div className="App">
      <BrowserRouter>
      <NavBar totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} />
        <Switch>
          {/* CHECKOUT */}
          <Route path="/checkout">
            <Elements stripe={stripePromise}>
              <Checkout backend={backend} loggedIn={loggedIn} loggedOut={loggedOut} grabLoggedOut={grabLoggedOut} cartID={cartID}grabCartID={grabCartID} grabSuccessfulPaymentIntent={grabSuccessfulPaymentIntent} grabTotalCartQuantity={grabTotalCartQuantity} />
            </Elements>
          </Route>
          <Route path="/order-complete">
            <OrderComplete backend={backend} cartID={cartID} />
          </Route>
          {/* LOGIN/REGISTRATION */}
          <Route path="/login/buyer">
            <BuyerLogin backend={backend} loggedIn={loggedIn} grabTotalCartQuantity={grabTotalCartQuantity}/>
          </Route>
          <Route path="/login/seller">
            <SellerLogin backend={backend} loggedIn={loggedIn} />
          </Route>
          <Route path="/register/buyer">
            <BuyerRegister backend={backend} loggedIn={loggedIn} grabTotalCartQuantity={grabTotalCartQuantity}/>
          </Route>
          <Route path="/register/seller">
            <SellerRegister backend={backend} loggedIn={loggedIn} />
          </Route>
          {/* USER PROFILE */}
          <Route path="/profile">
            <Elements stripe={stripePromise}>
              <UserProfile backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity}
              // orderID={orderID} grabOrderID={grabOrderID} 
              />
            </Elements>
          </Route>
          <Route path="/show-order">
            <IndividualOrder backend={backend} loggedIn={loggedIn} orderID={orderID} grabTotalCartQuantity={grabTotalCartQuantity} />
          </Route>
          {/* SHOW ALL ITEMS/INDIVIDUAL ITEM */}
          <Route path="/shop/:pageIndex">
            <AllItems grabURL={grabURL} backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} />
          </Route>
          <Route path='/item'> 
            <ItemPage url={url} backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity}/>
          </Route>
          {/* CART */}
          <Route path="/cart">
            <CartPage backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} />
          </Route>

          <Route path="">
            <Homepage backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity}/>
          </Route>
        </Switch>
      </BrowserRouter>
      
    </div>
  );
}

export default App;

// https://github.com/stripe/react-stripe-elements/issues/468