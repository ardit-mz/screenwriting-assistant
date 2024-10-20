import React, {useEffect, useRef, useState} from "react";
import {Button, Skeleton, Step, StepLabel, TextField, Tooltip} from "@mui/material";
import {CSS} from '@dnd-kit/utilities';
import SwaStepIcon from "../../icons/SwaStepIcon.tsx";
import SwaStepButton from "./SwaStepButton.tsx";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddStepConnector from "./SwaStepConnector.tsx";
import {StoryBeat, StoryBeatVersion} from "../../types/StoryBeat";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {
    selectCurrentProject, selectLoading, updateProject,
    updateStoryBeat,
    updateStoryBeatImpulses,
    updateStoryBeats
} from "../../features/project/ProjectSlice.ts";
import ImpulseCard from "../card/ImpulseCard.tsx";
import PaginationVersions from "../version/PaginationVersions.tsx";
import DeleteIconButton from "../button/DeleteIconButton.tsx";
import {v4 as uuidv4} from "uuid";
import {getStoryBeatImpulse, rewriteStoryBeat, rewriteStoryBeatImpulse} from "../../api/openaiAPI.ts";
import SwaStepSkeleton from "../skeleton/SwaStepSkeleton.tsx";
import ImpulseSkeleton from "../skeleton/ImpulseSkeleton.tsx";
import {useSortable} from "@dnd-kit/sortable";
import {selectApiKey, selectModel} from "../../features/model/ModelSlice.ts";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import IconButton from "@mui/material/IconButton";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";
import {showDialogError} from "../../features/drawer/DrawerSlice.ts";
import {storyBeatSToString} from "../../helper/StringHelper.ts";

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
    const model = useSelector(selectModel);
    const textFieldRef = useRef<HTMLDivElement>(null);

    const [completed] = useState<{ [k: number]: boolean }>({});
    // const [isLoadingImpulses, setIsLoadingImpulses] = useState<boolean>(false);
    const [rewritingStep, setRewritingStep] = useState<boolean>(false);
    const [rewriteImpulse, setRewriteImpulse] = useState<{ [k: number]: boolean }>({});
    const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
    const [active, setActive] = useState<boolean>(false);
    const [stepWidth, setStepWidth] = useState<number | string>('auto');

    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    useEffect(() => {
        if (textFieldRef.current) {
            setStepWidth(textFieldRef.current.offsetWidth);
        }
    },[]);

    const handleFocus = () => {
        setActive(true);
        handleFirstClick();
        onFocus();
    };

    const scriptNeedsUpdate = () => {
        if (project?.script && !project.script.needsUpdate) {
            dispatch(updateProject({
                    ...project,
                    script: {...project?.script, needsUpdate: true}
                }
            ))
        }
    }

    const handleVersionChange = (versionIndex: number) => {
        setCurrentVersionIndex(versionIndex);

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: {...steps[index], selectedVersionId: versionIndex}
            }));
        }
    }

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

        try {
            const promptRewriteStoryBeat = `
            My story beats are: ${storyBeatSToString(project.storyBeats)}.
            The story beat you have to rewrite is ${steps[index].text}.
            `;

            const response = await rewriteStoryBeat(promptRewriteStoryBeat, apiKey, model);

            if (typeof response === 'number') {
                if (response === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const text = response?.choices[0]?.message?.content ?? "";

                const newStoryBeatVersion: StoryBeatVersion = {
                    id: uuidv4(),
                    text: text,
                    questions: undefined,
                    emotion: undefined,
                    analysis: undefined,
                    critique: undefined,
                    questionStage: MenuCardStage.UNINITIALIZED,
                    emotionStage: MenuCardStage.UNINITIALIZED,
                    analysisStage: MenuCardStage.UNINITIALIZED,
                    critiqueStage: MenuCardStage.UNINITIALIZED,
                }

                const rewrittenStoryBeat: StoryBeat = {
                    ...steps[index],
                    text: text,
                    selectedVersionId: steps[index].versions.length,
                    versions: [
                        ...(steps[index].versions || []),
                        newStoryBeatVersion,
                    ],
                };

                const finalUpdatedSteps = steps.map((step, i) =>
                    i === index ? rewrittenStoryBeat : step
                );

                setSteps(finalUpdatedSteps);

                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: rewrittenStoryBeat
                }))

                setCurrentVersionIndex(steps[index].versions.length);
                scriptNeedsUpdate();
            }
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

        scriptNeedsUpdate();
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

        scriptNeedsUpdate();
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

        scriptNeedsUpdate();
    };

    const handleStepTextChange = (newText: string) => {
        if (!steps) return;

        const updatedSteps = steps.map((step, i) => {
            if (i === index) {
                if (step.versions && step.versions[currentVersionIndex]) {
                    const currVersion = step.versions[currentVersionIndex];
                    const updateStage = (stage: MenuCardStage) => stage === MenuCardStage.UNINITIALIZED ? stage : MenuCardStage.NEEDS_UPDATE;
                    const updatedVersion = {
                        ...currVersion,
                        text: newText,
                        emotionStage: updateStage(currVersion.emotionStage),
                        questionStage: updateStage(currVersion.questionStage),
                        analysisStage: updateStage(currVersion.analysisStage),
                        critiqueStage: updateStage(currVersion.critiqueStage),
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

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) => {
        if (onBlur) onBlur(e);
        setActive(false);
        const hasTextChanged = steps[index].text.replace(/\s+/g, '') !== e.target.value.replace(/\s+/g, '');
        if (hasTextChanged) scriptNeedsUpdate();
    }

    const addStep = async () => {
        if (!project || !steps) return;

        // setIsLoadingImpulses(true);

        const previousStep = steps[index];
        const nextStep = steps[index + 1];

        const id = uuidv4();

        const newStoryBeatVersion: StoryBeatVersion = {
            id: id,
            text: "",
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
            text: "",
            locked: false,
            index: index + 1,
            impulses: [],
            impulseStage: MenuCardStage.LOADING,
            versions: [newStoryBeatVersion],
            selectedVersionId: 0,
            // questions: undefined,
            // questionStage: MenuCardStage.UNINITIALIZED,
            // emotion: undefined,
            // emotionStage: MenuCardStage.UNINITIALIZED,
            projectId: project.id,
            // analysis: undefined,
            // analysisStage: MenuCardStage.UNINITIALIZED,
            // critique: undefined,
            // critiqueStage: MenuCardStage.UNINITIALIZED,
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
            const response = await getStoryBeatImpulse(
                project.storyBeats,
                previousStep?.index,
                nextStep?.index,
                undefined,
                apiKey,
                model
            );

            if (response === 401) { dispatch(showDialogError(true));}
            else {dispatch(showDialogError(false));}
            // @ts-expect-error It has this format
            const impulses = response?.choices[0]?.message?.parsed?.impulses || [];

            const updatedStoryBeat: StoryBeat = {
                ...newStoryBeat,
                impulses: impulses,
                impulseStage: MenuCardStage.SHOWN,
                // questionStage: MenuCardStage.HIDDEN, // TODO check if needed
                // emotionStage: MenuCardStage.HIDDEN
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
            i === index
                ? {...step,
                    text: impulse,
                    impulses: [],
                    impulseStage: MenuCardStage.HIDDEN,
                    versions: [{...step.versions[0], text: impulse}]
                }
                : step
        );
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: updatedSteps[index]
            }));
        }

        scriptNeedsUpdate();
    };

    const handleRewriteImpulse = async (impulseIndex: number, impulse: string) => {
        if (!steps) return;

        setRewriteImpulse(prevImpulses => ({
            ...prevImpulses,
            [impulseIndex]: true,
        }));

        const response = await rewriteStoryBeatImpulse(impulse, apiKey, model);

        if (typeof response === 'number') {
            if (response === 401) dispatch(showDialogError(true));
        } else {
            dispatch(showDialogError(false));
            const newImpulse = response?.choices[0]?.message?.content ?? "";

            const updatedImpulses = [...steps[index].impulses];
            updatedImpulses[impulseIndex] = newImpulse;

            const updatedSteps = steps.map((step, i) =>
                i === index ? {...step, impulses: updatedImpulses} : step
            );

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
        }
    };

    const handleDeleteImpulse = (impulseIndex: number) => {
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

            // TODO add only one more impulse at a time
            const response = await getStoryBeatImpulse(
                project.storyBeats,
                previousStep?.index,
                nextStep?.index,
                index,
                apiKey,
                model
            );
            if (response === 401) {
                dispatch(showDialogError(true));
            } else {dispatch(showDialogError(false));}
            // @ts-expect-error It has this format
            const newImpulses = response?.choices[0]?.message?.parsed?.impulses || [];

            const updatedStep = {
                ...steps[index],
                impulses: [...steps[index].impulses, ...newImpulses],
                impulseStage: MenuCardStage.SHOWN,
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
                i === index ? {...step, impulseStage: MenuCardStage.SHOWN} : step
            );
            setSteps(finalSteps);
        }
    }

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
                                           {...attributes} >
        <div style={{display: 'flex', flexDirection: 'column', minWidth: 300, maxWidth: 300}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div style={{display: 'flex'}}>
                    <StepLabel icon={<SwaStepIcon index={index} active={active}/>}/>
                    <SwaStepButton icon={steps[index].locked ? <LockIcon/> : <LockOpenIcon/>}
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
                                            onChange={(newPageIndex) => handleVersionChange(newPageIndex - 1)}
                                            style={{justifyContent: "end", marginTop: 0}}/>}

                    <DeleteIconButton onClick={() => removeStep()}
                                      disabled={steps[index].locked}/>
                </div>
            </div>

            <TextField ref={textFieldRef}
                       fullWidth
                       multiline
                       margin={"normal"}
                       variant='outlined'
                       value={steps[index].versions?.[currentVersionIndex]?.text || steps[index].text || ''}
                       disabled={steps[index].locked ?? steps[index].locked}
                       onBlur={(e) => handleBlur(e)}
                       onFocus={handleFocus}
                       InputProps={{style: {color: focused ? '#777777' : '#3E3E3E'}}}
                       onChange={(e) => handleStepTextChange(e.target.value)}
                       style={{minWidth: 300, marginBottom: 0}}
            />
            <Tooltip title={"Drag and drop the story beat"}>
                <IconButton  {...listeners}> <DragIndicatorIcon style={{ transform: "rotate(90deg)"}} /> </IconButton>
            </Tooltip>
            {
                steps[index]?.impulseStage === MenuCardStage.LOADING
                    ? <> {Array(3).fill(null).map(() => (<ImpulseSkeleton key={uuidv4()}/>))}
                        <Skeleton variant="rounded" width={266} height={36} style={{marginTop: 16, marginRight: 32}}/>
                    </>
                    : (steps[index]?.impulseStage === MenuCardStage.SHOWN)
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
                        <Button onClick={moreImpulses} sx={{mt: 2, mr: 4, width: stepWidth}} variant="outlined">More</Button>
                    </>
            }
        </div>
        <AddStepConnector onClick={addStep}/>
    </Step>
    }</>)
}

export default SwaStep;