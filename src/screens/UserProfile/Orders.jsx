import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { Link, useHistory } from 'react-router-dom';
// import ConvertDate from './ConvertDate'
import { makeStyles } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';
import '../../styles/UserProfile/OrderContainer.css'

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        marginTop: theme.spacing(2),
      },
    },
}));

export default function Orders ({ backend, loggedIn, orderData, grabOrderData, ordersTotal, ordersPage, grabOrdersPage, orderLoading, grabTotalCartQuantity }) {

    const classes = useStyles();
    const history = useHistory()

    // When a page number is clicked, the onChange function aka handlePageOnChange runs (similar to how we handle input changes)
    const handlePageOnChange = async(event, page) => {

        history.replace({
            pathname: `/profile/order?page=${page}` // when we click on the pagination number, we want to update the URL param with the clicked pagination number (represented by page)
        })
        if(loggedIn()) {
            const nextPageOrdersResponse = await fetch(`${backend}/complete/list/orders?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })
            const nextPageOrdersData = await nextPageOrdersResponse.json();
            console.log(nextPageOrdersData.orders);
            grabOrderData(nextPageOrdersData.orders) // update orderData state to contain the new list of orders
            grabOrdersPage(page) // highlight the pagination number when we click on it; to do this Pagination component has a page state, whose value is a number; when you provide a page state, the number gets highlighted; since page state's value equals to ordersPage state, we need to update ordersPage state with the page # clicked
        } else {
            console.log(41)
            return grabTotalCartQuantity(0)
        }
    }

    if(orderLoading) return null
    return (
        <>
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            padding: '1rem',
        }}>
        <header style={{
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '2rem'
        }}>Orders</header>
        </div>
        {orderData.length === 0 ? <p>No purchases yet, but you could become the next owner of the latest gadget!</p> : (
            <div className="orders">
            {orderData.map((order, index) => {
                return (
                    <div className="order-container" key={index}>
                    {index === 0 && <div className="date-and-time">{new Date((orderData[0].OrderDate)).toDateString()}</div>}
                    {index !== 0 && new Date(order.OrderDate).toDateString() !== new Date(orderData[index-1].OrderDate).toDateString() && <div className="date-and-time">{new Date(order.OrderDate).toDateString()}</div>}
                    <Link to={{
                        pathname: "/order",
                        search: `orderNumber=${order.OrderNumber}`,
                    }}>
                        <Card className={classes.container}>
                            <CardHeader
                                title={`Order: ${order.OrderNumber}`}
                                subheader={new Date(order.OrderDate).toDateString()}
                            />
                        </Card>
                    </Link>
                    </div>
                )
            })}
            <div className={classes.root}>
                <Pagination showFirstButton showLastButton size="large" variant="outlined" shape="rounded" count={ordersTotal} page={Number(ordersPage)} siblingCount={1} boundaryCount={2} onChange={handlePageOnChange} />
            </div>  
            </div>

        )}
        </>
    )
   

    
}