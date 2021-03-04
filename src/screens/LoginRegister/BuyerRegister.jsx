import React from 'react'
import Register from '../../components/LoginRegister/Register'
import Footer from '../../components/Footer'
import Carousel from 'react-bootstrap/Carousel'
import '../../styles/LoginRegister/Register.css'

function BuyerRegister ({backend, loggedIn, }) {
    return (
        <>
        <div className="buyer-register">
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
                        src={require("../../styles/LoginRegister/images/register1.png")}
                        alt="First slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src={require("../../styles/LoginRegister/images/register3.png")}
                        alt="Second slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src={require("../../styles/LoginRegister/images/register2.png")}
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