import React, {useState} from "react";
import {Button, Skeleton, Step, StepLabel, TextField} from "@mui/material";
import {CSS} from '@dnd-kit/utilities';
import SwaStepIcon from "../../icons/SwaStepIcon.tsx";
import SwaStepButton from "./SwaStepButton.tsx";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LockIcon from "@mui/icons-material/Lock";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {ImpulseStage} from "../../enum/ImpulseStage.ts";
import AddStepConnector from "./SwaStepConnector.tsx";
import {StoryBeat} from "../../types/StoryBeat";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {
    selectCurrentProject, selectLoading,
    updateStoryBeat,
    updateStoryBeatImpulses,
    updateStoryBeats
} from "../../features/project/ProjectSlice.ts";
import ImpulseCard from "../card/ImpulseCard.tsx";
import PaginationVersions from "../version/PaginationVersions.tsx";
import DeleteIconButton from "../button/DeleteIconButton.tsx";
import {v4 as uuidv4} from "uuid";
import {QuestionStage} from "../../enum/QuestionStage.ts";
import {UniversalEmotionStage} from "../../enum/UniversalEmotionStage.ts";
import {getStoryBeatImpulse, rewriteStoryBeat, rewriteStoryBeatImpulse} from "../../api/openaiAPI.ts";
import SwaStepSkeleton from "../skeleton/SwaStepSkeleton.tsx";
import ImpulseSkeleton from "../skeleton/ImpulseSkeleton.tsx";
import {useSortable} from "@dnd-kit/sortable";
import {selectApiKey} from "../../features/model/ModelSlice.ts";

interface SwaStepProps {
    id: string;
    index: number;
    steps: StoryBeat[];
    setSteps: React.Dispatch<React.SetStateAction<StoryBeat[] | undefined>>;
    onFocus: () => void;
    onBlur: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined;
    focused: boolean;
    handleFirstClick: () => void;
}

