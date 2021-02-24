import React, {useEffect, useState} from 'react'
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';

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

export default function AllReviews({allReviews}) {
    
    const classes = useStyles();
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showMoreComment, setShowMoreComment] =useState(false);

    useEffect(() => {
        if(allReviews.length) {
            setReviewsLoading(false);
            console.log(allReviews);
        }
    }, [allReviews])

    if(reviewsLoading) return null
    return (
        <>
            <h5>Reviews</h5>
            {allReviews.length && (
                allReviews.map((review, index) => { 
                    if (review.Comment.length > 250) {
                        console.log(review.Comment.length);
                        let comment = review.Comment
                        console.log(comment.split(" ").length);
                        console.log(comment.split(" ").splice(0, 50).join(" "));
                        let newComment = `${comment.split(" ").splice(0, 50).join(" ")}...`
                        return (
                            <div className={classes.root} key={index}>
                                <h5>{review.Name}</h5>
                                <Rating name="size-small" defaultValue={review.Rating} size="small" readOnly/>
                                {showMoreComment ? <div>
                                    <p style={{width: '80%', wordWrap: "break-word"}}>{comment}</p>
                                    <div style={{cursor: 'pointer'}} onClick={() => setShowMoreComment(false)}>Show Less...</div>
                                </div> : 
                                <div>
                                    <p style={{width: '80%', wordWrap: "break-word"}}>{newComment}</p>
                                    <div style={{cursor: 'pointer'}} onClick={() => setShowMoreComment(true)}>Show More...</div>
                                </div>}
                            </div>
                        )
                    } else {
                        return (
                            <div className={classes.root} key={index}>
                                <h5>{review.Name}</h5>
                                <Rating name="size-small" defaultValue={review.Rating} size="small" readOnly/>
                                <p>{review.Comment}</p>
                            </div>
                        )
                    };
                })
            )}
        </>
    )
}