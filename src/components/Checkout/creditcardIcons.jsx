import React from 'react';


  
const brandImage = (cardBrand) => {
    // If the cardbrand was American Express
    if (cardBrand === 'amex') {
      return (
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" 
        alt="American Express"
        id="american-express"
        className="single-credit-card"
        />
      );
      // If the cardbrand was Cartes Bancaires
    } else if (cardBrand === 'cartes_bancaires') {
      return (
        <img src="https://upload.wikimedia.org/wikipedia/fr/7/72/Logo_GIE-CB.jpg"
        alt="Cartes Bancaires"
        id="cartes-bancaires"
        className="single-credit-card"
        />
      );
      // If the cardbrand was Diners
    } else if (cardBrand === 'diners') {
      return (
        <img 
        src="https://1000logos.net/wp-content/uploads/2020/04/Diners-Club-International-Logo.png"
        alt="Diners Club"
        id="diners-club"
        className="single-credit-card"/>
      );
      // If the cardbrand was Discover
    } else if (cardBrand === 'discover') {
      return (
        <img 
        src ="https://brandeps.com/logo-download/D/Discover-Card-logo-vector-01.svg"
        alt="Discover"
        id="discover"
        className="single-credit-card"
        />
      );
      // If the cardbrand was JCB
    } else if (cardBrand === 'jcb') {
      return (
        <img 
        src ="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/1200px-JCB_logo.svg.png"
        alt="JCB"
        id="jcb"
        className="single-credit-card"
        />
      );
      // If the cardbrand was Mastercard
    } else if (cardBrand === 'mastercard') {
      return (
        <img 
        src ="https://www.mastercard.com/content/dam/mccom/global/logos/logo-mastercard-mobile.svg"
        alt="Mastercard"
        id="mastercard"
        className="single-credit-card"
        />
      );
      // If the cardbrand was Visa
    } else if (cardBrand === 'visa') {
      return (
        <img 
        src ="https://metapay.eu/images/reference/visa.png"
        alt="Visa"
        id="visa"
        className="single-credit-card"
        />
      );
      // If the cardbrand was UnionPay
    } else if (cardBrand === 'unionpay') {
      return (
        <img 
        src ="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UnionPay_logo.svg/1200px-UnionPay_logo.svg.png"
        alt="UnionPay"
        id="unionpay"
        className="single-credit-card"
        />
      );
    };
  };

  export default brandImage