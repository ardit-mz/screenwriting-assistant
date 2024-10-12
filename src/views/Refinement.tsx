import Box from "@mui/material/Box";
import {useEffect, useRef, useState} from "react";
import {Skeleton, StepLabel, TextField} from "@mui/material";
import SwaStepIcon from "../icons/SwaStepIcon.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentProject, updateStoryBeat} from "../features/project/ProjectSlice.ts";
import {AppDispatch} from "../store.ts";
import FloatingContextMenu from "../components/menu/FloatingContextMenu.tsx";
import PaginationVersions from "../components/version/PaginationVersions.tsx";
import {
    critiqueSentence,
    extendSentence,
    getStoryBeatUniversalEmotion,
    getStoryBeatUniversalQuestion,
    rephraseSentence,
    rewriteStoryBeat,
    runAnalysis,
    runCritique
} from "../api/openaiAPI.ts";
import {StoryBeat} from "../types/StoryBeat";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import {MenuItem} from "../enum/MenuItem.ts";
import RefinementMenuCards from "../components/card/RefinementMenuCards.tsx";
import RefinementMenu from "../components/menu/RefinementMenu.tsx";
import NavigateToStepCard from "../components/card/NavigateToStepCard.tsx";
import {MenuCardStage} from "../enum/MenuCardStage.ts";
import {v4 as uuidv4} from "uuid";
import {ParsedChatCompletion} from "openai/resources/beta/chat/completions";
import {Question} from "../types/Question";
import {showDialogError} from "../features/drawer/DrawerSlice.ts";

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
    // }, [steps]);
    }, [steps, currentStepIndex, currentVersionIndex]);

    useEffect(() => {
        if (contextMenuRef.current) {
            setMenuWidth(contextMenuRef.current.offsetWidth);
        }
    }, [contextMenuRef.current]);

    const handleStepTextChange = (newText: string) => {
        if (!steps || !selectedStep) return;

        const hasTextChanged = selectedStep.text.replace(/\s+/g, '') !== newText.replace(/\s+/g, '');

        const updatedStep: StoryBeat = {
            ...selectedStep,
            text: newText,
            textUpdated: hasTextChanged,
            versions: selectedStep.versions.map((version) =>
                version.id === selectedStep.versions[currentVersionIndex].id
                    ? {...version, text: newText}
                    : version
            ),
            emotionStage: MenuCardStage.NEEDS_UPDATE,
            questionStage: MenuCardStage.NEEDS_UPDATE,
            critiqueStage: MenuCardStage.NEEDS_UPDATE,
            analysisStage: MenuCardStage.NEEDS_UPDATE,
        }

        // const updatedSteps = steps.map((step, index) =>
        //     index === currentStepIndex ? updatedStep : step
        // );

        // setCurrentStepText(newText);
        // setSelectedStep(updatedStep);
        // setSteps(updatedSteps);
        setSteps((prevSteps = []) =>
            prevSteps.map((step, i) => (i === currentStepIndex ? updatedStep : step))
        );
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
            const prevIndex = currentStepIndex - 1;
            // const step = steps[prevIndex];
            setCurrentStepIndex(prevIndex);
            // setCurrentStepText(step?.versions[prevIndex]?.text || step?.text || '');
            // setSelectedStep(step);
            setSelectedMenuItem(null);
        }
    };

    const handleNext = () => {
        if (steps && currentStepIndex < steps?.length - 1) {
            const nextIndex = currentStepIndex + 1;
            // const step = steps[nextIndex];
            setCurrentStepIndex(nextIndex);
            // setCurrentStepText(step?.versions[nextIndex]?.text || step?.text || '');
            // setSelectedStep(step);
            setSelectedMenuItem(null);
        }
    };

    const goToStoryBeat = (index: number) => {
        if (!steps || index === currentStepIndex) return;

        setCurrentStepIndex(index);
        // setSelectedStep(steps[index]);
        // setCurrentStepText(steps[index].text);
    }

    const handleMenuAction = async (
        menuItem: MenuItem,
        menuTitle: string,
        prompt: string,
        apiFunction: (prompt: string, apiKey: string) =>  Promise<number | ParsedChatCompletion<null> | undefined>,
        successHandler: (response: ParsedChatCompletion<null> | undefined) => StoryBeat,
        updateCondition: boolean,
    ) => {
        if (!project || !steps || !selectedStep) return;

        setSelectedMenuItem(menuItem);

        const createNewStoryBeat = (stage: MenuCardStage): StoryBeat => {
            switch(menuItem) {
                case MenuItem.EMOTION:
                    return { ...selectedStep, emotionStage: stage };
                case MenuItem.QUESTION:
                    return { ...selectedStep, questionStage: stage };
                case MenuItem.CRITIQUE:
                    return { ...selectedStep, critiqueStage: stage };
                case MenuItem.ANALYSE:
                    return { ...selectedStep, analysisStage: stage };
                default:
                    return selectedStep;
            }
        };

        const storyBeat = createNewStoryBeat(
            updateCondition ? MenuCardStage.LOADING : MenuCardStage.SHOWN
        );

        setSteps((prevSteps = []) =>
            prevSteps.map((step, i) => (i === currentStepIndex ? storyBeat : step))
        );

        if (project?.id) {
            dispatch(updateStoryBeat({ projectId: project.id, storyBeat: storyBeat }));
        }

        // if (!updateCondition) {
        //     const newStoryBeat = (): StoryBeat => {
        //         switch(menuItem) {
        //             case MenuItem.EMOTION:
        //                 return {
        //                     ...selectedStep,
        //                     emotionStage: MenuCardStage.SHOWN,
        //                 };
        //             case MenuItem.QUESTION:
        //                 return {
        //                     ...selectedStep,
        //                     questionStage: MenuCardStage.SHOWN,
        //                 };
        //             case MenuItem.CRITIQUE:
        //                 return {
        //                     ...selectedStep,
        //                     critiqueStage: MenuCardStage.SHOWN,
        //                 };
        //             case MenuItem.ANALYSE:
        //                 return {
        //                     ...selectedStep,
        //                     analysisStage: MenuCardStage.SHOWN,
        //                 };
        //             default: return selectedStep;
        //         }
        //     }
        //
        //     const updatedStoryBeat: StoryBeat = newStoryBeat();
        //     if (updatedStoryBeat) {
        //         setSteps((prevSteps = []) =>
        //             prevSteps.map((step, i) => (i === currentStepIndex ? updatedStoryBeat : step))
        //         );
        //
        //         if (project && project.id) {
        //             dispatch(updateStoryBeat({ projectId: project.id, storyBeat: updatedStoryBeat }));
        //         }
        //     }
        //
        //     return;
        // }
        if (updateCondition) {
            setMenuSecondTitle(menuTitle);

            // const newStoryBeat = (): StoryBeat => {
            //     switch(menuItem) {
            //         case MenuItem.EMOTION:
            //             return {
            //                 ...selectedStep,
            //                 emotionStage: MenuCardStage.LOADING,
            //             };
            //         case MenuItem.QUESTION:
            //             return {
            //                 ...selectedStep,
            //                 questionStage: MenuCardStage.LOADING,
            //             };
            //         case MenuItem.CRITIQUE:
            //             return {
            //                 ...selectedStep,
            //                 critiqueStage: MenuCardStage.LOADING,
            //             };
            //         case MenuItem.ANALYSE:
            //             return {
            //                 ...selectedStep,
            //                 analysisStage: MenuCardStage.LOADING,
            //             };
            //         default: return selectedStep;
            //     }
            // }
            //
            // const updatedStoryBeat: StoryBeat = newStoryBeat();
            // if (updatedStoryBeat) {
            //     setSteps((prevSteps = []) =>
            //         prevSteps.map((step, i) => (i === currentStepIndex ? updatedStoryBeat : step))
            //     );
            //
            //     if (project && project.id) {
            //         dispatch(updateStoryBeat({ projectId: project.id, storyBeat: updatedStoryBeat }));
            //     }
            // }

            try {
                setLoadingMenu(true);
                const response = await apiFunction(prompt, apiKey);

                if (typeof response === 'number') {
                    if (response === 401) dispatch(showDialogError(true));
                } else {
                    dispatch(showDialogError(false));
                    const updatedStoryBeat = successHandler(response);

                    // setSelectedStep(updatedStoryBeat);
                    setSteps((prevSteps = []) =>
                        prevSteps.map((step, i) => (i === currentStepIndex ? updatedStoryBeat : step))
                    );

                    if (project && project.id) {
                        dispatch(updateStoryBeat({projectId: project.id, storyBeat: updatedStoryBeat}));
                    }
                }
            } catch (error) {
                console.error(`Error handling ${menuItem}:`, error);
            } finally {
                setMenuSecondTitle('');
                setLoadingMenu(false);
                // setSelectedMenuItem(null);
                if (menuItem === MenuItem.REWRITE) setLoadingStep(false);
            }
        }
    };

    const rewrite = () => {
        if (!project || !selectedStep) return;
        setLoadingStep(true);

        const prompt = `
        "My story beats are:\\\\n ${project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n')}
        The story beat I want you to rewrite is ${currentStepText}
        `;

        handleMenuAction(
            MenuItem.REWRITE,
            'Rewriting story beat',
            prompt,
            rewriteStoryBeat,
            (response) => {
                const text = response?.choices[0]?.message?.content ?? "";
                return {
                    ...selectedStep,
                    text,
                    versions: [...(selectedStep.versions || []), { id: uuidv4(), text }],
                };
            },
            true //not needed for rewrite
        );
    };

    const handleEmotion = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        This are my story beats:
        ${project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n')}
        
        I am searching for the core emotion / creative impulses for the story beat: ${currentStepIndex + 1}: ${currentStepText}
        `;

        handleMenuAction(
            MenuItem.EMOTION,
            'Analysing emotion',
            prompt,
            getStoryBeatUniversalEmotion,
            (response) => {
                const emotionRes = response?.choices[0]?.message?.parsed ?? {
                    coreEmotion: '',
                    reason: '',
                    suggestions: []};
                return {
                    ...selectedStep,
                    emotion: {
                        coreEmotion: emotionRes.coreEmotion,
                        reason: emotionRes.reason,
                        suggestions: emotionRes.suggestions,
                    },
                    emotionStage: MenuCardStage.SHOWN,
                };
            },
            selectedStep.emotionStage === MenuCardStage.NEEDS_UPDATE || selectedStep.emotionStage === MenuCardStage.UNINITIALIZED
        );
    };

    const handleQuestion = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        I want to analyse the following story beat in terms of which questions it answers and which question it raises: ${currentStepIndex + 1}
        My story beats are:\n ${project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n')}
        `;

        handleMenuAction(
            MenuItem.QUESTION,
            'Finding questions',
            prompt,
            getStoryBeatUniversalQuestion,
            (response) => {
                const questions = response?.choices[0]?.message?.parsed ?? {
                    questions_raised: [] as Question[],
                    questions_answered: [] as Question[],
                    questions_unanswered: [] as Question[],
                };

                const filterQuestions = (questions: Question[]) => questions.filter(question =>
                        !!steps && question?.current_index !== undefined && question?.other_index !== undefined
                        && question.current_index >= 0 && question.current_index <= steps.length
                        && question.other_index >= 0 && question.other_index <= steps.length
                );

                const questionsRaised = filterQuestions(questions.questions_raised);
                const questionsAnswered = filterQuestions(questions.questions_answered);
                const questionsUnanswered = filterQuestions(questions.questions_unanswered);

                return {
                    ...selectedStep,
                    questions: {
                        id: uuidv4(),
                        questions_raised: questionsRaised,
                        questions_answered: questionsAnswered,
                        questions_unanswered: questionsUnanswered,
                    },
                    questionStage: MenuCardStage.SHOWN,
                };
            },
selectedStep.questionStage === MenuCardStage.NEEDS_UPDATE || selectedStep.questionStage === MenuCardStage.UNINITIALIZED
        );
    };

    const handleCritique = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        I am looking for a critique on the story beat: ${currentStepIndex}: ${currentStepText}
        My story beats are:\n ${project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n')}
        `;

        handleMenuAction(
            MenuItem.CRITIQUE,
            'Loading critique',
            prompt,
            runCritique,
            (response) => {
                const critiqueRes = response?.choices[0]?.message?.parsed ?? {
                    strength: '',
                    improvementArea: '',
                    improvementSummary: ''
                };
                return {
                    ...selectedStep,
                    critique: critiqueRes,
                    critiqueStage: MenuCardStage.SHOWN,
                };
            },
            selectedStep.critiqueStage === MenuCardStage.NEEDS_UPDATE || selectedStep.critiqueStage === MenuCardStage.UNINITIALIZED

    );
    };

    const handleAnalysis = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        I need an analysis for the story beat: ${currentStepIndex + 1}: ${currentStepText}
        My story beats are:\n ${project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n')}
        `;

        handleMenuAction(
            MenuItem.ANALYSE,
            'Loading analysis',
            prompt,
            runAnalysis,
            (response) => {
                const analysisRes = response?.choices[0]?.message?.parsed ?? {
                    incitingIncident: '',
                    characterDevelopment: '',
                    thematicImplications: '',
                    narrativeForeshadowing: ''
                };
                return {
                    ...selectedStep,
                    analysis: analysisRes,
                    analysisStage: MenuCardStage.SHOWN,
                };
            },
            selectedStep.analysisStage === MenuCardStage.NEEDS_UPDATE || selectedStep.analysisStage === MenuCardStage.UNINITIALIZED
        );
    };

    const handleSentenceRephrase = async (selectedText: string) => {
        if (!steps || !selectedStep) return;
        setSelectedMenuItem(MenuItem.REPHRASE);
        if (rephrasedSentence) setRephrasedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Rephrase this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${currentStepText}`

        try {
            const rephraseRes = await rephraseSentence(prompt + context, apiKey);

            if (typeof rephraseRes === 'number') {
                if (rephraseRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const rephrasedNew = rephraseRes?.choices[0].message.content ?? '';
                setRephrasedSentence(rephrasedNew);
            }
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

            if (typeof extendedRes === 'number') {
                if (extendedRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const extendedNew = extendedRes?.choices[0].message.content ?? '';
                setExtendedSentence(extendedNew);
            }
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

            if (typeof critiqueRes === 'number') {
                if (critiqueRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const critiqueNew = critiqueRes?.choices[0].message.content ?? '';
                setSentenceCritique(critiqueNew);
            }
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const addSentenceToStepText = (extend: boolean = false) => {
        if (!project || !steps || !selectedStep || !highlightedText) return;

        const newSentence = extend ? extendedSentence : rephrasedSentence;
        const newText = selectedStep.text.replace(highlightedText, newSentence);

        const updatedStep: StoryBeat = {
            ...selectedStep,
            text: newText,
            textUpdated: true,
            versions: selectedStep.versions.map((version) =>
                version.id === selectedStep.versions[currentVersionIndex].id
                    ? {...version, text: newText}
                    : version
            ),
        }

        const updatedSteps = steps.map((step, index) =>
            index === currentStepIndex ? updatedStep : step
        );

        setSteps(updatedSteps);
        setSelectedStep(updatedSteps[currentStepIndex])

        dispatch(updateStoryBeat({
            projectId: project.id,
            storyBeat: updatedStep
        }))
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'start',
            mt: 4,
            mb: 4,
            pr: 8,
            width: '90vw',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {(!!steps && steps.length > 0 && !!selectedStep)
                ? <>
                    {/* Left */}
                        <Box sx={{
                            flex: 1,
                            flexDirection: 'row',
                            display: 'flex',
                            mt: 5,
                            height: `554px`,
                        }}>
                            {currentStepIndex > 0 &&
                                <NavigateToStepCard onClick={handlePrev} position={'left'}/>
                            }
                        </Box>

                    {/* Middle */}
                    <Box style={{
                        display: 'flex',
                        flex: 10,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        padding: 0,
                        backgroundColor: '',
                        boxShadow: "none",
                        width: '100%',
                        height: '100%',
                    }}
                    >
                        <Box style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 6,
                        }}>
                            <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: "space-between",
                                }}>
                                <StepLabel icon={<SwaStepIcon index={currentStepIndex}/>}></StepLabel>

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

                        <Box style={{flex: 5, marginTop: 40,
                            // overflowY: 'auto',
                            height: '100%',
                        }}>
                            <RefinementMenu selectedStep={selectedStep}
                                            contextMenuRef={contextMenuRef}
                                            menuSecondTitle={menuSecondTitle}
                                            selectedMenuItem={selectedMenuItem}
                                            onRewrite={rewrite}
                                            onEmotion={handleEmotion}
                                            onQuestion={handleQuestion}
                                            onCritique={handleCritique}
                                            onAnalysis={handleAnalysis}
                            />
                            <Box style={{
                                // flex: 5,
                                marginTop: 10,
                                overflowY: 'auto', height: '100%'
                            }}>
                            <RefinementMenuCards selectedStep={selectedStep}
                                                 selectedMenuItem={selectedMenuItem}
                                                 menuWidth={menuWidth}
                                                 rephrasedSentence={rephrasedSentence}
                                                 extendedSentence={extendedSentence}
                                                 sentenceCritique={sentenceCritique}
                                                 onGoToStoryBeat={(stepIndex) => goToStoryBeat(stepIndex)}
                                                 onAddSentence={(extend) => addSentenceToStepText(extend)}
                            />
                            </Box>
                        </Box>
                    </Box>

                    <FloatingContextMenu textFieldRef={textFieldContainerRef}
                                         onRephrase={(text) => handleSentenceRephrase(text)}
                                         onExpand={(text) => handleSentenceExpand(text)}
                                         onCritique={(text) => handleSentenceCritique(text)}
                    />

                    {/* Right */}
                        <Box sx={{
                            flex: 1,
                            flexDirection: 'row',
                            display: 'flex',
                            mt: 5,
                            height: `554px`,
                            justifyContent: 'center'
                        }}>
                            {currentStepIndex < (steps.length - 1) &&
                                <NavigateToStepCard onClick={handleNext} position={'right'}/>
                            }
                        </Box>
                </>
                : <Skeleton/>
            }
        </Box>
    )
}

export default Refinement;