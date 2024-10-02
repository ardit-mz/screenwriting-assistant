import React from "react";
import Box from "@mui/material/Box";
import CollapsableCard from "./CollapsableCard.tsx";
import {SwaColor} from "../../enum/SwaColor.ts";

interface CritiqueCardProps {
    strengths: string;
    improvement: string;
    summary: string;
}

const CritiqueCard: React.FC<CritiqueCardProps> = ({strengths, improvement, summary}) => {
    return (
        <Box sx={{mt: 2, marginLeft: 4}}>
            <CollapsableCard title={"Strengths"} text={strengths} color={SwaColor.redLight} />
            <CollapsableCard title={"Areas for Improvement"} text={improvement} color={SwaColor.redLight} />
            <CollapsableCard title={"Summary for Improvement"} text={summary} color={SwaColor.redLight} />
        </Box>
    )
}

export default CritiqueCard;