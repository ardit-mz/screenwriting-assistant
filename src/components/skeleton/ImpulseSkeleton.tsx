import {Skeleton} from "@mui/material";
import React from "react";

interface ImpulseSkeletonProps {
    style?: React.CSSProperties;
    width?: string;
}

const ImpulseSkeleton: React.FC<ImpulseSkeletonProps> = ({style, width}) => {
    return (
        <div style={{display: "flex", flexDirection: "row", ...style}}>
            <Skeleton variant="rounded" width={width ?? 266} height={200} style={{marginTop: 10}}/>

            <div style={{display: "flex", flexDirection: "column"}}>
                <Skeleton variant={"circular"}  width={24} height={24} style={{marginLeft: 5, marginTop: 10}} />
                <Skeleton variant={"circular"}  width={24} height={24} style={{marginLeft: 5, marginTop: 10}} />
                <Skeleton variant={"circular"}  width={24} height={24} style={{marginLeft: 5, marginTop: 10}} />
            </div>
        </div>
    )
}

export default ImpulseSkeleton;