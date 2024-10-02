import {Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

interface QuestionSkeletonProps {
    width: string | number;
}

const QuestionSkeleton: React.FC<QuestionSkeletonProps> = ({width}) => {
    return (
        <Box sx={{mt: 2, ml:4, width: width}}>
            <Skeleton variant="rectangular" height={24} sx={{mt:2}}/>
            <Skeleton variant="rectangular" height={150} sx={{mt:1}}/>
            <Skeleton variant="rectangular" height={24} sx={{mt:2}}/>
            <Skeleton variant="rectangular" height={150} sx={{mt:1}}/>
        </Box>
    )
}

export default QuestionSkeleton;