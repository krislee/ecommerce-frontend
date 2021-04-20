import React, { useState } from 'react';
import Modal from 'react-modal';
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast'
import ReviewForm from '../Reviews/ReviewForm'

export default function AddReviewButton ({ backend, loggedIn, electronicID, grabReview, grabTotalCartQuantity }) {

    const [showReviewForm, setShowReviewForm] = useState(false)
    const [disableSubmit, setDisableSubmit] = useState(false)

    // ERROR STATES WHEN CREATING REVIEWS
    const [reviewError, setReviewError] = useState(false)
    const [unverifiedReviewError, setUnverifiedReviewError] = useState(false)
    const [loginToReview, setLoginToReview] = useState(false)

    // RATING AND COMMENTS STATES
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingHover, setRatingHover] = useState(-1);
    const [commentsValue, setCommentsValue] = useState("")


    const grabRatingValue = (rating) => setRatingValue(rating)
    const grabRatingHover =(rating) => setRatingHover(rating)

    const handleCommentsChange = (event) => {
        if(!loggedIn()) {
            closeReviewModal()
            return grabTotalCartQuantity(0)
        }
        setCommentsValue(event.target.value)
    }


    const submitReview = async(event) => {
        event.preventDefault()

        setDisableSubmit(true) // disable button after clicking submit once (we do not want to submit more than once)

        if(loggedIn()) {
            const submitReviewResponse = await fetch(`${backend}/buyer/electronic/review/${electronicID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({
                    Comment: commentsValue,
                    Rating: ratingValue
                })
            })
            const submitReviewData = await submitReviewResponse.json()
            console.log(submitReviewData)
            
            if(submitReviewData.unverifiedReviewMessage) {
                setUnverifiedReviewError(true) // show an alert for the error if there is an error message
            } else if(submitReviewData.secondReviewMessage) {
                setReviewError(true) // show an alert for the error if there is an error message
            }else {
                grabReview(submitReviewData) // update the review, which will re-run UseEffect to get the electronic again to get the reviews
            }
        } else {
            setLoginToReview(true)
            grabTotalCartQuantity(0) // reloads the page, and updates nav bar if user is logged out/cleared local storage when trying to click Submit for adding Review
        }

        // Reset everything after we submit review
        closeReviewModal()
    }
 
    const closeReviewModal = () => {
        // Reset everything:
        setShowReviewForm(false) // close the modal
        grabRatingValue(5) // reset rating to be 5 stars
        setCommentsValue("") //clear comments
        setDisableSubmit(false)
        if(!loggedIn()) grabTotalCartQuantity(0)
    }

    return(
        <>
        {!showReviewForm && <Button size="sm" variant="dark" onClick={() => {
            if(!loggedIn()) {
                setLoginToReview(true)
                return grabTotalCartQuantity(0)
            }
            setShowReviewForm(true)
        }}>Write a review</Button>}
        
        <Modal isOpen={showReviewForm} onRequestClose={closeReviewModal} ariaHideApp={false} contentLabel="Create Review">
            <form id="add-review-form" onSubmit={submitReview}>
                <ReviewForm ratingValue={ratingValue} grabRatingValue={grabRatingValue} ratingHover={ratingHover} grabRatingHover={grabRatingHover} commentsValue={commentsValue} handleCommentsChange={handleCommentsChange}/>
                <div id="add-review-button-container">
                    <Button type="button" variant="dark" size="lg" onClick={closeReviewModal}>Close</Button>
                    <Button type="submit" variant="dark" size="lg" disabled={ !commentsValue || disableSubmit }>Submit</Button>
                </div>
                
            </form>
        </Modal>

        <Toast onClose={() => setReviewError(false)} show={reviewError} 
        // delay={3000} autohide
        >
            <Toast.Body>You have already made a review for this item.</Toast.Body>
        </Toast>

        <Toast onClose={() => setUnverifiedReviewError(false)} show={unverifiedReviewError} 
        // delay={3000} autohide
        >
            <Toast.Body>Please write a review on any verfied purchased items.</Toast.Body>
        </Toast>

        <Toast onClose={() => setLoginToReview(false)} show={loginToReview} delay={3000} autohide>
            <Toast.Body>Please login to review.</Toast.Body>
        </Toast>
        
        </>
    )
}