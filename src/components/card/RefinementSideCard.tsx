import {Card, StepLabel, TextField, Tooltip} from "@mui/material";
import SwaStepIcon from "../../icons/SwaStepIcon.tsx";
import React from "react";

interface RefinementSideCardProps {
    onClick: () => void;
    index: number;
    text: string;
    tooltip?: string;
}

const RefinementSideCard: React.FC<RefinementSideCardProps> = ({onClick, index, text, tooltip}) => {
    return (
        <Tooltip title={tooltip} followCursor>
            <Card onClick={onClick} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, backgroundColor: '', boxShadow: "none", minWidth: 100}}>
                <StepLabel icon={<SwaStepIcon index={index}/>}></StepLabel>
                <TextField fullWidth
                           multiline
                           margin={"normal"}
                           variant='outlined'
                           defaultValue={text}
                           disabled={true}
                           id="outlined-multiline-static"
                           rows={20}
                           onMouseDown={(event) => {event.stopPropagation(); onClick();}}
                           inputProps={{ readOnly: true }}
                           InputProps={{
                               readOnly: true
                               ,sx: {
                                   '& textarea': {
                                       overflow: 'hidden',
                                       scrollbarWidth: 'none',
                                       '&::-webkit-scrollbar': { display: 'none' },
                                   },
                               },
                           }}
                           sx={{
                               '& .MuiOutlinedInput-root.Mui-disabled': {
                                   backgroundColor: 'white',
                               }
                           }}/>
            </Card>
        </Tooltip>
    )
}

export default RefinementSideCard;