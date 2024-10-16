import Box from "@mui/material/Box";
import {Button, Tooltip} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {
    resetStoryBeatLocks,
    selectCurrentProject,
    setLoading, setRoute, updateProject,
    updateProjectStage,
} from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import {AppDispatch} from "../../store.ts";
import {regenerateStoryBeats} from "../../api/openaiAPI.ts";
import RewriteAllButton from "./RewriteAllButton.tsx";
import {selectApiKey} from "../../features/model/ModelSlice.ts";
import {StoryBeat} from "../../types/StoryBeat";
import {v4 as uuidv4} from "uuid";
import {Project} from "../../types/Project";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";
import {showDialogError} from "../../features/drawer/DrawerSlice.ts";

const ButtonsHeader = () => {
    const project = useSelector(selectCurrentProject) ?? null;
    const dispatch = useDispatch<AppDispatch>();
    const locked = project?.storyBeats ? project?.storyBeats?.some(s => s.locked) : false;
    const apiKey = useSelector(selectApiKey);

    const rewriteTooltipTitle = locked ? 'Rewrite unlocked story beats' : 'Rewrite all story beats';
    const rewriteButtonTitle = locked ? "Rewrite unlocked" : "Rewrite all";
    const resetLocksTooltipTitle = 'Unlock all story beats';
    const resetLockButtonTitle = 'Unlock all';
    const nextTooltipTitle = project ? ('Go to ' + (project.projectStage === ProjectStage.STRUCTURE ? 'refinement' : 'completion')) : '';
    const nextButtonTitle = 'Next';

    const rewriteStoryBeats = async () => {
        if (!project) return;

        const lockedStoryBeats = project?.storyBeats
            .filter(storyBeat => storyBeat.locked)
            .map(storyBeat => storyBeat.text)
            .join("\n")

        const newStoryBeatsResponse = await regenerateStoryBeats(
            project.brainstorm,
            project.storyBeats,
            lockedStoryBeats,
            apiKey,
            project?.uploadedText);

        if (newStoryBeatsResponse === 401) {
            dispatch(showDialogError(true));
        } else {dispatch(showDialogError(false));}

        if (newStoryBeatsResponse) {
            // @ts-expect-error It has this format
            const newStoryBeats = newStoryBeatsResponse?.choices[0]?.message?.parsed?.story_beats;
            const actsList: StoryBeat[] = []

            newStoryBeats?.forEach((act: string, index: number) => {
                const id = uuidv4()
                const newStoryBeat: StoryBeat = {
                    id: id,
                    text: act,
                    locked: false,
                    index: index,
                    impulses: [],
                    impulseStage: MenuCardStage.UNINITIALIZED,
                    questions: undefined,
                    questionStage: MenuCardStage.UNINITIALIZED,
                    emotion: undefined,
                    emotionStage: MenuCardStage.UNINITIALIZED,
                    versions: [{id: id, text: act}],
                    project: project,
                    analysis: undefined,
                    analysisStage: MenuCardStage.UNINITIALIZED,
                    critique: undefined,
                    critiqueStage: MenuCardStage.UNINITIALIZED,
                }
                actsList.push(newStoryBeat);
            })

            return actsList
        }
    }

    const handleRegenerateUnlocked = async () => {
        if (!project) return;
        dispatch(setLoading(true));

        const actList = await rewriteStoryBeats() ?? [];
        const updatedProject: Project = {
            ...project,
            storyBeats: actList,
            brainstormChanged: false,
        };

        dispatch(updateProject(updatedProject))
        dispatch(setLoading(false));
    }

    const handleResetLocks = () => {
        if (!project) return;

        if (project) {
            dispatch(resetStoryBeatLocks({projectId: project.id}));
        }
    }

    const handleNext = () => {
        if (!project || !project.storyBeats || project.storyBeats.length < 1) return;

        if (project.projectStage === ProjectStage.STRUCTURE) {
            dispatch(updateProjectStage(ProjectStage.REFINEMENT));
            dispatch(setRoute(ProjectStage.REFINEMENT));
        } else if (project.projectStage === ProjectStage.REFINEMENT) {
            dispatch(updateProjectStage(ProjectStage.COMPLETION));
            dispatch(setRoute(ProjectStage.COMPLETION));
        }
    }

    return (<>
        {/*{ // removed for conference */}
        {/*    !!project && project.projectStage === ProjectStage.BRAINSTORMING && !!apiKey &&*/}
        {/*    <Box sx={{*/}
        {/*        display: 'flex',*/}
        {/*        flexDirection: 'row',*/}
        {/*        justifyContent: 'start',*/}
        {/*        padding: '0px 24px'*/}
        {/*    }}>*/}
        {/*        <UploadWriting/>*/}
        {/*    </Box>*/}
        {/*}*/}

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