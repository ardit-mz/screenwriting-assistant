// views/Refinement.tsx

import Box from "@mui/material/Box";
import {useEffect, useRef, useState} from "react";
import {Skeleton, StepLabel, TextField} from "@mui/material";
import SwaStepIcon from "../icons/SwaStepIcon.tsx";
import AddStepConnector from "../components/stepper/SwaStepConnector.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentProject, updateStoryBeat, updateStoryBeats} from "../features/project/ProjectSlice.ts";
import {AppDispatch} from "../store.ts";
import FloatingContextMenu from "../components/menu/FloatingContextMenu.tsx";
import PaginationVersions from "../components/version/PaginationVersions.tsx";
import RefinementSideCard from "../components/card/RefinementSideCard.tsx";
import {critiqueSentence, extendSentence, getStoryBeatImpulse, rephraseSentence} from "../api/openaiAPI.ts";
import {v4 as uuidv4} from "uuid";
import {StoryBeat} from "../types/StoryBeat";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import {ImpulseStage} from "../enum/ImpulseStage.ts";
import {QuestionStage} from "../enum/QuestionStage.ts";
import {UniversalEmotionStage} from "../enum/UniversalEmotionStage.ts";
import {MenuItem} from "../enum/MenuItem.ts";
import RefinementMenuCards from "../components/card/RefinementMenuCards.tsx";
import RefinementMenu from "../components/menu/RefinementMenu.tsx";

