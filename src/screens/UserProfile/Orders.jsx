import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IndividualOrder from './IndividualOrder'
import {Link} from 'react-router-dom';
import ConvertDate from './ConvertDate'

export default function Orders ({ backend, orderData, grabOrderData, orderID, grabOrderID}) {

    // var month = dateObj.getUTCMonth() + 1; 
    // var day = dateObj.getUTCDate();
    // var year = dateObj.getUTCFullYear();
    
    const [showOrder, setShowOrder] = useState(false)
    
    console.log(22, orderData)
    
    if(!showOrder) {
        return (
            <>
            
            {orderData.length == 0 ? <p>No purchases yet, but you could become the next owner of the latest gadget!</p> : (
                orderData.map((orderData, index) => {return (
                    <Card key={index}>
                        <CardHeader
                            action={
                            <button onClick={() => {
                                grabOrderID(orderData.OrderNumber)
                                setShowOrder(true)
                            }}>Click
                                {/* <ExpandMoreIcon /> */}
                            </button>
                            }
                            title={`Order Number:  ${orderData.OrderNumber}`}
                            subheader={ConvertDate(orderData.OrderDate)}
                        />
                    </Card>
                )})
            )}
            

            </>
        )
    } else {
        return (
            <Link to={`/show-order/${orderID}`}>
                <IndividualOrder backend={backend} orderID={orderID}/>
            </Link>
        )
    }

    
}