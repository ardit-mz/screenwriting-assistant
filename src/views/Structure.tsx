import {Snackbar, SnackbarContent, Stepper} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../store.ts";
import {selectCurrentProject, setLoading, updateProject} from "../features/project/ProjectSlice.ts";
import {ProjectStage} from "../enum/ProjectStage.ts";
import {getStoryBeatsFromBrainstorming} from "../api/openaiAPI.ts";
import {StoryBeat, StoryBeatVersion} from "../types/StoryBeat";
import {v4 as uuidv4} from "uuid";
import SwaStep from "../components/stepper/SwaStep.tsx";
import {Project} from "../types/Project";
import SwaStepSkeleton from "../components/skeleton/SwaStepSkeleton.tsx";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, arrayMove, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import {SwaColor} from "../enum/SwaColor.ts";
import {selectDndOptionShown, setDndOptionShown} from "../features/snackbar/SnackbarSlice.ts";
import {selectApiKey, selectModel} from "../features/model/ModelSlice.ts";
import {MenuCardStage} from "../enum/MenuCardStage.ts";
import {selectDialogError, showDialogError} from "../features/drawer/DrawerSlice.ts";
import {debounce} from "../helper/DebounceHelper.ts";
import Box from "@mui/material/Box";

const Structure = () => {
    const dispatch = useDispatch<AppDispatch>();
    const project = useSelector(selectCurrentProject)
    const dndOptionShown = useSelector(selectDndOptionShown);
    const apiKey = useSelector(selectApiKey);
    const model = useSelector(selectModel);
    // const scrollContainerRef = useRef(null);
    const dialogError = useSelector(selectDialogError)

    const [steps, setSteps] = useState(project?.storyBeats);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [showSnackbar, setShowSnackbar] = useState(false);

    const handleFirstClick = () => {
        if (!dndOptionShown) {
            setShowSnackbar(true);
            dispatch(setDndOptionShown(true))
        }
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    // useEffect(() => {
    //     const scrollContainer = scrollContainerRef.current;
    //
    //     const onWheel = (event: WheelEvent) => {
    //         if (event.deltaY !== 0 && scrollContainer) {
    //             (scrollContainer as HTMLElement).scrollLeft += event.deltaY;
    //             event.preventDefault();
    //         }
    //     };
    //
    //     if (scrollContainer) {
    //         (scrollContainer as HTMLElement).addEventListener('wheel', onWheel);
    //     }
    //
    //     return () => {
    //         if (scrollContainer) {
    //             (scrollContainer as HTMLElement).removeEventListener('wheel', onWheel);
    //         }
    //     };
    // }, []);

    const handleStoryBeats = async () => {
        if (!project) return;

        dispatch(setLoading(true));
        const actList = await updateStoryBeats() ?? [];
        const updatedProject: Project = {
            ...project,
            storyBeats: actList,
            brainstormChanged: false,
        };

        dispatch(updateProject(updatedProject));
        dispatch(setLoading(false));
    }

    const debouncedHandleStoryBeats = useRef(debounce(handleStoryBeats, 300));

    useEffect(() => {
        if (project?.projectStage === ProjectStage.STRUCTURE && !!project.brainstorm && project.brainstormChanged) {
            // handleStoryBeats();
            debouncedHandleStoryBeats.current();
        }
    }, [project?.brainstorm]);

    useEffect(() => {
        if (project?.storyBeats) {
            setSteps(project.storyBeats);
        }
    }, [project?.storyBeats]);

    const updateStoryBeats = async () => {
        if (!project) return;

        const res = await getStoryBeatsFromBrainstorming(project.brainstorm, apiKey, model, project?.uploadedText);
        if (res === 401) { dispatch(showDialogError(true)) }

        if (res) {
            if (dialogError) dispatch(showDialogError(false));

            // @ts-expect-error has this format
            const acts = res?.choices[0]?.message?.parsed?.story_beats;
            const actsList: StoryBeat[] = []

            acts?.forEach((act: string, index: number) => {
                const id = uuidv4()

                const newStoryBeatVersion: StoryBeatVersion = {
                    id: id,
                    text: act,
                    questions: undefined,
                    emotion: undefined,
                    analysis: undefined,
                    critique: undefined,
                    questionStage: MenuCardStage.UNINITIALIZED,
                    emotionStage: MenuCardStage.UNINITIALIZED,
                    analysisStage: MenuCardStage.UNINITIALIZED,
                    critiqueStage: MenuCardStage.UNINITIALIZED,
                }

                const newStoryBeat: StoryBeat = {
                    id: id,
                    text: act,
                    locked: false,
                    index: index,
                    impulses: [],
                    impulseStage: MenuCardStage.UNINITIALIZED,
                    // questions: undefined,
                    // questionStage: MenuCardStage.UNINITIALIZED,
                    // emotion: undefined,
                    // emotionStage: MenuCardStage.UNINITIALIZED,
                    versions: [newStoryBeatVersion],
                    selectedVersionId: 0,
                    projectId: project.id,
                    // analysis: undefined,
                    // analysisStage: MenuCardStage.UNINITIALIZED,
                    // critique: undefined,
                    // critiqueStage: MenuCardStage.UNINITIALIZED,
                }
                actsList.push(newStoryBeat);
            })

            return actsList;
        }
    }

    const handleFocus = (index: number) => {
        setFocusedIndex(index);
    };

    const handleBlur = () => {
        setFocusedIndex(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (!steps || !project) return;

        const {active, over} = event;

        const activeStep = steps.find(step => step.id === active.id);
        const overStep = steps.find(step => step.id === over?.id);

        if (activeStep?.locked || overStep?.locked) {
            return;
        }

        if (active.id !== over?.id) {
            const oldIndex = steps.findIndex(step => step.id === active.id);
            const newIndex = steps.findIndex(step => step.id === over?.id);
            const updatedSteps = arrayMove(steps, oldIndex, newIndex);

            setSteps(updatedSteps);
            dispatch(updateProject({...project, storyBeats: updatedSteps}));
        }
    };

    return (<Box sx={{
            flexGrow: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // marginTop: 3,
            // pt: 30,
            // maxWidth: 800
            // height: '100%',
            // height: 'calc(100% - 0px)',
            // overflowY: 'auto',
        }}>{
        !!steps && steps.length > 0
            ?
            <div onFocus={handleFirstClick}>
                <Snackbar
                    open={showSnackbar}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}>
                    <SnackbarContent style={{backgroundColor: SwaColor.primary, color: SwaColor.grey}}
                                     message={"You can drag and drop the story points to move them!"}/>
                </Snackbar>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={steps.filter(step => !step.locked)}
                                     strategy={horizontalListSortingStrategy}>
                        <Stepper sx={{width: '100%', alignItems: 'flex-start', flexGrow: 1, overflowY: 'auto'}}>
                            {!!steps && steps.length > 0 &&
                                steps.map((step, index) => (
                                    <SwaStep key={step.id}
                                             id={step.id}
                                             index={index}
                                             steps={steps}
                                             setSteps={setSteps}
                                             onFocus={() => handleFocus(index)}
                                             onBlur={() => handleBlur()}
                                             focused={focusedIndex !== null && focusedIndex !== index}
                                             handleFirstClick={() => {}}
                                    />))
                            }
                        </Stepper>
                    </SortableContext>
                </DndContext>
            </div>
            : <Stepper sx={{width: '100%', alignItems: 'flex-start'}}>
                {Array(5).fill(null).map((_, index) => (
                    <SwaStepSkeleton key={index} showIcon={0 < index && index < 4}/>
                ))}
            </Stepper>
        }</Box>
    )
}

export default Structure;