import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
// import IconButton from '@material-ui/core/IconButton';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IndividualOrder from './IndividualOrder'
import {Link} from 'react-router-dom';
import ConvertDate from './ConvertDate'

export default function Orders ({ backend, loggedIn, orderData, grabOrderData, orderID, grabOrderID}) {

    // var month = dateObj.getUTCMonth() + 1; 
    // var day = dateObj.getUTCDate();
    // var year = dateObj.getUTCFullYear();
    
    const [showOrder, setShowOrder] = useState(false)
    const [date, setDate] = useState('')
    
    console.log(22, orderData)
    
    if(!showOrder) {
        return (
            <>
            
            {orderData.length === 0 ? <p>No purchases yet, but you could become the next owner of the latest gadget!</p> : (
                orderData.map((order, index) => {
                    return (
                        <>
                        {index === 0 && <h3>{ConvertDate(orderData[0].OrderDate)}</h3>}
                        {index !==0 && ConvertDate(order.OrderDate) !== ConvertDate(orderData[index-1].OrderDate) && <h3>{ConvertDate(order.OrderDate)}</h3>}
                        <Card key={index}>
                            <CardHeader
                                action={
                                <button onClick={() => {
                                    grabOrderID(order.OrderNumber)
                                    setShowOrder(true)
                                }}>Click
                                </button>
                                }
                                title={`Order Number:  ${order.OrderNumber}`}
                                subheader={ConvertDate(order.OrderDate)}
                            />
                        </Card>
                        </>
                    )
                })
            )}
            

            </>
        )
    } else {
        return (
            <Link to={`/show-order/${orderID}`} target="_blank">
                <IndividualOrder backend={backend} loggedIn={loggedIn} orderID={orderID}/>
            </Link>
        )
    }

    
}