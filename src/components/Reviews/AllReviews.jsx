import React, {useEffect, useState} from 'react'
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },
}));



export default function AllReviews({backend, allReviews, electronicID, grabAllReviews, allReviewsTotal}) {

    const classes = useStyles();
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const [reviewsPageNumber, setReviewsPageNumber] = useState(1)

    // Getter and Setter to display the full length of the review message or just the preview 
    const [showMoreComment, setShowMoreComment] =useState(false);

    useEffect(() => {
        if(allReviews.length) {
            setReviewsLoading(false);
        };
    }, [allReviews])

    const handlePageOnChange = async(event, page) => {
        const reviews= await fetch(`${backend}/buyer/electronic/public-reviews/${electronicID}?page=${page}`)
        const data = await reviews.json();
        console.log(data);
        grabAllReviews(data.allReviews)
        setReviewsPageNumber(page)
    }

    
    if(reviewsLoading) return null
    return (
        <>
            <h5>Reviews</h5>
            {allReviews.length && (
                allReviews.map((review, index) => {
                    {/* If the review has more than 250 words, then show a preview of the review */} 
                    if (review.Comment.length > 250) {
                        // Regular review will be under comment
                        let comment = review.Comment;
                        // Shortened review will be under newComment
                        let newComment = `${comment.split(" ").splice(0, 50).join(" ")}...`;
                        return (
                            <div className={classes.root} key={index}>
                                <h5>{review.Name}</h5>
                                <Rating name="size-small" defaultValue={review.Rating} size="small" readOnly/>
                                {/* What is displayed depends on whether users want to view the longer version or the shorter version of the review when users click on the show more and show less button */}
                                {showMoreComment ? <div>
                                    <p style={{width: '80%', wordWrap: "break-word"}}>{comment}</p>
                                    {/* Button to display the shortened version of the review */}
                                    <div style={{cursor: 'pointer'}} onClick={() => setShowMoreComment(false)}>Show Less...</div>
                                </div> : 
                                <div>
                                    <p style={{width: '80%', wordWrap: "break-word"}}>{newComment}</p>
                                    {/* Button to display the full review */}
                                    <div style={{cursor: 'pointer'}} onClick={() => setShowMoreComment(true)}>Show More...</div>
                                </div>}
                            </div>
                        )
                    } else {
                        // If the review has less than 250 words, then show the whole review
                        return (
                            <div className={classes.root} key={index}>
                                <h5>{review.Name}</h5>
                                <Rating name="size-small" defaultValue={review.Rating} size="small" readOnly/>
                                <p>{review.Comment}</p>
                            </div>
                        )
                    }
                })
            )}

            <div className={classes.root} id="item-reviews-pagination-container">  
                <Pagination size="large" variant="outlined" shape="rounded" count={Number(allReviewsTotal)} page={Number(reviewsPageNumber)} onChange={handlePageOnChange} siblingCount={0} />
            </div>  
        </>
    )
}