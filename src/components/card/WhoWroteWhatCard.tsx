import React from "react";
import {SwaColor} from "../../enum/SwaColor.ts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface WhoWroteWhatCardProps {
    onClick: () => void;
    index: number;
    text: string;
}

const WhoWroteWhatCard: React.FC<WhoWroteWhatCardProps> = ({onClick, index, text}) => {
    return (
        <Box sx={{mt: 8, marginLeft: 4}}>
            <Typography color={SwaColor.primaryLighter} variant={"h6"} sx={{mb:2}} textAlign={'right'}>Initial AI suggestion based on your ideas</Typography>
            <Typography color={'#1E76CE'} variant={"h6"} sx={{mb:2}} textAlign={'right'}>Last edited by AI assistant</Typography>
            <Typography variant={"h6"} textAlign={'right'}>Last edited by you</Typography>
        </Box>
    )
}

export default WhoWroteWhatCard;