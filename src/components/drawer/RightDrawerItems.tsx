import BrainstormingCard from "../card/BrainstormingCard.tsx";
import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import RightDrawerSuggestionCard from "./RightDrawerSuggestionCard.tsx";
import {useDispatch, useSelector} from "react-redux";
import {
    selectCurrentProject,
    updateBrainstorming,
    updateSuggestions
} from "../../features/project/ProjectSlice.ts";
import {Skeleton} from "@mui/material";

const RightDrawerItems: React.FC = () => {
    const project = useSelector(selectCurrentProject);
    const dispatch = useDispatch();

    const [suggestions, setSuggestions] = useState<string[]>([])

    useEffect(() => {
        if (project && project?.suggestions) {
            setSuggestions(project?.suggestions);
        }
    }, [project, project?.suggestions]);

    const handleChange = (index: number, text: string) => {
        const updatedSuggestions = [...suggestions];
        updatedSuggestions[index] = text;

        // TODO update suggestion with its changes
        if (project && project.id) {
            dispatch(updateSuggestions({
                projectId: project.id,
                suggestions: updatedSuggestions
            }))
        }
    }

    const handleAddSuggestion = (text: string) => {
        if (project && project.id) {
            dispatch(updateBrainstorming({
                projectId: project.id,
                text: text
            }))
        }
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
            <Box sx={{
                width: '100%',
                marginTop: 17,
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflowY: 'auto'
            }}>
                {(!!project?.suggestions && project?.suggestions.length > 0)
                    ? (!!project?.suggestions && project.suggestions.map((suggestion, index) =>
                        <RightDrawerSuggestionCard key={index}
                                                   text={suggestion}
                                                   onChange={(text) => handleChange(index, text)}
                                                   onClick={() => handleAddSuggestion(suggestion)}/>
                    ))
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    : Array(3).fill(null).map((_) => (
                        <Skeleton variant="rectangular" height={100} sx={{mt: 2}}/>
                    ))
                }
            </Box>


            <BrainstormingCard/>
        </Box>
    )
}

export default RightDrawerItems;