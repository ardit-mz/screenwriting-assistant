import React from "react";
import Box from "@mui/material/Box";
import CollapsableCard from "./CollapsableCard.tsx";
import {SwaColor} from "../../enum/SwaColor.ts";

interface AnalysisCardProps {
    incident: string;
    characters: string;
    themes: string;
    foreshadowing: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ incident, characters, themes, foreshadowing }) => {
    return (
        <Box sx={{mt: 2, marginLeft: 4}}>
            <CollapsableCard title={"Inciting Incident"} text={incident} color={SwaColor.violetLight} />

            <CollapsableCard title={"Character development"} text={characters} color={SwaColor.violetLight} />

            <CollapsableCard title={"Thematic Implications"} text={themes} color={SwaColor.violetLight} />

            <CollapsableCard title={"Narrative Foreshadowing"} text={foreshadowing} color={SwaColor.violetLight} />
        </Box>
    )
}

export default AnalysisCard;