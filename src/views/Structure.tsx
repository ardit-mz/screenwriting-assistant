// views/Structure.tsx

import {Snackbar, SnackbarContent, Stepper} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../store.ts";
import {selectCurrentProject, selectLoading, setLoading, updateProject} from "../features/project/ProjectSlice.ts";
import {ProjectStage} from "../enum/ProjectStage.ts";
import {getStoryBeatsFromBrainstorming} from "../api/openaiAPI.ts";
import {ImpulseStage} from "../enum/ImpulseStage.ts";
import {QuestionStage} from "../enum/QuestionStage.ts";
import {UniversalEmotionStage} from "../enum/UniversalEmotionStage.ts";
import {StoryBeat} from "../types/StoryBeat";
import {v4 as uuidv4} from "uuid";
import SwaStep from "../components/stepper/SwaStep.tsx";
import {Project} from "../types/Project";
import SwaStepSkeleton from "../components/skeleton/SwaStepSkeleton.tsx";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, arrayMove, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import {SwaColor} from "../enum/SwaColor.ts";
import {selectDndOptionShown, setDndOptionShown} from "../features/snackbar/SnackbarSlice.ts";
import {selectApiKey} from "../features/model/ModelSlice.ts";

const Structure = () => {
    const dispatch = useDispatch<AppDispatch>();
    const project = useSelector(selectCurrentProject)
    const isLoading = useSelector(selectLoading);
    const dndOptionShown = useSelector(selectDndOptionShown);
    const apiKey = useSelector(selectApiKey);

    const [steps, setSteps] = useState(project?.storyBeats);
    const scrollContainerRef = useRef(null);
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

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        const onWheel = (event: WheelEvent) => {
            if (event.deltaY !== 0 && scrollContainer) {
                (scrollContainer as HTMLElement).scrollLeft += event.deltaY;
                event.preventDefault();
            }
        };

        if (scrollContainer) {
            (scrollContainer as HTMLElement).addEventListener('wheel', onWheel);
        }

        return () => {
            if (scrollContainer) {
                (scrollContainer as HTMLElement).removeEventListener('wheel', onWheel);
            }
        };
    }, []);

    const handleStoryBeats = async () => {
        if (!project) return;

        dispatch(setLoading(true));
        const actList = await updateStoryBeats() ?? [];
        const updatedProject: Project = {
            ...project,
            storyBeats: actList
        };

        dispatch(updateProject(updatedProject))
        dispatch(setLoading(false));
    }

    useEffect(() => {
        if (!!project?.storyBeats && project.storyBeats.length > 0) {
            return;
        }

        if (!!project && project.projectStage === ProjectStage.STRUCTURE) {
            handleStoryBeats();
        }
    }, []);

    useEffect(() => {
        if (project?.storyBeats) {
            setSteps(project.storyBeats);
        }
    }, [project?.storyBeats]);

    const updateStoryBeats = async () => {
        if (!project) return;

        let brainstormingPrompt = `"My brainstorm for this story is:\\n\\${project.brainstorm}\\n`;
        if (project?.uploadedText) {
            brainstormingPrompt += `Also here are some more ideas for reference for style:\\n\\${project.uploadedText}\\n`;
        }
        const res = await getStoryBeatsFromBrainstorming(brainstormingPrompt, apiKey);

        if (res) {
            // @ts-expect-error has this format
            const acts = res?.choices[0]?.message?.parsed?.story_beats;
            console.log("acts", acts)
            const actsList: StoryBeat[] = []

            acts?.forEach((act: string, index: number) => {
                const id = uuidv4()
                const newStoryBeat: StoryBeat = {
                    id: id,
                    text: act,
                    locked: false,
                    index: index,
                    impulses: [],
                    impulseStage: ImpulseStage.UNINITIALIZED,
                    questions: undefined,
                    questionStage: QuestionStage.UNINITIALIZED,
                    universalEmotion: undefined,
                    universalEmotionStage: UniversalEmotionStage.UNINITIALIZED,
                    versions: [{id: id, text: act}],
                    project: project,
                    analysis: undefined,
                    critique: undefined,
                }
                actsList.push(newStoryBeat);
            })

            return actsList
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


    console.log("isLoading", isLoading)

    return (<>{
            // isLoading
            //     ? <Stepper sx={{width: '100%', alignItems: 'flex-start'}}>
            //         {Array(5).fill(null).map((_, index) => (
            //             <SwaStepSkeleton key={index} showIcon={0 < index && index < 4}/>
            //         ))}
            //     </Stepper>
            //     :
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
                        <Stepper sx={{width: '100%', alignItems: 'flex-start'}}>
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
                                             handleFirstClick={() => {
                                             }}
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
        }</>
    )
}

export default Structure;