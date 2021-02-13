import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../styles/UserProfile/PaymentContainer.css'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button'
// import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

function PaymentContainer ({ backend, index, payment, defaultFirstPayment, grabPaymentData }) {

    const [expanded, setExpanded] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [editModalTwoIsOpen, setEditModalTwoIsOpen] = useState(false);
    // const [disabled, setDisabled] = useState(true);
    // const [error, setError] = useState(null);
    const [editCardHolderInput, setEditCardHolderInput] = useState({});
    const [editBillingInput, setEditBillingInput] = useState({});

    const customStyles = {
      content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        zIndex: 3
      }
    };

    Modal.setAppElement('#root');

    const openEditModal = async (e) => {
      console.log(e.target.id);
      e.preventDefault();
      const onePaymentResponse = await fetch(`${backend}/order/show/payment/${cardID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        }
      });
      const paymentData = await onePaymentResponse.json();
      console.log(paymentData);
      const name = paymentData.cardholderName;
      const expDate = paymentData.expDate;
      const expDateSplit = expDate.split('/')
      const expDateMonthConversion = () => {
        if (expDateSplit[0].length === 1){
          return `0${expDateSplit[0]}`
        } else {
          return expDateSplit[0]
        }
      }
      setEditCardHolderInput({
        cardName: `${name}`,
        cardMonthExpDate: expDateMonthConversion(),
        cardYearExpDate: expDateSplit[1]
      })
      const billingDetails = paymentData.billingDetails
      const billingDetailsAddress = billingDetails.address
      const billingDetailsName = billingDetails.name.replace (/,/g, "");
      const firstName = billingDetailsName.split(" ")[0];
      const lastName = billingDetailsName.split(" ")[1];
      const firstAddressLine = billingDetailsAddress.line1;
      const secondAddressLineCheck = () => {
        if (billingDetailsAddress.line2 === 'undefined') {
          return '';
        } else {
          return billingDetailsAddress.line2;
        }
      }
      const city = billingDetailsAddress.city;
      const state = billingDetailsAddress.state;
      const zipcode = billingDetailsAddress.postalCode;
      setEditBillingInput({
        editBillingFirstName: `${firstName}`,
        editBillingLastName: `${lastName}`,
        editBillingFirstAddressLine: `${firstAddressLine}`,
        editBillingSecondAddressLine: secondAddressLineCheck(),
        editBillingCity: `${city}`,
        editBillingState: `${state}`,
        editBillingZipcode: `${zipcode}`,

      })
      console.log(paymentData);
      console.log(editCardHolderInput);
      console.log(editBillingInput);
      setEditModalIsOpen(true);
    }

    const handleEditPaymentSubmit = async (e) => {
      e.preventDefault();
      const editPaymentResponse = await fetch(`${backend}/order/update/payment/${cardID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          billingDetails: {
            line1: editBillingInput.editBillingFirstAddressLine,
            line2: editBillingInput.editBillingSecondAddressLine,
            city: editBillingInput.editBillingCity,
            state: editBillingInput.editBillingState,
            postal_code: editBillingInput.editBillingZipcode,
            country: 'US',
            name: `${editBillingInput.editBillingFirstName} ${editBillingInput.editBillingLastName}`
          },
          name: editCardHolderInput.cardName,
          recollectCVV: false,
          expMonth: editCardHolderInput.cardMonthExpDate,
          expYear: editCardHolderInput.cardYearExpDate
        })
      })
      const editPaymentData = await editPaymentResponse.json();
      console.log(editPaymentData.paymentMethods);
      defaultFirstPayment(editPaymentData.paymentMethods);
      grabPaymentData(editPaymentData.paymentMethods);
      setEditBillingInput({});
      setEditCardHolderInput({});
      handleExpandClick();
      closeEditModalTwo();
    }

    const handleDeletePayment = async (e) => {
      e.preventDefault();
      if (localStorage.getItem('token')) {
        const deletePaymentResponse = await fetch(`${backend}/order/payment/${cardID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          }
        })
        const deletePaymentData = await deletePaymentResponse.json();
        defaultFirstPayment(deletePaymentData.paymentMethods);
        grabPaymentData(deletePaymentData.paymentMethods);
        handleExpandClick();
        closeEditModalTwo();
      }
    }

    const closeEditModal = () => {
      setEditModalIsOpen(false);
    }

    const openEditModalTwo = (e) => {
      e.preventDefault();
      setEditModalTwoIsOpen(true);
    }

    const closeEditModalTwo = () => {
      setEditModalTwoIsOpen(false);
      setEditModalIsOpen(false);
    }

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

  const handleEditCardHolderNameChange = (e) => {
    const { name, value } = e.target
    setEditCardHolderInput((prevEditCardHolder) => ({
        ...prevEditCardHolder, [name] : value
    }))
  }

  const handleEditBillingChange = (e) => {
    const { name, value } = e.target
    setEditBillingInput((prevEditBilling) => ({
        ...prevEditBilling, [name] : value
    }))
  }



    const useStyles = makeStyles((theme) => ({
        root: {
          width: '100%',
          backgroundColor: '#e8e8e8'
        },
        header: {
          cursor: 'pointer'
        },
        avatar: {
          backgroundColor: '#e8e8e8',
          position: 'static'
        },
        avatarVisa: {
          backgroundColor: '#14287F',
          position: 'static'
        },
        avatarJCB: {
          backgroundColor: '#fff',
          position: 'static'
        },
        expirationDate: {
          paddingTop: '0.5rem',
          paddingBottom: '1rem !important',
          cursor: 'pointer'
        },
        collapsedContent: {
          borderTop: '1px solid #c8c8c8',
          backgroundColor: '#fff'
        }
      }));

    const classes = useStyles();

    const backgroundStyling = {
      backgroundSize: 'cover',
      height: '100%',
      width: '100%'
    }

    // Regular card information
    const cardHolderName = payment.cardholderName;
    const cardBrand = payment.brand
    const expirationDate = payment.expDate;
    const cardID = payment.paymentMethodID;
    const lastFourDigitsOfCard = `Card ending in ${payment.last4}`;
    // Billing information variables
    const billingInfo = payment.billingDetails
    const billingName = billingInfo.name.split(',');
    const billingAddress = () => {
      if (billingInfo.address.line2 === 'undefined') {
        return `${billingInfo.address.line1}`
      } else {
        return `${billingInfo.address.line1} ${billingInfo.address.line2}`
      }
    }
    const billingAddressTwo = `${billingInfo.address.city.trim()}, ${billingInfo.address.state} ${billingInfo.address.postalCode}`
    const billingAddressCountry = `${billingInfo.address.country}`
    const defaultCard = payment.default;

    const brandImage = () => {
      if (cardBrand === 'amex') {
        return (
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" 
          alt="American Express"
          style={backgroundStyling}/>
        )
      } else if (cardBrand === 'cartes_bancaires') {
        return (
          <img src="https://upload.wikimedia.org/wikipedia/fr/7/72/Logo_GIE-CB.jpg"
          alt="Cartes Bancaires"
          style={backgroundStyling}/>
        )
      } else if (cardBrand === 'diners') {
        return (
          <img 
          src="https://1000logos.net/wp-content/uploads/2020/04/Diners-Club-International-Logo.png"
          alt="Diners Club"
          style={{height: '60%'}}/>
        )
      } else if (cardBrand === 'discover') {
        return (
          <img 
          src ="https://brandeps.com/logo-download/D/Discover-Card-logo-vector-01.svg"
          alt="Discover"
          style={backgroundStyling}/>
        )
      } else if (cardBrand === 'jcb') {
        return (
          <img 
          src ="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/1200px-JCB_logo.svg.png"
          alt="JCB"
          style={{height: '80%', width: '80%'}}/>
        )
      } else if (cardBrand === 'mastercard') {
        return (
          <img 
          src ="https://www.mastercard.com/content/dam/mccom/global/logos/logo-mastercard-mobile.svg"
          alt="Mastercard"
          style={{height: '60%'}}/>
        )
      } else if (cardBrand === 'visa') {
        return (
          <img 
          src ="https://metapay.eu/images/reference/visa.png"
          alt="Visa"
          style={{height: '70%'}}/>
        )
      } else if (cardBrand === 'unionpay') {
        return (
          <img 
          src ="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UnionPay_logo.svg/1200px-UnionPay_logo.svg.png"
          alt="UnionPay"
          style={{height: '50%'}}/>
        )
      }
    }


    return (
      <>
        <Card className={classes.root}>
        <CardHeader
          className={classes.header}
          onClick={handleExpandClick}
          avatar={
            <Avatar className={cardBrand === 'visa' ? classes.avatarVisa : cardBrand ===  'jcb' ? classes.avatarJCB : classes.avatar}>
              {brandImage()}
            </Avatar>
          }
          action={
            <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          }
          title={cardHolderName}
          subheader={lastFourDigitsOfCard}
        />
        <CardContent className={classes.expirationDate} onClick={handleExpandClick}>
          {defaultCard && <div className="default-payment-indicator">Default </div>}
          <Typography variant="body2" color="textSecondary" component="p">
            {expirationDate.length === 6 ? `Expires: 0${expirationDate}` : `Expires: ${expirationDate}`}
          </Typography>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent className={classes.collapsedContent}>
            <Typography paragraph>Billing Address:</Typography>
            <Typography paragraph>
              {billingName} <br/>
              {billingAddress()} <br/>
              {billingAddressTwo} <br/>
              {billingAddressCountry}
            </Typography>
            <div className="update-buttons">
            <Button variant="contained" onClick={openEditModal}>Edit</Button>
            <Button variant="contained" onClick={handleDeletePayment}>Delete</Button>
            </div>
          </CardContent>
        </Collapse>
      </Card>
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        style={customStyles}
        contentLabel="Edit Card Information Modal"
        >
        <form className="form">
        <h2>Edit Your Card Information</h2>
        <input 
        value={editCardHolderInput.cardName || ""} 
        name="cardName" 
        placeholder="Card Name" 
        onChange={handleEditCardHolderNameChange}/>
        <input 
        value={editCardHolderInput.cardMonthExpDate || ""} name="cardMonthExpDate" 
        placeholder="Month" 
        onChange={handleEditCardHolderNameChange}/>
        <input 
        value={editCardHolderInput.cardYearExpDate || ""} name="cardYearExpDate" 
        placeholder="Year" 
        onChange={handleEditCardHolderNameChange}/>
        <button onClick={openEditModalTwo} >
            Next
        </button>
        </form>
      </Modal>
      <Modal
          isOpen={editModalTwoIsOpen}
          onRequestClose={closeEditModalTwo}
          style={customStyles}
          contentLabel="Edit Payment Modal"
          >
          <form className="form">
          <h2>Edit Your Card Information</h2>
          <input value={editBillingInput.editBillingFirstName || ""} name="editBillingFirstName" placeholder="First Name" onChange={handleEditBillingChange}/>
          <input value={editBillingInput.editBillingLastName || ""} name="editBillingLastName" placeholder="Last Name" onChange={handleEditBillingChange}/>
          <input value={editBillingInput.editBillingFirstAddressLine || ""} name="editBillingFirstAddressLine" placeholder="Address Line One" onChange={handleEditBillingChange}/>
          <input value={editBillingInput.editBillingSecondAddressLine || ""} name="editBillingSecondAddressLine" placeholder="Address Line Two" onChange={handleEditBillingChange}/>
          <input value={editBillingInput.editBillingCity || ""} name="editBillingCity" placeholder="City" onChange={handleEditBillingChange}/>
          <input value={editBillingInput.editBillingState || ""} name="editBillingState" placeholder="State" onChange={handleEditBillingChange}/>
          <input value={editBillingInput.editBillingZipcode || ""} name="editBillingZipcode" placeholder="Zipcode" onChange={handleEditBillingChange}/>
          <button onClick={handleEditPaymentSubmit} 
          disabled={!editBillingInput.editBillingFirstName || !editBillingInput.editBillingLastName || !editBillingInput.editBillingFirstAddressLine || !editBillingInput.editBillingCity || !editBillingInput.editBillingState || !editBillingInput.editBillingZipcode}>
              Submit
          </button>
          </form>
      </Modal>
    </>
  );

}

export default PaymentContainer