const Refinement = () => {
    const project = useSelector(selectCurrentProject);
    const dispatch = useDispatch<AppDispatch>();
    const apiKey = useSelector(selectApiKey);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const textFieldContainerRef = useRef<HTMLDivElement>(null);

    const [steps, setSteps] = useState(project?.storyBeats);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [selectedStep, setSelectedStep] = useState<StoryBeat>();
    const [currentStepText, setCurrentStepText] = useState<string>(steps ? steps[currentStepIndex].text : '');
    const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<boolean>(false);
    const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);
    const [menuSecondTitle, setMenuSecondTitle] = useState<string>('');
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);
    const [menuWidth, setMenuWidth] = useState<number | string>('auto');
    const [rephrasedSentence, setRephrasedSentence] = useState<string>("");
    const [extendedSentence, setExtendedSentence] = useState<string>("");
    const [sentenceCritique, setSentenceCritique] = useState<string>("");

    useEffect(() => {
        if (steps) {
            const step = steps[currentStepIndex];
            const version = step?.versions[currentVersionIndex];
            setCurrentStepText(version?.text || '');
            setSelectedStep(step);
        }
    }, [currentStepIndex, currentVersionIndex]);

    useEffect(() => {
        if (contextMenuRef.current) {
            setMenuWidth(contextMenuRef.current.offsetWidth);
        }
    }, [contextMenuRef.current]);

    const handleStepTextChange = (newText: string) => {
        if (!steps || !selectedStep) return;

        const updatedStep: StoryBeat = {
            ...selectedStep,
            text: newText,
            versions: selectedStep.versions.map((version) =>
                version.id === selectedStep.versions[currentVersionIndex].id
                    ? { ...version, text: newText }
                    : version
            ),
        }

        const updatedSteps = steps.map((step, index) =>
            index === currentStepIndex ? updatedStep : step
        );

        setSteps(updatedSteps);
        setCurrentStepText(newText);
    };

    const handleStepTextBlur = () => {
        if (!project || !selectedStep) return;

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: selectedStep,
            }));
        }
    };

    const handlePrev = () => {
        if (steps && currentStepIndex > 0) {
            // setCurrentStepText(steps[currentStepIndex - 1].text);
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleNext = () => {
        if (steps && currentStepIndex < steps?.length - 1) {
            // setCurrentStepText(steps[currentStepIndex + 1].text);
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    // const moveLeft = () => console.log("Refinement moveLeft");
    // const moveRight = () => console.log("Refinement moveRight");

    const addStep = async (newIndex: number) => {
        if (!project || !steps || !selectedStep) return;

        setMenuSecondTitle("Adding a new story beat");
        setLoadingStep(true);
        setLoadingMenu(true);

        const id = uuidv4();
        const newStoryBeat: StoryBeat = {
            id: id,
            text: "",
            locked: false,
            index: newIndex,
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
            ...steps.slice(0, newIndex),
            newStoryBeat,
            ...steps.slice(newIndex)
        ];
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeats({
                projectId: project.id,
                storyBeats: updatedSteps
            }));
        }

        try {
            const previousStep = steps[newIndex - 1];
            const nextStep = steps[newIndex + 1];
            const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
            const storyBeatPrompt = `I need impulses just for the new story beat between the current story beats: ${previousStep?.index} and : ${nextStep?.index}`;
            const response = await getStoryBeatImpulse(storyBeatsStr + storyBeatPrompt, apiKey);
            console.log("SwaStep addStep response", response);

            // @ts-expect-error It has this format
            const impulses = response?.choices[0]?.message?.parsed?.impulses || [];

            console.log("impulses", impulses)
            const updatedStoryBeat: StoryBeat = {
                ...newStoryBeat,
                impulses: impulses,
                impulseStage: ImpulseStage.SHOWN,
                questionStage: QuestionStage.HIDDEN,
                universalEmotionStage: UniversalEmotionStage.HIDDEN
            };

            console.log("updatedStoryBeat", updatedStoryBeat)

            const finalUpdatedSteps = [
                ...updatedSteps.slice(0, newIndex),
                updatedStoryBeat,
                ...updatedSteps.slice(newIndex + 1)
            ];
            console.log("finalUpdatedSteps", finalUpdatedSteps)


            const updatedStepsWithIndices = finalUpdatedSteps.map((step, index) => ({
                ...step,
                index: index,
            }));

            setSteps(updatedStepsWithIndices);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }

            setSelectedStep(updatedStoryBeat);
        } catch (error) {
            console.error("Error fetching impulses for the new step:", error);
        }

        setCurrentStepIndex(newIndex);
        setCurrentStepText(newStoryBeat.text);
        setLoadingMenu(false);
        setLoadingStep(false);
        setMenuSecondTitle('');
    };

    const goToStoryBeat = (index: number) => {
        if (!steps || index === currentStepIndex) return;

        setCurrentStepIndex(index);
        setSelectedStep(steps[index]);
        setCurrentStepText(steps[index].text);
    }

    const removeStep = () => {
        if (!steps || !selectedStep) return;

        const updatedSteps = steps.filter((_, i) => i !== currentStepIndex);
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeats({
                projectId: project.id,
                storyBeats: updatedSteps
            }));
        }

        if (currentStepIndex >= updatedSteps.length) {
            setCurrentStepIndex(updatedSteps.length - 1);
        } else {
            setCurrentStepIndex(currentStepIndex);
        }
    }

    const handleSentenceRephrase = async (selectedText: string) => {
        if (!steps || !selectedStep) return;
        setSelectedMenuItem(MenuItem.REPHRASE);
        if (rephrasedSentence) setRephrasedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Rephrase this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${currentStepText}`

        try {
            const rephraseRes = await rephraseSentence(prompt + context, apiKey);
            const rephrasedNew = rephraseRes?.choices[0].message.content ?? '';
            setRephrasedSentence(rephrasedNew);
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const handleSentenceExpand = async (selectedText: string) => {
        if (!steps || !selectedStep) return;
        setSelectedMenuItem(MenuItem.EXPAND);
        if (extendedSentence) setExtendedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Continue on writing from this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${currentStepText}`

        try {
            const extendedRes = await extendSentence(prompt + context, apiKey);
            const extendedNew = extendedRes?.choices[0].message.content ?? '';
            setExtendedSentence(extendedNew);
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const handleSentenceCritique = async (selectedText: string) => {
        if (!steps || !selectedStep) return;
        setSelectedMenuItem(MenuItem.CRITIQUE_SENTENCE);
        if (sentenceCritique) setSentenceCritique('');
        setHighlightedText(selectedText);

        const prompt = `Critique this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${currentStepText}`

        try {
            const critiqueRes = await critiqueSentence(prompt + context, apiKey);
            const critiqueNew = critiqueRes?.choices[0].message.content ?? '';
            setSentenceCritique(critiqueNew);
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    // console.log("Refinement steps", steps)

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'start',
            marginTop: 4,
            width: '100vw',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {(!!steps && steps.length > 0 && !!selectedStep)
                ? <>
                    {/* Left */}
                    {currentStepIndex > 0 &&
                        <Box sx={{
                            flex: 1,
                            flexDirection: 'row',
                            display: 'flex',
                        }}>
                            <RefinementSideCard onClick={handlePrev}
                                                index={currentStepIndex - 1}
                                                text={steps[currentStepIndex - 1]?.text}
                                                tooltip="Select previous story beat"/>
                        </Box>
                    }
                    <AddStepConnector onClick={() => addStep(currentStepIndex)}/>

                    {/* Middle */}
                    <Box style={{
                        display: 'flex',
                        flex: 8,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        padding: 0,
                        backgroundColor: '',
                        boxShadow: "none",
                        width: '100%',
                    }}
                    >
                        <Box style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 6,
                        }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: "space-between",
                                }}>

                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                    <StepLabel icon={<SwaStepIcon index={currentStepIndex}/>}></StepLabel>
                                    {/*<SwaStepButton icon={<ArrowBackIcon/>}*/}
                                    {/*               title={"Move story beat to the left"}*/}
                                    {/*               onClick={moveLeft}*/}
                                    {/*               disabled={loadingMenu}/>*/}
                                    {/*<SwaStepButton icon={<ArrowForwardIcon/>}*/}
                                    {/*               title={"Move story beat to the right"}*/}
                                    {/*               onClick={moveRight}*/}
                                    {/*               disabled={loadingMenu}/>*/}
                                </div>

                                {steps[currentStepIndex].versions?.length > 1
                                    && <PaginationVersions totalPages={selectedStep.versions.length}
                                                           onChange={(newPageIndex) => setCurrentVersionIndex(newPageIndex - 1)}
                                                           currentVersion={currentVersionIndex + 1}
                                                           disabled={loadingMenu}/>}
                            </div>

                            {loadingStep ? <Skeleton variant="rectangular" height={554} width={'100%'} sx={{mt: 2}}/>
                                : <div ref={textFieldContainerRef}>
                                    <TextField fullWidth
                                               multiline
                                               margin={"normal"}
                                               variant='outlined'
                                               // value={selectedStep.versions?.[currentVersionIndex]?.text || selectedStep.text || ''}
                                               value={currentStepText}
                                               onChange={(e) => handleStepTextChange(e.target.value)}
                                               onBlur={handleStepTextBlur}
                                               id="outlined-multiline-static"
                                               rows={20}
                                    />
                                </div>
                            }
                        </Box>

                        <Box style={{flex: 5, marginTop: 40}}>
                            <RefinementMenu project={project}
                                            steps={steps}
                                            setSteps={setSteps}
                                            selectedStep={selectedStep}
                                            setSelectedStep={setSelectedStep}
                                            currentStepText={currentStepText}
                                            currentStepIndex={currentVersionIndex}
                                            setCurrentVersionIndex={setCurrentVersionIndex}
                                            setLoadingStep={setLoadingStep}
                                            contextMenuRef={contextMenuRef}
                                            menuSecondTitle={menuSecondTitle}
                                            setMenuSecondTitle={setMenuSecondTitle}
                                            onRemoveStep={removeStep}
                                            selectedMenuItem={selectedMenuItem}
                                            setSelectedMenuItem={setSelectedMenuItem}
                            />

                            <RefinementMenuCards project={project}
                                                 steps={steps}
                                                 setSteps={setSteps}
                                                 selectedStep={selectedStep}
                                                 setSelectedStep={setSelectedStep}
                                                 currentStepIndex={currentStepIndex}
                                                 currentVersionIndex={currentVersionIndex}
                                                 impulseStage={selectedStep?.impulseStage}
                                                 impulses={selectedStep?.impulses}
                                                 loadingMenu={loadingMenu}
                                                 selectedMenuItem={selectedMenuItem}
                                                 menuWidth={menuWidth}
                                                 rephrasedSentence={rephrasedSentence}
                                                 extendedSentence={extendedSentence}
                                                 sentenceCritique={sentenceCritique}
                                                 highlightedText={highlightedText}
                                                 onGoToStoryBeat={(stepIndex) => goToStoryBeat(stepIndex)}
                            />
                        </Box>
                    </Box>

                    <FloatingContextMenu textFieldRef={textFieldContainerRef}
                                         onRephrase={(text) => handleSentenceRephrase(text)}
                                         onExpand={(text) => handleSentenceExpand(text)}
                                         onCritique={(text) => handleSentenceCritique(text)}
                    />

                    {/* Right */}
                    <AddStepConnector onClick={() => addStep(currentStepIndex + 1)}/>

                    {currentStepIndex < steps.length &&
                        <Box sx={{
                            flex: 1,
                            flexDirection: 'row',
                            display: 'flex',
                        }}>
                            <RefinementSideCard onClick={handleNext}
                                                index={currentStepIndex + 1}
                                                text={steps[currentStepIndex + 1]?.text}
                                                tooltip="Select next story beat"/>
                        </Box>
                    }
                </>
                : <Skeleton/>
            }
        </Box>
    )
}

export default Refinement;