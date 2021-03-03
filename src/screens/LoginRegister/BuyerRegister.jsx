import React from 'react'
import {Link} from 'react-router-dom';
import Register from '../../components/Register'
import Footer from '../../components/Footer'
import Carousel from 'react-bootstrap/Carousel'
// import '../../styles/Login.css'

function BuyerRegister ({backend, loggedIn, }) {
    return (
        <>
        <div className="buyer-login">
            {/* <Link to="/">
                <button>Back</button> 
            </Link> */}
            {/* <div id="buyer-login-register"> */}
            <Register backend={backend} loggedIn={loggedIn} buyer={true}/>
            {/* </div> */}
            <div id="buyer-carousel">
                <Carousel id="carousel" indicators={false}>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src="https://images.unsplash.com/photo-1537822427422-52c6d57db73c?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhcHRvcCUyMGFuZCUyMGNhbWVyYXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60"
                        alt="First slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src="https://images.unsplash.com/photo-1558247578-2f9456cedb33?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjN8fGxhcHRvcCUyMGFuZCUyMGNhbWVyYXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60"
                        alt="Second slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src="https://images.unsplash.com/photo-1586171680404-d9376632f9e4?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NTF8fGxhcHRvcCUyMGFuZCUyMGNhbWVyYXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60"
                        alt="Third slide"
                        />
                    </Carousel.Item>
                </Carousel>
            </div>
            
        </div>
        <Footer />
        </>
    )
}

export default BuyerRegister