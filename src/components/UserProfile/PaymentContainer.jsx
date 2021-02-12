import React, { useState } from 'react';
// import Modal from 'react-modal';
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

function PaymentContainer ({ backend, index, payment }) {

    const [expanded, setExpanded] = useState(false);
    // const [open, setOpen] = useState(false);
    // const [brandImage, setBrandImage] = useState('');

    const handleExpandClick = () => {
        setExpanded(!expanded);
      };

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
          <Button variant="contained">Edit</Button>
          <Button variant="contained">Delete</Button>
          </div>
        </CardContent>
      </Collapse>
    </Card>
  );

}

export default PaymentContainer