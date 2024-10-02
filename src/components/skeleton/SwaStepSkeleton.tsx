import {Skeleton, Step} from "@mui/material";
import React from "react";

interface SwaStepSkeletonProps {
    showIcon: boolean
}

const SwaStepSkeleton: React.FC<SwaStepSkeletonProps> = ({showIcon}) => {
    return (
        <Step style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', padding: 0, marginRight: 72}}>
            <div style={{
                display: 'flex',
                flexDirection: 'column', minWidth: 300
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Skeleton variant="rounded" width={30} height={30} style={{marginRight: 10}}/>
                        <Skeleton variant={"circular"}  width={24} height={24} style={{marginRight: 10}} />
                        <Skeleton variant={"circular"}  width={24} height={24} style={{marginRight: 10}} />
                        <Skeleton variant={"circular"}  width={24} height={24} style={{marginRight: 10}} />
                        {showIcon && <Skeleton variant={"circular"} width={24} height={24} style={{marginRight: 10}}/>}
                    </div>
                    <Skeleton variant={"circular"}  width={24} height={24}/>
                </div>
                <Skeleton variant="rounded" width={300} height={200} style={{marginTop: 16}}/>
            </div>
        </Step>
    )
}

export default SwaStepSkeleton;