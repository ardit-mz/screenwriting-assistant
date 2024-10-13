import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Button, TextField, Tooltip} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {
    selectCurrentProject,
    selectProjects, setRoute,
    updateProject,
    updateProjectStage, updateSuggestions
} from "../features/project/ProjectSlice.ts";
import {Project} from "../types/Project";
import {ProjectStage} from "../enum/ProjectStage.ts";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import FillingButton from "../components/button/FillingButton.tsx";
import {setOpenRight, showDialogError} from "../features/drawer/DrawerSlice.ts";
import {getSuggestions} from "../api/openaiAPI.ts";
import {debounce} from "../helper/DebounceHelper.ts";

const Brainstorming = () => {
    const projects = useSelector(selectProjects);
    const project = useSelector(selectCurrentProject);
    const dispatch = useDispatch();
    const apiKey = useSelector(selectApiKey);

    const title = 'What should the story be about?'
    const description = 'This is a brainstorming session. Please write down all your thoughts related to the story. It\'s okay to describe your ideas in an informal and unstructured manner.'
    const suggestionTitle = 'Get suggestions';
    const suggestionTooltip = 'Get suggestions based on what you have written';

    const [brainstormingText, setBrainstormingText] = useState<string>("");
    const [oldBrainstormingText, setOldBrainstormingText] = useState<string>("");

    useEffect(() => {
        if (project?.brainstorm) {
            setOldBrainstormingText(project?.brainstorm);
        }
    }, []);

    useEffect(() => {
        if (project && project.brainstorm) {
            setBrainstormingText(project.brainstorm);
        }
    }, [project?.brainstorm]);

    const brainstormingSuggestions = async () => {
        if (!project) return;

        if (project.brainstorm) {
            dispatch(setOpenRight(true));
        }

        if (!!project.suggestions && project.suggestions.length > 0) {
            dispatch(updateSuggestions({
                projectId: project?.id,
                suggestions: []
            }))
        }

        try {
            const brainstormingPrompt = "My Brainstorming so far is:\\n" + project?.brainstorm;
            const suggestionsRes = await getSuggestions(brainstormingPrompt, apiKey)

            if (suggestionsRes === 401) {
                dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
            }

            // @ts-expect-error it has this format
            const suggestionsParsed = suggestionsRes?.choices[0]?.message?.parsed?.suggestions ?? "";

            dispatch(updateSuggestions({
                projectId: project?.id,
                suggestions: suggestionsParsed
            }))

        } catch (error) {
            console.error("Brainstorming Error fetching suggestions from brainstorming:", error);
        }
    }

    const debouncedBrainstormingSuggestions = useRef(debounce(brainstormingSuggestions, 300));

    useEffect(() => {
        if (!!project && !project.suggestionsLoaded && !!apiKey) {
            debouncedBrainstormingSuggestions.current();
            dispatch(updateProject({
                ...project,
                suggestionsLoaded: true,
            }));
        }
    }, [project, project?.suggestionsLoaded]);

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

        const hasBrainstormingChanged = oldBrainstormingText.replace(/\s+/g, '') !== brainstormingText.replace(/\s+/g, '');

        const updatedProject: Project = {
            ...project,
            brainstorm: brainstormingText,
            brainstormChanged: hasBrainstormingChanged,
        };

        dispatch(updateProject(updatedProject));
        dispatch(updateProjectStage(ProjectStage.STRUCTURE));
        dispatch(setRoute(ProjectStage.STRUCTURE));
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

            <Box sx={{display: 'flex', gap: 1}}>

                <Tooltip title={suggestionTooltip} placement={'bottom'} arrow>
                    <Button onClick={brainstormingSuggestions}
                            variant="outlined"
                            style={{marginLeft: 10}}
                            color={'primary'}>
                        {suggestionTitle}
                    </Button>
                </Tooltip>
            <FillingButton brainstormingText={brainstormingText ?? project?.brainstorm}
                           onClick={handleNext} />
            </Box>
        </Box>
    )
}

export default Brainstorming;