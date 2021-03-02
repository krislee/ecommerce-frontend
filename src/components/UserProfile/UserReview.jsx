import React, { useState } from 'react';
import Rating from '@material-ui/lab/Rating';
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import '../../styles/UserProfile/ReviewContainer.css';

export default function UserReviewComponent({ review, classes, openUpdateReviewModal, openDeleteReviewModal}) {

    // Getter and Setter to display the full length of the review message or just the preview 
    const [showMoreReview, setShowMoreReview] = useState(false);
    
    return (
        <div className={classes.root}>
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
            <div style={{
                display: 'inline'
            }}>
            {/* Reviews are split to splice in order cut down the text, and then rejoined to form a new review which is a shorter preview of the full review */}
            <div>{`${review.Comment.split(" ").splice(0, 50).join(" ")}...`}
            <span style={{cursor: 'pointer', color: '#057BFE'}} onClick={() => setShowMoreReview(true)}> see more</span>
            </div> 
            {/* Button to display the full review */}
            </div> : 
            <div>
            {/* The original full review */}
            <div>{review.Comment}
            {/* Button to display the shortened version of the review */}
            <span style={{cursor: 'pointer', color: '#057BFE'}} onClick={() => setShowMoreReview(false)}> see less</span></div> 
            </div>}
            </div>
            // If the review has less than 60 words, then show the whole review
            : <p>{review.Comment}</p>}
            <div 
            className="user-review-button-container">
            <Button 
            variant="primary"
            id={review._id} 
            onClick={openUpdateReviewModal}>Update</Button>
            <Button 
            variant="danger"
            id={review._id} 
            onClick={openDeleteReviewModal}>Delete</Button>
            </div>
        </div>
    )

}