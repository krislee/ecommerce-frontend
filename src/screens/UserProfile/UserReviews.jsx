import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ReviewForm from '../../components/Reviews/ReviewForm';
import UserReviewComponent from '../../components/UserProfile/UserReview'

import Modal from 'react-modal';
import { makeStyles } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';
import Button from 'react-bootstrap/Button'

import '../../styles/UserProfile/ReviewContainer.css'

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
    width: '80%',
    marginBottom: '1rem',
    borderRadius: '1rem',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
    padding: '1rem',
    backgroundColor: '#21212B'
  },
  linkTitle: {
      color: '#fff !important',
      display: 'inline-block',
      fontWeight: 'bold'
  }
}));
export default function UserReviews({ backend, loggedIn, reviewData, grabReviewData, reviewsTotal, grabReviewsTotal, reviewLoading, reviewsPage, grabReviewsPage, grabTotalCartQuantity, grabRedirect }) {

    const classes = useStyles();
    const paginationClass = paginationUseStyles();

    const history = useHistory();
    const [disableButtonAfterFetching, setDisableButtonAfterFetching] = useState(false) // disable Submit buttons for editing and deleting reviews to prevent user from making multiple consecutive requests

    const [reviewID, setReviewID] = useState('') //whenever we click update or delete button update the reviewID state to contain the ID of the item we are updating or deleting - that way, we can use the reviewID value in the fetch URL parameter
    const [editReviewForm, setEditReviewForm] = useState(false) // controls opening the Edit modal when editReviewForm state is true
    const [deleteReviewForm, setDeleteReviewForm] = useState(false) // controls opening the Delete modal when editReviewForm state is true

    const [brandName, setBrandName] = useState('') ;
    const [itemName, setItemName] = useState('');
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingHover, setRatingHover] = useState(-1);
    const [commentsValue, setCommentsValue] = useState('');

    // pass grabRatingValue and grabRatingHover to ReviewForm and Rating component inside ReviewForm component for onChange callback
    // pass handleCommentsChange for textarea onchange callback
    const grabRatingValue = (rating) => setRatingValue(rating);
    const grabRatingHover = (rating) => setRatingHover(rating);
    const handleCommentsChange = (event) => setCommentsValue(event.target.value);

    const openUpdateReviewModal = async (event) => {
        if(loggedIn()) {
            console.log(event.target.id);
            console.log(event.target)
            const retrieveOneReviewResponse = await fetch(`${backend}/buyer/electronic/review/${event.target.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            const retrieveOneReviewData = await retrieveOneReviewResponse.json();
            console.log(retrieveOneReviewData);
            setRatingValue(retrieveOneReviewData.singleReview.Rating); // update the rating state --> pass to ReviewForm and Rating component inside ReviewForm component --> prefill the rating stars section
            setCommentsValue(retrieveOneReviewData.singleReview.Comment); // update the comments --> pass to ReviewForm and Rating component --> prefill the comment section
            setBrandName(retrieveOneReviewData.singleReview.ElectronicItem[0].Brand); // update the brand and item name to populate in the modal
            setItemName(retrieveOneReviewData.singleReview.ElectronicItem[0].Name);
            setReviewID(event.target.id); // reviewID state is used for the actual call to server when we click Submit button
            setEditReviewForm(true); // open the modal
        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const closeEditReviewModal = () => {
        setEditReviewForm(false);
        if(!loggedIn()) {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const handleUpdateReview = async(event) => {
        event.preventDefault();
        if(loggedIn()) {

            setDisableButtonAfterFetching(true) // disable Submit edit button to prevent user from trying to submit more than once

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
            setEditReviewForm(false) // close modal
            setDisableButtonAfterFetching(false) // enable the Submit button again for another edit
        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const handleDeleteReview = async() => {
        if(loggedIn()) {
            setDisableButtonAfterFetching(true) // disable Submit delete button to prevent user from trying to submit more than once

            const deleteReviewResponse = await fetch(`${backend}/buyer/electronic/review/${reviewID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
            })
            const deletedReviewData = await deleteReviewResponse.json()
            console.log(deletedReviewData)
            grabReviewData(deletedReviewData.allReviews) // update the reviewData state with the new list of reviews with the deleted review gone
            setDeleteReviewForm(false) // close modal
            setDisableButtonAfterFetching(false) // enable the Submit button again for deleting
            grabReviewsTotal(deletedReviewData.totalPages)
        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const openDeleteReviewModal = (event) => {
        if(loggedIn()) {
            setReviewID(event.target.id); // update reviewID state so that we can use the id for fetch to server when we click Yes button
            setDeleteReviewForm(true);
        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const closeDeleteReviewModal = () => {
        setDeleteReviewForm(false);
        if(!loggedIn()) {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const handlePageOnChange = async(page) => {
        history.replace({
            pathname: `/profile/review?page=${page}` // when we click on the pagination number, we want to update the URL param with the clicked pagination number (represented by page)
        });
        if(loggedIn()) {
            const allReviewsResponse = await fetch(`${backend}/buyer/all/electronic/reviews?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            const allReviewsData = await allReviewsResponse.json();
            grabReviewData(allReviewsData.allReviews);
            grabReviewsPage(page);
        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };


    if(reviewLoading) return null
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            height: '100%'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '1rem',
            }}>
            <header style={{
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '2rem',
                fontFamily: 'Average Sans, sans-serif'
            }}>Reviews</header>
            </div>
            {reviewData.length === 0 ? <p style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                fontFamily: 'Mukta Vaani, sans-serif'
            }}>Go ahead and leave a review for the items you have purchased!</p> : (
                <>
                <div
                className="review-user-container">
                    {reviewData.map((review, index) => { return (
                       <UserReviewComponent 
                       review={review} 
                       index={index}
                       classes={classes}
                       openDeleteReviewModal={openDeleteReviewModal}
                       openUpdateReviewModal={openUpdateReviewModal}
                       key={index}
                       />
                    )})}
                    <div className={paginationClass.root}>
                        <Pagination showFirstButton showLastButton size="large" variant="outlined" shape="rounded" count={reviewsTotal} page={Number(reviewsPage)} siblingCount={1} boundaryCount={2} onChange={handlePageOnChange} />
                    </div>  
                </div>
                {editReviewForm && (
                    <Modal isOpen={editReviewForm} onRequestClose={closeEditReviewModal} ariaHideApp={false} contentLabel="Edit Review">
                        <form id="profile-update-review-form" onSubmit={handleUpdateReview}>
                            <p><b>{brandName} {itemName} </b></p>
                            <ReviewForm ratingValue={ratingValue} grabRatingValue={grabRatingValue} ratingHover={ratingHover} grabRatingHover={grabRatingHover} commentsValue={commentsValue} handleCommentsChange={handleCommentsChange} />
                            <div id="profile-review-update-buttons-container">
                                <Button size="lg" variant="dark" disabled={!commentsValue || disableButtonAfterFetching} type="submit">Submit</Button>
                                <Button size="lg" variant="dark" onClick={closeEditReviewModal}>Cancel</Button>
                            </div>
                        </form>
                    </Modal>
                )}
                {deleteReviewForm && (
                    <Modal id="profile-delete-review-modal" isOpen={deleteReviewForm} onRequestClose={closeDeleteReviewModal} ariaHideApp={false} contentLabel="Delete Review">
                        <p><b>Are you sure you want to delete?</b></p>
                        <div id="profile-review-delete-buttons-container">
                            <Button size="lg" variant="dark" disabled={disableButtonAfterFetching} onClick={handleDeleteReview}>Yes</Button>
                            <Button size="lg" variant="dark" onClick={closeDeleteReviewModal}>Cancel</Button>
                        </div>
                    </Modal>
                )}
                </>
            )}
        </div>
    )
    
}