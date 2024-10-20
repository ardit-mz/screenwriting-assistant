import Box from "@mui/material/Box";
import {useEffect, useRef, useState} from "react";
import {Skeleton, StepLabel, TextField, Tooltip} from "@mui/material";
import SwaStepIcon from "../icons/SwaStepIcon.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentProject, updateProject, updateStoryBeat} from "../features/project/ProjectSlice.ts";
import {AppDispatch} from "../store.ts";
import FloatingContextMenu from "../components/menu/FloatingContextMenu.tsx";
import PaginationVersions from "../components/version/PaginationVersions.tsx";
import {
    critiqueSentence,
    extendSentence,
    rephraseSentence,
    rewriteStoryBeat,
    storyBeatAnalysis,
    storyBeatCritique,
    storyBeatEmotion,
    storyBeatQuestion
} from "../api/openaiAPI.ts";
import {StoryBeat} from "../types/StoryBeat";
import {selectApiKey, selectModel} from "../features/model/ModelSlice.ts";
import {MenuItem} from "../enum/MenuItem.ts";
import RefinementMenuCards from "../components/card/RefinementMenuCards.tsx";
import RefinementMenu from "../components/menu/RefinementMenu.tsx";
import NavigateToStepCard from "../components/card/NavigateToStepCard.tsx";
import {MenuCardStage} from "../enum/MenuCardStage.ts";
import {v4 as uuidv4} from "uuid";
import {ParsedChatCompletion} from "openai/resources/beta/chat/completions";
import {Question} from "../types/Question";
import {showDialogError} from "../features/drawer/DrawerSlice.ts";
import {storyBeatSToString} from "../helper/StringHelper.ts";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Refinement = () => {
    const project = useSelector(selectCurrentProject);
    const dispatch = useDispatch<AppDispatch>();
    const apiKey = useSelector(selectApiKey);
    const model = useSelector(selectModel);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const textFieldContainerRef = useRef<HTMLDivElement>(null);

    const [steps, setSteps] = useState(project?.storyBeats);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [selectedStep, setSelectedStep] = useState<StoryBeat>();
    const [currentStepText, setCurrentStepText] = useState<string>(steps ? steps[currentStepIndex].text : '');
    const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<boolean>(false);
    const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(project?.storyBeats ? project?.storyBeats[currentStepIndex].selectedVersionId : 0);
    const [menuSecondTitle, setMenuSecondTitle] = useState<string>('');
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);
    const [menuWidth, setMenuWidth] = useState<number | string>('auto');
    const [rephrasedSentence, setRephrasedSentence] = useState<string>("");
    const [extendedSentence, setExtendedSentence] = useState<string>("");
    const [sentenceCritique, setSentenceCritique] = useState<string>("");

    useEffect(() => {
        if (steps) {
            const step: StoryBeat = {...steps[currentStepIndex],
                selectedVersionId: currentVersionIndex,
                text: steps[currentStepIndex].versions[currentVersionIndex]?.text ?? '',
            };
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

        if (project && project.id && selectedStep) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: {...selectedStep, selectedVersionId: versionIndex}
            }));
        }
    }

    const handleStepTextChange = (newText: string) => {
        if (!steps || !selectedStep) return;

        const hasTextChanged = selectedStep.text.replace(/\s+/g, '') !== newText.replace(/\s+/g, '');

        const updatedStep: StoryBeat = {
            ...selectedStep,
            text: newText,
            textUpdated: hasTextChanged,
            versions: selectedStep.versions.map((version) => {
                const updateStage = (stage: MenuCardStage) => (hasTextChanged && stage != MenuCardStage.UNINITIALIZED) ? MenuCardStage.NEEDS_UPDATE : stage;
                return version.id === selectedStep.versions[currentVersionIndex].id
                        ? {
                            ...version,
                            text: newText,
                            emotionStage: updateStage(version.emotionStage),
                            questionStage: updateStage(version.questionStage),
                            critiqueStage: updateStage(version.critiqueStage),
                            analysisStage: updateStage(version.analysisStage),
                        }
                        : version
                }
            ),
        }
;
        setSteps((prevSteps = []) =>
            prevSteps.map((step, i) => (i === currentStepIndex ? updatedStep : step))
        );

        if (hasTextChanged) scriptNeedsUpdate();
    };

    const handleStepTextBlur = () => {
        if (!project || !selectedStep) return;

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: {...selectedStep, selectedVersionId: currentVersionIndex},
            }));
        }
    };

    const handlePrev = () => {
        if (project && steps && currentStepIndex > 0) {
            const prevIndex = currentStepIndex - 1;
            setCurrentStepIndex(prevIndex);
            setCurrentVersionIndex(project?.storyBeats[prevIndex].selectedVersionId);
            setSelectedMenuItem(null);
        }
    };

    const handleNext = () => {
        if (project && steps && currentStepIndex < steps?.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setCurrentVersionIndex(project?.storyBeats[nextIndex].selectedVersionId);
            setSelectedMenuItem(null);
        }
    };

    const goToStoryBeat = (index: number) => {
        if (!steps || index === currentStepIndex) return;
        setCurrentStepIndex(index);
    }

    const shouldUpdateStage = (stage: MenuCardStage) =>
        stage === MenuCardStage.NEEDS_UPDATE || stage === MenuCardStage.UNINITIALIZED;

    const handleMenuAction = async (
        menuItem: MenuItem,
        menuTitle: string,
        prompt: string,
        apiFunction: (prompt: string, apiKey: string, model: string) =>  Promise<number | ParsedChatCompletion<null> | undefined>,
        successHandler: (response: ParsedChatCompletion<null> | undefined) => StoryBeat,
        updateCondition: boolean,
    ) => {
        if (!project || !steps || !selectedStep) return;

        setSelectedMenuItem(menuItem);

        const createNewStoryBeat = (stage: MenuCardStage): StoryBeat => {
            let stageKey = '';
            switch(menuItem) {
                case MenuItem.EMOTION:
                    stageKey = 'emotionStage';
                    break;
                case MenuItem.QUESTION:
                    stageKey = 'questionStage';
                    break;
                case MenuItem.CRITIQUE:
                    stageKey = 'critiqueStage';
                    break;
                case MenuItem.ANALYSE:
                    stageKey ='analysisStage';
                    break;
                default:
                    return selectedStep;
            }

            return {
                ...selectedStep,
                versions: selectedStep.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            [stageKey]: stage
                        };
                    }
                    return version;
                }),
            };
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

        if (updateCondition) {
            setMenuSecondTitle(menuTitle);
            try {
                setLoadingMenu(true);
                const response = await apiFunction(prompt, apiKey, model);

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
        "My story beats are:\n ${storyBeatSToString(project.storyBeats)}
        The story beat you have to rewrite is ${currentStepText}
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
                    selectedVersionId: selectedStep.versions.length,
                    versions: [...(selectedStep.versions || []), {
                        id: uuidv4(),
                        text,
                        questions: undefined,
                        emotion: undefined,
                        analysis: undefined,
                        critique: undefined,
                        questionStage: MenuCardStage.UNINITIALIZED,
                        emotionStage: MenuCardStage.UNINITIALIZED,
                        analysisStage: MenuCardStage.UNINITIALIZED,
                        critiqueStage: MenuCardStage.UNINITIALIZED,
                    }],
                };
            },
            true // not needed for rewrite
        );

        setCurrentVersionIndex(selectedStep.versions.length);
        scriptNeedsUpdate();
    };

    const handleEmotion = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        This are my story beats:
        ${storyBeatSToString(project.storyBeats)}
        
        I am searching for the core emotion / creative impulses for the story beat: ${currentStepIndex + 1}: ${currentStepText}
        `;

        handleMenuAction(
            MenuItem.EMOTION,
            'Analysing emotion',
            prompt,
            storyBeatEmotion,
            (response) => {
                const emotionRes = response?.choices[0]?.message?.parsed ?? {
                    coreEmotion: '',
                    reason: '',
                    suggestions: []};

                const updatedVersions = selectedStep.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            emotion: {
                                coreEmotion: emotionRes.coreEmotion,
                                reason: emotionRes.reason,
                                suggestions: emotionRes.suggestions,
                            },
                            emotionStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });


                return {
                    ...selectedStep,
                    versions: updatedVersions,
                };
            },
            shouldUpdateStage(selectedStep.versions[currentVersionIndex].emotionStage)
        );
    };

    const handleQuestion = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        I want to analyse the following story beat in terms of which questions it answers and which question it raises: ${currentStepIndex + 1}
        My story beats are:\n ${storyBeatSToString(project.storyBeats)}
        `;

        handleMenuAction(
            MenuItem.QUESTION,
            'Finding questions',
            prompt,
            storyBeatQuestion,
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

                const updatedVersions = selectedStep.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            questions: {
                                id: uuidv4(),
                                questions_raised: questionsRaised,
                                questions_answered: questionsAnswered,
                                questions_unanswered: questionsUnanswered,
                            },
                            questionStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });

                return {
                    ...selectedStep,
                    versions: updatedVersions,
                };
            },
            shouldUpdateStage(selectedStep.versions[currentVersionIndex].questionStage)
        );
    };

    const handleCritique = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        I am looking for a critique on the story beat: ${currentStepIndex}: ${currentStepText}
        My story beats are:\n ${storyBeatSToString(project.storyBeats)}
        `;

        handleMenuAction(
            MenuItem.CRITIQUE,
            'Loading critique',
            prompt,
            storyBeatCritique,
            (response) => {
                const critiqueRes = response?.choices[0]?.message?.parsed ?? {
                    strength: '',
                    improvementArea: '',
                    improvementSummary: ''
                };

                const updatedVersions = selectedStep.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            critique: critiqueRes,
                            critiqueStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });

                return {
                    ...selectedStep,
                    versions: updatedVersions,
                    critique: critiqueRes,
                    critiqueStage: MenuCardStage.SHOWN,
                };
            },
            shouldUpdateStage(selectedStep.versions[currentVersionIndex].critiqueStage)
        );
    };

    const handleAnalysis = () => {
        if (!project || !selectedStep) return;

        const prompt = `
        I need an analysis for the story beat: ${currentStepIndex + 1}: ${currentStepText}
        My story beats are:\n ${storyBeatSToString(project.storyBeats)}
        `;

        handleMenuAction(
            MenuItem.ANALYSE,
            'Loading analysis',
            prompt,
            storyBeatAnalysis,
            (response) => {
                const analysisRes = response?.choices[0]?.message?.parsed ?? {
                    incitingIncident: '',
                    characterDevelopment: '',
                    thematicImplications: '',
                    narrativeForeshadowing: ''
                };

                const updatedVersions = selectedStep.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            analysis: analysisRes,
                            analysisStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });

                return {
                    ...selectedStep,
                    versions: updatedVersions,
                };
            },
            shouldUpdateStage(selectedStep.versions[currentVersionIndex].analysisStage)
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
            const rephraseRes = await rephraseSentence(prompt + context, apiKey, model);

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
            const extendedRes = await extendSentence(prompt + context, apiKey, model);

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
            const critiqueRes = await critiqueSentence(prompt + context, apiKey, model);

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
            versions: selectedStep.versions.map((version) => {
                    const updateStage = (stage: MenuCardStage) => stage != MenuCardStage.UNINITIALIZED ? MenuCardStage.NEEDS_UPDATE : stage;
                    return version.id === selectedStep.versions[currentVersionIndex].id
                        ? {
                            ...version,
                            text: newText,
                            emotionStage: updateStage(version.emotionStage),
                            questionStage: updateStage(version.questionStage),
                            critiqueStage: updateStage(version.critiqueStage),
                            analysisStage: updateStage(version.analysisStage),
                        }
                        : version
                }
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

        scriptNeedsUpdate();
    }

    return (
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'start',
            width: '100%',
            height: 'calc(100% -162px)',
        }}>
            {(!!steps && steps.length > 0 && !!selectedStep)
                ? <>
                    {/* Left */}
                    <Box sx={{
                        // flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        mt: 5,
                        height: '554px',
                    }}>
                        {currentStepIndex > 0 &&
                            <NavigateToStepCard onClick={handlePrev} position={'left'}/>
                        }
                    </Box>

                    {/* Middle */}
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        paddingLeft: 30,
                        paddingRight: 30,
                    }}
                    >
                        <Box style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        }}>
                            <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: "space-between",
                                }}>
                                <StepLabel icon={<SwaStepIcon index={currentStepIndex}/>}></StepLabel>

                                {steps[currentStepIndex].versions?.length > 1
                                    && <PaginationVersions totalPages={selectedStep.versions.length}
                                                           onChange={(newPageIndex) => handleVersionChange(newPageIndex - 1)}
                                                           currentVersion={currentVersionIndex + 1}
                                                           disabled={loadingMenu}/>}
                            </div>

                            {loadingStep ? <Skeleton variant="rectangular" height={554} width={600} sx={{mt: 2}}/>
                                : <Box ref={textFieldContainerRef} sx={{ height: '100%', position: 'relative', width: 600, }}>
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
                                               sx={{ height: '100%',
                                                   width: 600
                                               }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 25,
                                        right: 5,
                                    }}>
                                        <Tooltip title={"Highlight a sentence to see more options"}>
                                            <IconButton sx={{p:0}}><InfoOutlinedIcon sx={{height: 18}} /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            }
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: 5,
                        }}>
                            {/*<Button>Update assistant results</Button>*/}
                            <RefinementMenu selectedVersion={selectedStep.versions[currentVersionIndex]}
                                            contextMenuRef={contextMenuRef}
                                            menuSecondTitle={menuSecondTitle}
                                            selectedMenuItem={selectedMenuItem}
                                            onRewrite={rewrite}
                                            onEmotion={handleEmotion}
                                            onQuestion={handleQuestion}
                                            onCritique={handleCritique}
                                            onAnalysis={handleAnalysis}
                                            menuWidth={menuWidth}
                            />
                            <Box sx={{
                                mt: 2,
                                mb: 2,
                                width: 532,
                                // TODO only this part should be scrollable
                            }}>
                            <RefinementMenuCards selectedVersion={selectedStep.versions[currentVersionIndex]}
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
                            display: 'flex',
                            mt: 5,
                            height: `554px`,
                            justifyContent: 'center',
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