import {Card, Tooltip} from "@mui/material";
import {SwaColor} from "../../enum/SwaColor.ts";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React from "react";

interface NavigateToStepCardProps {
    onClick: () => void;
    position: 'left' | 'right';
}

const NavigateToStepCard: React.FC<NavigateToStepCardProps> = ({onClick, position}) => {
    const cardStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: SwaColor.greyLighter,
        boxShadow: "none",
        border: `solid 1px ${SwaColor.grayBorder}`,
        height: '100%',
        width: 40,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'white',
            '& .MuiSvgIcon-root': {
                transform: 'scale(1.3)',
                transition: 'transform 0.5s',
            },
        },
    }

    return (
        <Tooltip title={`${position === 'left' ? 'Previous' : 'Next'} story beat`} followCursor>
            <Card onClick={onClick}
                  sx={cardStyle}>
                { position === 'left' ? <ArrowBackIosNewIcon/> : <ArrowForwardIosIcon /> }
            </Card>
        </Tooltip>
    )
}

export default NavigateToStepCard;