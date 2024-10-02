// views/Brainstormin.tsx

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {ScreenNames} from "../enum/ScreenNames.ts";
import {useDispatch, useSelector} from "react-redux";
import React, {ChangeEvent, useEffect, useState} from "react";
import {
    selectCurrentProject,
    selectProjects,
    updateProject,
    updateProjectStage
} from "../features/project/ProjectSlice.ts";
import {Project} from "../types/Project";
import {ProjectStage} from "../enum/ProjectStage.ts";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import FillingButton from "../components/button/FillingButton.tsx";

const Brainstorming = () => {
    const projects = useSelector(selectProjects);
    const project = useSelector(selectCurrentProject);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const apiKey = useSelector(selectApiKey);

    const title = 'What should the story be about?'
    const description = 'This is a brainstorming session. Please write down all your thoughts related to the story. It\'s okay to describe your ideas in an informal and unstructured manner.'

    const [brainstormingText, setBrainstormingText] = useState<string>("")

    useEffect(() => {
        if (project && project.brainstorm) {
            setBrainstormingText(project.brainstorm);
        }
    }, [project?.brainstorm]);

    if (projects.length === 0 || !apiKey) {
        return (<Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'start', height: 100}}>
            { projects.length === 0 && <Typography variant={'h6'}>Create a new project</Typography> }
            { !apiKey && <Typography variant={'h6'} sx={{ mt: projects.length === 0 ? 2 : 0 }}>Add your API key in the configuration</Typography> }
        </Box>)
    }

    const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        setBrainstormingText(newValue)
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleTextChange(event);

        if (project) {
            dispatch(updateProject({
                ...project,
                brainstorm: event.target.value,
            }))
        }
    }

    const handleNext = async () => {
        if (!project) return;

        const updatedProject: Project = {
            ...project,
            brainstorm: brainstormingText,
        };

        dispatch(updateProject(updatedProject))
        dispatch(updateProjectStage(ProjectStage.STRUCTURE))

        navigate(ScreenNames.STRUCTURE)
    }

    return (
        <Box component="main"
             sx={{
                 flexGrow: 1,
                 p: 3,
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 marginTop: 3,
                 maxWidth: 800
            }}
        >
            <Typography variant={'h3'}>{title}</Typography>
            <Typography paragraph color={"grey"}>{description}</Typography>

            <TextField fullWidth
                       multiline
                       margin={"normal"}
                       label={"Put your ideas here..."}
                       variant='outlined'
                       onChange={handleTextChange}
                       onBlur={handleBlur}
                       value={brainstormingText}
            />

            <FillingButton brainstormingText={brainstormingText ?? project?.brainstorm}
                           onClick={handleNext} />
        </Box>
    )
}

export default Brainstorming;