import React, { useState } from 'react';
import Modal from 'react-modal';
import Toast from 'react-bootstrap/Toast'
import '../../styles/Button.css'
import ReviewForm from '../Reviews/ReviewForm'


// name, comment, rating, id
export default function AddReviewButton ({ backend, loggedIn, electronicID, grabReview }) {

    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewError, setReviewError] = useState(false)
    const [unverifiedReviewError, setUnverifiedReviewError] = useState(false)
    const [loginToReview, setLoginToReview] = useState(false)
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingHover, setRatingHover] = useState(-1);
    const [commentsValue, setCommentsValue] = useState("")

    const grabRatingValue = (rating) => setRatingValue(rating)
    const grabRatingHover =(rating) => setRatingHover(rating)

    const handleCommentsChange = (event) => setCommentsValue(event.target.value)

    const submitReview = async(event) => {
        event.preventDefault()

        console.log(19, commentsValue)
        console.log(20, ratingValue)

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
                setReviewError(true)
            }else {
                grabReview(submitReviewData) // update the review, which will re-run UseEffect to get the electronic again to get the reviews
            }
        } else {
            setLoginToReview(true)
        }

        // Reset everything when we close modal:
        closeReviewModal()
    }

    const closeReviewModal = () => {
        // Reset everything:
        setShowReviewForm(false) // close the modal
        grabRatingValue(5) // reset rating to be 5 stars
        setCommentsValue("") //clear comments
    }

    return(
        <>
        {!showReviewForm && <button onClick={() => setShowReviewForm(true)}>Write a review</button>}
        
        <Modal isOpen={showReviewForm} onRequestClose={closeReviewModal} ariaHideApp={false} contentLabel="Create Review">
            <form onSubmit={submitReview}>
                <ReviewForm ratingValue={ratingValue} grabRatingValue={grabRatingValue} ratingHover={ratingHover} grabRatingHover={grabRatingHover} commentsValue={commentsValue} handleCommentsChange={handleCommentsChange}/>
                <button>Submit</button>
                <button type="button" onClick={closeReviewModal}>Close</button>
            </form>
        </Modal>

        <Toast onClose={() => setReviewError(false)} show={reviewError} delay={3000} autohide>
            <Toast.Body>You have already made a review for this item.</Toast.Body>
        </Toast>

        <Toast onClose={() => setUnverifiedReviewError(false)} show={unverifiedReviewError} delay={3000} autohide>
            <Toast.Body>Please write a review on any verfied purchased items.</Toast.Body>
        </Toast>

        <Toast onClose={() => setLoginToReview(false)} show={loginToReview} delay={3000} autohide>
            <Toast.Body>Please login to review.</Toast.Body>
        </Toast>
      
        </>
    )
}