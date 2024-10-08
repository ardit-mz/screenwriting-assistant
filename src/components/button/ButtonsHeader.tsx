// ButtonsHeader.tsx

import Box from "@mui/material/Box";
import {Button, Tooltip} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {
    resetStoryBeatLocks,
    selectCurrentProject,
    setLoading,
    updateProjectStage,
    updateStoryBeats, updateSuggestions
} from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import {ScreenNames} from "../../enum/ScreenNames.ts";
import {AppDispatch} from "../../store.ts";
import {useNavigate} from "react-router-dom";
import {getSuggestions, regenerateStoryBeats} from "../../api/openaiAPI.ts";
import RewriteAllButton from "./RewriteAllButton.tsx";
import {selectApiKey} from "../../features/model/ModelSlice.ts";
import UploadWriting from "../fileUpload/UploadWriting.tsx";
import {setOpenRight} from "../../features/drawer/DrawerSlice.ts";

const ButtonsHeader = () => {
    const project = useSelector(selectCurrentProject) ?? null;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const locked = project?.storyBeats ? project?.storyBeats?.some(s => s.locked) : false;
    const apiKey = useSelector(selectApiKey);

    const rewriteTooltipTitle = locked ? 'Rewrite unlocked story beats' : 'Rewrite all story beats';
    const rewriteButtonTitle = locked ? "Rewrite unlocked" : "Rewrite all";
    const resetLocksTooltipTitle = 'Unlock all story beats';
    const resetLockButtonTitle = 'Unlock all';
    const nextTooltipTitle = project ? ('Go to ' + (project.projectStage === ProjectStage.STRUCTURE ? 'refinement' : 'completion')) : '';
    const nextButtonTitle = 'Next';
    const suggestionTitle = 'Get suggestions';
    const suggestionTooltip = 'Get suggestions based on what you have written';

    const brainstormingSuggestions = async () => {
        if (!project) return;
        dispatch(setOpenRight(true));

        if (!!project.suggestions && project.suggestions.length > 0) {
            dispatch(updateSuggestions({
                projectId: project?.id,
                suggestions: []
            }))
        }

        try {
            const brainstormingPrompt = "My Brainstorming so far is:\\n" + project?.brainstorm;
            const suggestionsRes = await getSuggestions(brainstormingPrompt, apiKey);

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

    const rewriteStoryBeats = async () => {
        if (!project) return;

        const brainstormingPrompt = `"My brainstorm for this story is:\\n\\${project.brainstorm}\\n`;
        const prompt = `${brainstormingPrompt} My story structure so far is: ${project.storyBeats.filter(s => s.locked).join("\n")}`
        const newStoryBeatsResponse = await regenerateStoryBeats(prompt, apiKey);

        if (newStoryBeatsResponse) {
            // @ts-expect-error It has this format
            const newStoryBeats = newStoryBeatsResponse?.choices[0]?.message?.parsed?.story_beats;
            console.log("newStoryBeats", newStoryBeats)

            return project.storyBeats.map((beat) => {
                if (!beat.locked) {
                    return {
                        ...beat,
                        text: newStoryBeats.shift() || beat.text,
                    };
                }
                return beat;
            });
        }
    }

    const handleRegenerateUnlocked = async () => {
        if (!project) return;
        dispatch(setLoading(true));

        const updatedStoryBeats = await rewriteStoryBeats() ?? [];
        dispatch(updateStoryBeats({projectId: project.id, storyBeats: updatedStoryBeats}));

        dispatch(setLoading(false));
    }

    const handleResetLocks = () => {
        if (!project) return;

        if (project) {
            dispatch(resetStoryBeatLocks({projectId: project.id}));
        }
    }

    const handleNext = () => {
        if (!project) return;

        if (project.projectStage === ProjectStage.STRUCTURE) {
            dispatch(updateProjectStage(ProjectStage.REFINEMENT))
            navigate(ScreenNames.REFINEMENT)
        } else if (project.projectStage === ProjectStage.REFINEMENT) {
            dispatch(updateProjectStage(ProjectStage.COMPLETION))
            navigate(ScreenNames.EXPORT)
        }
    }

    return (<>
        {
            !!project && project.projectStage === ProjectStage.BRAINSTORMING && !!apiKey &&
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                padding: '0px 24px'
            }}>
                <UploadWriting/>

                <Tooltip title={suggestionTooltip} placement={'bottom'} arrow>
                    <Button onClick={brainstormingSuggestions}
                            variant="outlined"
                            style={{marginLeft: 10}}
                            color={'primary'}>
                        {suggestionTitle}
                    </Button>
                </Tooltip>

            </Box>
        }

        {
            !!project && (project.projectStage === ProjectStage.STRUCTURE || project.projectStage === ProjectStage.REFINEMENT || project.projectStage === ProjectStage.COMPLETION) &&
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: project.projectStage === ProjectStage.STRUCTURE ? 'space-between' : 'end',
                padding: '0px 24px'
            }}>
                {
                    project.projectStage === ProjectStage.STRUCTURE &&
                    <Box sx={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                        {project?.storyBeats.some(s => !s.locked) && <> {
                            locked ?
                                <Tooltip title={rewriteTooltipTitle} placement={'bottom'} arrow>
                                    <Button onClick={handleRegenerateUnlocked}
                                            variant="outlined"
                                            style={{marginLeft: 10}}
                                            color={'primary'}>
                                        {rewriteButtonTitle}
                                    </Button>
                                </Tooltip>
                                : <RewriteAllButton onClick={handleRegenerateUnlocked}/>
                        }</>}

                        {locked && <Tooltip title={resetLocksTooltipTitle} placement={'bottom'} arrow>
                            <Button onClick={handleResetLocks}
                                    variant="outlined"
                                    style={{marginLeft: 10}}
                                    color={'primary'}>
                                {resetLockButtonTitle}
                            </Button>
                        </Tooltip>}
                    </Box>
                }

                {
                    (project.projectStage === ProjectStage.STRUCTURE || project.projectStage === ProjectStage.REFINEMENT) &&
                    <Tooltip title={nextTooltipTitle} placement={'bottom'} arrow>
                        <Button onClick={handleNext}
                                variant="outlined"
                                color={'primary'}
                                style={{minWidth: '68.16px', width: '68.16px', marginRight: 8}}
                        >
                            {nextButtonTitle}
                        </Button>
                    </Tooltip>
                }
            </Box>
        }
    </>)
}

export default ButtonsHeader;