const SwaStep: React.FC<SwaStepProps> = ({id, index, steps, setSteps, onBlur, onFocus, focused, handleFirstClick}) => {
    const dispatch = useDispatch<AppDispatch>();
    const project = useSelector(selectCurrentProject)
    const isLoading = useSelector(selectLoading);
    const apiKey = useSelector(selectApiKey);

    const [completed] = useState<{ [k: number]: boolean }>({});
    // const [isLoadingImpulses, setIsLoadingImpulses] = useState<boolean>(false);
    const [rewritingStep, setRewritingStep] = useState<boolean>(false);
    const [rewriteImpulse, setRewriteImpulse] = useState<{ [k: number]: boolean }>({});
    const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
    const [active, setActive] = useState<boolean>(false);

    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const handleFocus = () => {
        setActive(true);
        handleFirstClick();
        onFocus();
    };

    const toggleLock = () => {
        if (!steps) return;

        const isLocked = !steps[index].locked;
        const updatedSteps = steps.map((step, i) =>
            i === index ? {...step, locked: isLocked} : step
        );
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: updatedSteps[index]
            }));
        }
    }

    const rewrite = async () => {
        if (!project || !steps) return;

        setRewritingStep(true);

        console.log("steps text:", steps[index].text);
        console.log("steps versions:", steps[index].versions);

        try {
            // TODO improve prompts
            const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
            const storyBeatPrompt = `The story beat I want you to rewrite is ${steps[index].text}`;
            const response = await rewriteStoryBeat(storyBeatsStr + storyBeatPrompt, apiKey);
            const text = response?.choices[0]?.message?.content ?? "";
            console.log("res text:", text);

            const rewrittenStoryBeat = {
                ...steps[index],
                text: text,
                versions: [
                    ...(steps[index].versions || []),
                    {id: uuidv4(), text: text},
                ],
            };

            const finalUpdatedSteps = steps.map((step, i) =>
                i === index ? rewrittenStoryBeat : step
            );

            console.log("finalUpdatedSteps:", finalUpdatedSteps);

            setSteps(finalUpdatedSteps);

            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: rewrittenStoryBeat
            }))

            setCurrentVersionIndex(steps[index].versions.length)
        } catch (error) {
            console.error("Error fetching impulses for the new step:", error);
        }

        setRewritingStep(false);
    }

    const updateIndices = (steps: StoryBeat[]): StoryBeat[] => {
        return steps.map((step, index) => ({
            ...step,
            index: index + 1,
        }));
    };

    const moveLeft = () => {
        if (!steps || index < 1) return;

        const newSteps = [...steps];
        [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
        const updatedSteps = updateIndices(newSteps);
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeats({
                projectId: project.id,
                storyBeats: updatedSteps
            }));
        }
    };

    const moveRight = () => {
        if (!steps || index > steps.length) return;

        const newSteps = [...steps];
        [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]];
        const updatedSteps = updateIndices(newSteps);
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeats({
                projectId: project.id,
                storyBeats: updatedSteps
            }));
        }
    };

    const removeStep = () => {
        if (!steps) return;

        const updatedSteps = steps.filter((_, i) => i !== index);
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeats({
                projectId: project.id,
                storyBeats: updatedSteps
            }));
        }
    };

    const handleStepTextChange = (newText: string) => {
        if (!steps) return;

        const updatedSteps = steps.map((step, i) => {
            if (i === index) {
                if (step.versions && step.versions[currentVersionIndex]) {
                    const updatedVersion = {
                        ...step.versions[currentVersionIndex],
                        text: newText
                    };

                    const updatedVersions = [
                        ...step.versions.slice(0, currentVersionIndex),
                        updatedVersion,
                        ...step.versions.slice(currentVersionIndex + 1)
                    ];

                    return {...step, versions: updatedVersions};
                }
                return {...step, text: newText};
            }
            return step;
        });

        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: updatedSteps[index]
            }));
        }
    };

    const addStep = async () => {
        if (!project || !steps) return;

        // setIsLoadingImpulses(true);

        const previousStep = steps[index];
        const nextStep = steps[index + 1];

        const id = uuidv4();
        const newStoryBeat: StoryBeat = {
            id: id,
            text: "",
            locked: false,
            index: index + 1,
            impulses: [],
            impulseStage: ImpulseStage.LOADING,
            versions: [{id: id, text: ""}],
            questions: undefined,
            questionStage: QuestionStage.UNINITIALIZED,
            universalEmotion: undefined,
            universalEmotionStage: UniversalEmotionStage.UNINITIALIZED,
            project: project,
            analysis: undefined,
            critique: undefined,
        }

        const updatedSteps = [
            ...steps.slice(0, index + 1),
            newStoryBeat,
            ...steps.slice(index + 1)
        ];
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeats({
                projectId: project.id,
                storyBeats: updatedSteps
            }));
        }

        try {
            const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
            const storyBeatPrompt = `I need impulses just for the new story beat between the current story beats: ${previousStep?.index} and : ${nextStep?.index}`;
            const response = await getStoryBeatImpulse(storyBeatsStr + storyBeatPrompt, apiKey);
            console.log("SwaStep addStep response", response);

            // @ts-expect-error It has this format
            const impulses = response?.choices[0]?.message?.parsed?.impulses || [];

            const updatedStoryBeat: StoryBeat = {
                ...newStoryBeat,
                impulses: impulses,
                impulseStage: ImpulseStage.SHOWN,
                questionStage: QuestionStage.HIDDEN,
                universalEmotionStage: UniversalEmotionStage.HIDDEN
            };

            const finalUpdatedSteps = [
                ...updatedSteps.slice(0, index + 1),
                updatedStoryBeat,
                ...updatedSteps.slice(index + 2)
            ];
            setSteps(finalUpdatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }
        } catch (error) {
            console.error("Error fetching impulses for the new step:", error);
        }

        const updateIndices = (steps: StoryBeat[]) => {
            return steps.map((step, index) => ({
                ...step,
                index: index,
            }));
        };

        const updatedStepsIndices = updateIndices([...steps]);
        setSteps(updatedStepsIndices);
        // setIsLoadingImpulses(false);
    };

    const handleAddImpulse = (impulse: string) => {
        if (!steps) return;

        const updatedSteps = steps.map((step, i) =>
            i === index ? {...step, text: impulse, impulses: [], impulseStage: ImpulseStage.HIDDEN} : step
        );
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: updatedSteps[index]
            }));
        }
    };

    const handleRewriteImpulse = async (impulseIndex: number, impulse: string) => {
        if (!steps) return;
        console.log("Steps", steps)
        setRewriteImpulse(prevImpulses => ({
            ...prevImpulses,
            [impulseIndex]: true,
        }));

        // TODO improve rewriteStoryBeatImpulse prompt
        const response = await rewriteStoryBeatImpulse(impulse, apiKey);
        const newImpulse = response?.choices[0]?.message?.content ?? "";
        console.log("newImpulse", newImpulse)

        const updatedImpulses = [...steps[index].impulses];
        updatedImpulses[impulseIndex] = newImpulse;

        const updatedSteps = steps.map((step, i) =>
            i === index ? {...step, impulses: updatedImpulses} : step
        );

        console.log("updatedSteps", updatedSteps)

        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeatImpulses({
                projectId: project.id,
                storyBeatId: steps[index].id,
                impulses: updatedImpulses
            }));
        }

        setRewriteImpulse(prevImpulses => ({
            ...prevImpulses,
            [impulseIndex]: false,
        }));
        console.log("steps 2", steps)

    };

    const handleDeleteImpulse = (impulseIndex: number) => {
        console.log("impulseIndex", impulseIndex)
        if (!steps || !steps[index]) return;

        const updatedImpulses = steps[index]?.impulses?.filter((_, i) => i !== impulseIndex) || [];
        const updatedStep = {...steps[index], impulses: updatedImpulses};
        const updatedSteps = [...steps.map((step, i) => i === index ? updatedStep : step)];
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeatImpulses({
                projectId: project.id,
                storyBeatId: steps[index].id,
                impulses: updatedImpulses
            }));
        }
    };

    const moreImpulses = async () => {
        if (!steps || !project) return;

        try {
            const previousStep = steps[index - 1];
            const nextStep = steps[index + 1];

            // TODO improve moreImpulses prompt
            // TODO add only one more impulse at a time
            const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
            const storyBeatPrompt = `I need more impulses for the current story beat between the story beats: ${previousStep?.index ?? ''} and ${nextStep?.index ?? ''}.\n`
            const storyBeatPrompt2 = `The impulses I have so far are ${steps[index].impulses.map((s, i) => `${i + 1}: ${s}`).join('\n')}`;
            const response = await getStoryBeatImpulse(storyBeatsStr + storyBeatPrompt + storyBeatPrompt2, apiKey);

            // @ts-expect-error It has this format
            const newImpulses = response?.choices[0]?.message?.parsed?.impulses || [];

            const updatedStep = {
                ...steps[index],
                impulses: [...steps[index].impulses, ...newImpulses],
                impulseStage: ImpulseStage.SHOWN,
            };

            const finalUpdatedSteps = steps.map((step, i) =>
                i === index ? updatedStep : step
            );

            setSteps(finalUpdatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeatImpulses({
                    projectId: project.id,
                    storyBeatId: updatedStep.id,
                    impulses: updatedStep.impulses
                }));
            }
        } catch (error) {
            console.error("Error fetching more impulses:", error);
        } finally {
            const finalSteps = steps.map((step, i) =>
                i === index ? {...step, impulseStage: ImpulseStage.SHOWN} : step
            );
            setSteps(finalSteps);
        }
    }

    // console.log("SwaStep steps", steps)

    return (<>{(rewritingStep || (isLoading && !steps[index].locked))
        ? <SwaStepSkeleton showIcon={0 < index && index < steps.length}/>
        : !!steps && steps[index] && <Step key={steps[index].id}
                                           completed={completed[index]}
                                           style={{
                                               display: 'flex',
                                               flexDirection: 'row',
                                               alignItems: 'flex-start',
                                               padding: 0,
                                               position: 'relative',
                                               overflowX: 'visible',
                                               ...style
                                           }}
                                           ref={setNodeRef}
                                           {...attributes}
                                           {...listeners} >
        <div style={{display: 'flex', flexDirection: 'column', minWidth: 300, maxWidth: 300}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div style={{display: 'flex'}}>
                    <StepLabel icon={<SwaStepIcon index={index} active={active}/>}/>
                    <SwaStepButton icon={steps[index].locked ? <LockIcon/> : <LockOutlinedIcon/>}
                                   title={!steps[index].locked ? "Lock story beat so it cannot be changed or rewritten" : "Unlock this story beat so it can be changed or rewritten"}
                                   onClick={toggleLock}/>
                    <SwaStepButton icon={<RefreshOutlinedIcon/>}
                                   title={"Rewrite story beat"}
                                   onClick={() => rewrite()}
                                   disabled={steps[index].locked}/>
                    {index != 0 && <SwaStepButton icon={<ArrowBackIcon/>}
                                                  title={"Move story beat to the left"}
                                                  onClick={moveLeft}
                                                  disabled={steps[index].locked}/>}
                    {index != steps?.length - 1 && <SwaStepButton icon={<ArrowForwardIcon/>}
                                                                  title={"Move story beat to the right"}
                                                                  onClick={moveRight}
                                                                  disabled={steps[index].locked}/>}
                </div>
                <div style={{display: 'flex'}}>
                    {steps[index].versions?.length > 1 &&
                        <PaginationVersions totalPages={steps[index].versions?.length}
                                            currentVersion={currentVersionIndex + 1}
                                            onChange={(newPageIndex) => setCurrentVersionIndex(newPageIndex - 1)}
                                            style={{justifyContent: "end", marginTop: 0}}/>}

                    <DeleteIconButton onClick={() => removeStep()}
                                      disabled={steps[index].locked}/>
                </div>
            </div>

            <TextField fullWidth
                       multiline
                       margin={"normal"}
                       variant='outlined'
                       value={steps[index].versions?.[currentVersionIndex]?.text || steps[index].text || ''}
                       disabled={steps[index].locked ?? steps[index].locked}
                       onBlur={(e) => {
                           if (onBlur) onBlur(e);
                           setActive(false)
                       }}
                       onFocus={handleFocus}
                       InputProps={{style: {color: focused ? '#777777' : '#3E3E3E'}}}
                       onChange={(e) => handleStepTextChange(e.target.value)}
                       style={{minWidth: 300}}
            />

            {
                steps[index]?.impulseStage === ImpulseStage.LOADING
                    ? <> {Array(3).fill(null).map(() => (<ImpulseSkeleton key={uuidv4()}/>))}
                        <Skeleton variant="rounded" width={266} height={36} style={{marginTop: 16, marginRight: 32}}/>
                    </>
                    : (steps[index]?.impulseStage === ImpulseStage.SHOWN)
                    && <>{steps[index]?.impulses.map((impulse, indexImpulseCard) =>
                        <ImpulseCard key={`${impulse}-${indexImpulseCard}`}
                                     impulse={impulse}
                                     index={indexImpulseCard}
                                     handleAdd={() => handleAddImpulse(impulse)}
                                     handleRewrite={() => handleRewriteImpulse(indexImpulseCard, impulse)}
                                     handleDelete={() => handleDeleteImpulse(indexImpulseCard)}
                                     loading={rewriteImpulse[indexImpulseCard] ?? false}
                        />
                    )}
                        <Button onClick={moreImpulses} sx={{mt: 2, mr: 4}} variant="outlined">More</Button>
                    </>
            }
        </div>
        <AddStepConnector onClick={addStep}/>
    </Step>
    }</>)
}

export default SwaStep;