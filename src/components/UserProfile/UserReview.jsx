import React, { useState } from 'react';
import Rating from '@material-ui/lab/Rating';
import { Link } from 'react-router-dom'
import '../../styles/UserProfile/ReviewContainer.css';

export default function UserReviewComponent({ review, index, classes, openUpdateReviewModal, openDeleteReviewModal}) {

    // Getter and Setter to display the full length of the review message or just the preview 
    const [showMoreReview, setShowMoreReview] = useState(false);
    
    return (
        <div className={classes.root} key={index}>
            <p>
            <Link to={{
                pathname:`/item/${review.ElectronicItem[0].Name}`,
                search: `id=${review.ElectronicItem[0]._id}`
            }} className={classes.linkTitle}>{review.ElectronicItem[0].Brand} {review.ElectronicItem[0].Name}
            </Link>
            </p>
            <Rating name="size-small" value={review.Rating} size="small" readOnly/>
            {/* If the review has more than 60 words, then show a preview of the review */}
            {review.Comment.length > 60 ? 
            <div>
            {/* What is displayed depends on whether users want to view the longer version or the shorter version of the review when users click on the show more and show less button */}
            {!showMoreReview ?  
            <div>
            {/* Reviews are split to splice in order cut down the text, and then rejoined to form a new review which is a shorter preview of the full review */}
            <p>{`${review.Comment.split(" ").splice(0, 50).join(" ")}...`}</p> 
            {/* Button to display the full review */}
            <div style={{cursor: 'pointer'}} onClick={() => setShowMoreReview(true)}>Show More...</div>
            </div> : 
            <div>
            {/* The original full review */}
            <p>{review.Comment}</p> 
            {/* Button to display the shortened version of the review */}
            <div style={{cursor: 'pointer'}} onClick={() => setShowMoreReview(false)}>Show Less...</div>
            </div>}
            </div>
            // If the review has less than 60 words, then show the whole review
            : <p>{review.Comment}</p>}
            <button id={review._id} onClick={openUpdateReviewModal}>Update</button>
            <button id={review._id} onClick={openDeleteReviewModal}>Delete</button>
        </div>
    )

}