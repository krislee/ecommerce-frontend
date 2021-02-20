import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';

const ratingLabels = {
    1: 'Very Dissatisfied',
    2: 'Dissatisfied',
    3: 'Neutral',
    4: 'Satisfied',
    5: 'Very Satisfied',
};

const useStyles = makeStyles({
    root: {
        width: 200,
        display: 'flex',
        alignItems: 'center',
    },
});

export default function ReviewForm({ratingValue, grabRatingValue, ratingHover, grabRatingHover, commentsValue, handleCommentsChange}) {
    const classes = useStyles();

    return (
        <>
            <div className={classes.root}>
                <Rating
                    name="ratings-hover"
                    size="large"
                    defaultValue={5}
                    value={ratingValue}
                    // precision={0.5}
                    onChange={(event, newValue) => {
                        grabRatingValue(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                        grabRatingHover(newHover);
                    }}
                />
                {ratingValue !== null && <Box ml={2}>{ratingLabels[ratingHover !== -1 ? ratingHover : ratingValue]}</Box>}
            </div>
            
            <label htmlFor="comments"></label>
            <textarea name="comments" rows="6" cols="50" placeholder="Write your comment here." value={commentsValue} onChange={handleCommentsChange}></textarea>
        </>
    )
}