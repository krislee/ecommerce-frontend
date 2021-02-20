import React, {useEffect, useState} from 'react'
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },
}));

export default function AllReviews({allReviews}) {
    
    const classes = useStyles();
    const [reviewsLoading, setReviewsLoading] = useState(true)

    useEffect(() => {
        if(allReviews.length) {
            setReviewsLoading(false)
        }
    }, [allReviews])

    if(reviewsLoading) return null
    return (
        <>
            <h5>Reviews</h5>
            {allReviews.length && (
                allReviews.map((review, index) => { return (
                    <div className={classes.root} key={index}>
                        <h5>{review.Name}</h5>
                        <Rating name="size-small" defaultValue={review.Rating} size="small" readOnly/>
                        <p>{review.Comment}</p>
                    </div>
                )})
            )}
        </>
    )
}