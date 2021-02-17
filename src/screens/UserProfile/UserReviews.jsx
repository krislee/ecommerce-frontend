import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
import ReviewForm from '../../components/Reviews/ReviewForm'
import { Pagination, PaginationItem } from '@material-ui/lab';

const paginationUseStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        marginTop: theme.spacing(2),
      },
    },
}));

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },
}));

export default function UserReviews({ backend, loggedIn, reviewData, grabReviewData, reviewsTotal }) {

    const classes = useStyles();
    const paginationClass = paginationUseStyles()
    
    const [reviewID, setReviewID] = useState('') //whenever we click update or delete button update the reviewID state to contain the ID of the item we are updating or deleting - that way, we can use the reviewID value in the fetch URL parameter
    const [editReviewForm, setEditReviewForm] = useState(false) // controls opening the Edit modal when editReviewForm state is true
    const [deleteReviewForm, setDeleteReviewForm] = useState(false) // controls opening the Delete modal when editReviewForm state is true

    const [brandName, setBrandName] = useState('') 
    const [itemName, setItemName] = useState('')

    const [ratingValue, setRatingValue] = useState(5)
    const [ratingHover, setRatingHover] = useState(-1)
    const [commentsValue, setCommentsValue] = useState('')

    // pass grabRatingValue and grabRatingHover to ReviewForm and Rating component inside ReviewForm component for onChange callback
    // pass handleCommentsChange for textarea onchange callback
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
        setReviewID(event.target.id) // reviewID state is used for the actual call to server when we click Submit button
        setEditReviewForm(true) // open the modal
    }

    const handleUpdateReview = async(event) => {
        event.preventDefault()
        if(loggedIn()) {
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
            grabReviewData(updateReviewData.allReviews.reverse()) // update the reviewData state with the new list of reviews that includes the updated review
            setEditReviewForm(false) // close modal
        }
    }

    const handleDeleteReview = async(event) => {
        if(loggedIn()) {
            const deleteReviewResponse = await fetch(`${backend}/buyer/electronic/review/${reviewID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
            })
            const deletedReviewData = await deleteReviewResponse.json()
            console.log(deletedReviewData)
            grabReviewData(deletedReviewData.allReviews.reverse()) // update the reviewData state with the new list of reviews with the deleted review gone
            setDeleteReviewForm(false) // close modal
        }
    }

    const handlePageOnChange = async(event, page) => {
        const allReviewsResponse = await fetch(`${backend}/buyer/all/electronic/reviews?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        });
        const allReviewsData = await allReviewsResponse.json();
        console.log(allReviewsData.allReviews);
        grabReviewData(allReviewsData.allReviews)
    }

    return (
        <>
            {reviewData.length === 0 ? <p>Go ahead and leave a review for the items you have purchased!</p> : (
                <>
                {reviewData.map((review, index) => { return (
                    <div className={classes.root} key={index} >
                        <p><b>{review.ElectronicItem[0].Brand} {review.ElectronicItem[0].Name}</b></p>
                        <Rating name="size-small" value={review.Rating} size="small" readOnly/>
                        <p>{review.Comment}</p>
                        <button id={review._id} onClick={openUpdateReviewModal}>Update</button>
                        <button id={review._id} onClick={(event) => {
                            setReviewID(event.target.id) // update reviewID state so that we can use the id for fetch to server when we click Yes button
                            setDeleteReviewForm(true)
                        }}>Delete</button>
                    </div>
                )})}
                <div className={paginationClass.root}>
                    <Pagination showFirstButton showLastButton size="large" variant="outlined" shape="rounded" count={reviewsTotal} siblingCount={1} boundaryCount={2} onChange={handlePageOnChange} />
                </div>  
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
            )}
        </>
    )
    
}