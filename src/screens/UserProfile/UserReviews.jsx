import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
import ReviewForm from '../../components/Reviews/ReviewForm'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },
}));

export default function UserReviews({ backend, loggedIn, reviewData, grabReviewData }) {
    const classes = useStyles();
    
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [reviewID, setReviewID] = useState('')
    const [editReviewForm, setEditReviewForm] = useState(false)
    const [deleteReviewForm, setDeleteReviewForm] = useState(false)

    const [brandName, setBrandName] = useState('')
    const [itemName, setItemName] = useState('')

    const [ratingValue, setRatingValue] = useState(5)
    const [ratingHover, setRatingHover] = useState(-1)
    const [commentsValue, setCommentsValue] = useState('')

    // pass grabRatingValue and grabRatingHover to ReviewForm and Rating component inside ReviewForm component for onChange callback
    const grabRatingValue = (rating) => setRatingValue(rating)
    const grabRatingHover = (rating) => setRatingHover(rating)
    const handleCommentsChange = (event) => setCommentsValue(event.target.value)

    const openUpdateReviewModal = async (event) => {
        console.log(event.target.id)
        const retrieveOneReviewResponse = await fetch(`${backend}/buyer/electronic/review/${event.target.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        })
        const retrieveOneReviewData = await retrieveOneReviewResponse.json()
        console.log(retrieveOneReviewData)

        setRatingValue(retrieveOneReviewData.singleReview.Rating) // update the rating state --> pass to ReviewForm and Rating component inside ReviewForm component --> prefill the rating stars section
        setCommentsValue(retrieveOneReviewData.singleReview.Comment) // update the comments --> pass to ReviewForm and Rating component --> prefill the comment section
        setBrandName(retrieveOneReviewData.singleReview.ElectronicItem[0].Brand) // update the brand and item name to populate in the modal
        setItemName(retrieveOneReviewData.singleReview.ElectronicItem[0].Name)
        setReviewID(event.target.id) // reviewID state is used for the Submit button
        setEditReviewForm(true) // open the modal

    }

    // const closeUpdateReviewModal =() => {
        // setReviewID('')
        // setEditReviewForm(false)
    // }

    const handleUpdateReview = async(event) => {
        event.preventDefault()
        const updateReviewResponse = await fetch(`${backend}/buyer/electronic/review/${reviewID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            },
            body: JSON.stringify({
                Comment: commentsValue,
                Rating: ratingValue
            })
        })
        const updateReviewData = await updateReviewResponse.json()
        console.log(updateReviewData)
        grabReviewData(updateReviewData.allReviews) // update the reviewData state with the new list of reviews that includes the updated review
        setEditReviewForm(false)
    }

    const handleDeleteReview = async(event) => {
        const deleteReviewResponse = await fetch(`${backend}/buyer/electronic/review/${reviewID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            },
        })
        const deletedReviewData = await deleteReviewResponse.json()
        console.log(deletedReviewData)
        grabReviewData(deletedReviewData.allReviews)
        setDeleteReviewForm(false)
    }

    return (
        <>
            {reviewData.map((review, index) => { return (
                <div className={classes.root} key={index} >
                    <p><b>{review.ElectronicItem[0].Brand} {review.ElectronicItem[0].Name}</b></p>
                    <Rating name="size-small" value={review.Rating} size="small" readOnly/>
                    <p>{review.Comment}</p>
                    <button id={review._id} onClick={openUpdateReviewModal}>Update</button>
                    <button id={review._id} onClick={(event) => {
                        console.log("delete")
                        setReviewID(event.target.id)
                        setDeleteReviewForm(true)
                    }}>Delete</button>
                </div>
            )})}
            {editReviewForm && (
                <Modal isOpen={editReviewForm} onRequestClose={() => setEditReviewForm(false)} ariaHideApp={false} contentLabel="Edit Review">
                    <form onSubmit={handleUpdateReview}>
                        <p><b>{brandName} {itemName} </b></p>
                        <ReviewForm ratingValue={ratingValue} grabRatingValue={grabRatingValue} ratingHover={ratingHover} grabRatingHover={grabRatingHover} commentsValue={commentsValue} handleCommentsChange={handleCommentsChange} />
                        <button>Submit</button>
                    </form>
                </Modal>
            )}
            {deleteReviewForm && (
                <Modal isOpen={deleteReviewForm} onRequestClose={() => setDeleteReviewForm(false)} ariaHideApp={false} contentLabel="Delete Review">
                    <p><b>Are you sure you want to delete?</b></p>
                    <button onClick={handleDeleteReview}>Yes</button>
                    <button onClick={() => setDeleteReviewForm(false)}>Cancel</button>
                </Modal>
            )}
        </>
    )
    
}