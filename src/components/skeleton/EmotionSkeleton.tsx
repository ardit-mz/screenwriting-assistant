import {Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

interface EmotionSkeletonProps {
    width: string | number;
}

const EmotionSkeleton: React.FC<EmotionSkeletonProps> = ({width}) => {
    return (
        <Box sx={{mt: 2, ml:4, width: width}}>
            <Skeleton variant="rectangular" height={40} sx={{mt:0}}/>
            <Skeleton variant="rectangular" height={200} sx={{mt:1}}/>
            <Skeleton variant="rectangular" height={200} sx={{mt:1}}/>
        </Box>
    )
}

export default EmotionSkeleton;