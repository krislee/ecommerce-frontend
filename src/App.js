import React, {useState} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.css';
import Homepage from './screens/Homepage'
import BuyerLogin from './screens/BuyerLogin'
import SellerLogin from './screens/SellerLogin'
import ItemPage from './screens/ItemPage';
import CartPage from './screens/CartPage';

function App() {

  // const backend = 'http://localhost:3001'
  const backend = `https://elecommerce.herokuapp.com`

  const [url, setURL] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')

  const grabURL = (url) => {
    setURL(url);
  }

  const grabLoginInfo = (username, password, loggedIn, token) => {
    setUsername(username);
    localStorage.setItem("username", username);
    setPassword(password);
    localStorage.setItem("password", password);
    setLoggedIn(loggedIn);
    setToken(token);
    localStorage.setItem("token", token);
    console.log(username);
    console.log(password);
    console.log(token);
  }


  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
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
            <CartPage backend={backend} loggedIn={loggedIn}/>
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
