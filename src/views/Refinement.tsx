// views/Refinement.tsx

import Box from "@mui/material/Box";
import {useEffect, useRef, useState} from "react";
import {Button, Skeleton, StepLabel, TextField,} from "@mui/material";
import SwaStepIcon from "../icons/SwaStepIcon.tsx";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import AddStepConnector from "../components/stepper/SwaStepConnector.tsx";
import {useDispatch, useSelector} from "react-redux";
import {
    selectCurrentProject,
    updateStoryBeat,
    updateStoryBeatImpulses,
    updateStoryBeats
} from "../features/project/ProjectSlice.ts";
import {AppDispatch} from "../store.ts";
import FloatingContextMenu from "../components/menu/FloatingContextMenu.tsx";
import RefreshIcon from '@mui/icons-material/Refresh';
import ContextMenu from "../components/menu/ContextMenu.tsx";
import ContextMenuItem from "../components/menu/ContextMenuItem.tsx";
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import PaginationVersions from "../components/version/PaginationVersions.tsx";
import {SwaColor} from "../enum/SwaColor.ts";
import RefinementSideCard from "../components/card/RefinementSideCard.tsx";
import EmotionCard from "../components/card/EmotionCard.tsx";
import {
    critiqueSentence,
    extendSentence,
    getStoryBeatImpulse,
    getStoryBeatUniversalEmotion, getStoryBeatUniversalQuestion, rephraseSentence,
    rewriteStoryBeat,
    rewriteStoryBeatImpulse, runAnalysis, runCritique
} from "../api/openaiAPI.ts";
import {v4 as uuidv4} from "uuid";
import {StoryBeat} from "../types/StoryBeat";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import ImpulseCard from "../components/card/ImpulseCard.tsx";
import {ImpulseStage} from "../enum/ImpulseStage.ts";
import ImpulseSkeleton from "../components/skeleton/ImpulseSkeleton.tsx";
import {QuestionStage} from "../enum/QuestionStage.ts";
import {UniversalEmotionStage} from "../enum/UniversalEmotionStage.ts";
import {MenuItem} from "../enum/MenuItem.ts";
import EmotionSkeleton from "../components/skeleton/EmotionSkeleton.tsx";
import QuestionCard from "../components/card/QuestionCard.tsx";
import {Question, Questions} from "../types/Question";
import CritiqueCard from "../components/card/CritiqueCard.tsx";
import AnalysisCard from "../components/card/AnalysisCard.tsx";
import QuestionSkeleton from "../components/skeleton/QuestionSkeleton.tsx";
import FloatingMenuAddCard from "../components/card/FloatingMenuAddCard.tsx";
import FloatingMenuCard from "../components/card/FloatingMenuCard.tsx";

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
    const [loadImpulse, setLoadImpulse] = useState<{ [k: number]: boolean }>({});
    const [menuSecondTitle, setMenuSecondTitle] = useState<string>('');
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);
    const [menuWidth, setMenuWidth] = useState<number | string>('auto');
    const [rephrasedSentence, setRephrasedSentence] = useState<string>("");
    const [extendedSentence, setExtendedSentence] = useState<string>("");
    const [sentenceCritique, setSentenceCritique] = useState<string>("");


    useEffect(() => {
        if (steps) {
            setCurrentStepText(steps[currentStepIndex]?.text || '');
            setSelectedStep(steps[currentStepIndex]);
            setSelectedMenuItem(null);
        }
    }, [currentStepIndex, steps]);

    useEffect(() => {
        if (contextMenuRef.current) {
            setMenuWidth(contextMenuRef.current.offsetWidth);
        }
    }, [contextMenuRef.current]);

    const handleSelect = (item: MenuItem) => {
        setSelectedMenuItem(item);
        console.log(`${item} selected`);
    };

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

    const handleAddImpulse = (impulse: string) => {
        if (!steps || !selectedStep) return;

        const updatedSteps = steps.map((step, i) =>
            i === currentStepIndex ? {...step, text: impulse, impulses: [], impulseStage: ImpulseStage.HIDDEN} : step
        );
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: updatedSteps[currentStepIndex]
            }));
        }
    };

    const handleRewriteImpulse = async (impulseIndex: number, impulse: string) => {
        if (!steps || !selectedStep) return;

        console.log("Steps", steps)
        setLoadImpulse(prevImpulses => ({
            ...prevImpulses,
            [impulseIndex]: true,
        }));

        // TODO improve rewriteStoryBeatImpulse prompt
        const response = await rewriteStoryBeatImpulse(impulse, apiKey);
        const newImpulse = response?.choices[0]?.message?.content ?? "";
        console.log("newImpulse", newImpulse)

        const updatedImpulses = [...selectedStep.impulses];
        updatedImpulses[impulseIndex] = newImpulse;

        const updatedSteps = steps.map((step, i) =>
            i === currentStepIndex ? {...step, impulses: updatedImpulses} : step
        );

        console.log("updatedSteps", updatedSteps)

        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeatImpulses({
                projectId: project.id,
                storyBeatId: selectedStep.id,
                impulses: updatedImpulses
            }));
        }

        setLoadImpulse(prevImpulses => ({
            ...prevImpulses,
            [impulseIndex]: false,
        }));
        console.log("steps 2", steps)

    };

    const handleDeleteImpulse = (impulseIndex: number) => {
        console.log("impulseIndex", impulseIndex)
        if (!steps || !selectedStep) return;

        const updatedImpulses = selectedStep?.impulses?.filter((_, i) => i !== impulseIndex) || [];
        const updatedStep = {...selectedStep, impulses: updatedImpulses};
        const updatedSteps = [...steps.map((step, i) => i === currentStepIndex ? updatedStep : step)];
        setSteps(updatedSteps);

        if (project && project.id) {
            dispatch(updateStoryBeatImpulses({
                projectId: project.id,
                storyBeatId: selectedStep.id,
                impulses: updatedImpulses
            }));
        }
    };

    const moreImpulses = async () => {
        // TODO show loading on more impulses
        if (!steps || !project || !selectedStep) return;

        try {
            const previousStep = steps[currentStepIndex - 1];
            const nextStep = steps[currentStepIndex + 1];

            // TODO improve moreImpulses prompt
            // TODO add only one more impulse at a time
            const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
            const storyBeatPrompt = `I need more impulses for the current story beat between the story beats: ${previousStep?.index ?? ''} and ${nextStep?.index ?? ''}.\n`
            const storyBeatPrompt2 = `The impulses I have so far are ${selectedStep.impulses.map((s, i) => `${i + 1}: ${s}`).join('\n')}`;
            const response = await getStoryBeatImpulse(storyBeatsStr + storyBeatPrompt + storyBeatPrompt2, apiKey);

            // @ts-expect-error It has this format
            const newImpulses = response?.choices[0]?.message?.parsed?.impulses || [];

            const updatedStep = {
                ...selectedStep,
                impulses: [...selectedStep.impulses, ...newImpulses],
                impulseStage: ImpulseStage.SHOWN,
            };

            const finalUpdatedSteps = steps.map((step, i) =>
                i === currentStepIndex ? updatedStep : step
            );

            const finalSteps = finalUpdatedSteps.map((step, i) =>
                i === currentStepIndex ? {...step, impulseStage: ImpulseStage.SHOWN} : step
            );

            setSteps(finalSteps);

            if (project && project.id) {
                dispatch(updateStoryBeatImpulses({
                    projectId: project.id,
                    storyBeatId: updatedStep.id,
                    impulses: updatedStep.impulses
                }));
            }

            setSelectedStep(updatedStep)
        } catch (error) {
            console.error("Error fetching more impulses:", error);
        }
    }

    const rewrite = async () => {
        if (!project || !steps || !selectedStep) return;
        handleSelect(MenuItem.REWRITE)
        setMenuSecondTitle('Rewriting story beat');
        setLoadingStep(true);

        try {
            // TODO improve prompts
            const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
            const storyBeatPrompt = `The story beat I want you to rewrite is ${currentStepText}`;
            const response = await rewriteStoryBeat(storyBeatsStr + storyBeatPrompt, apiKey);
            const text = response?.choices[0]?.message?.content ?? "";
            console.log("res text:", text);

            const rewrittenStoryBeat = {
                ...selectedStep,
                text: text,
                versions: [
                    ...(selectedStep.versions || []),
                    {id: uuidv4(), text: text},
                ],
            };

            const finalUpdatedSteps = steps.map((step, i) =>
                i === currentStepIndex ? rewrittenStoryBeat : step
            );

            console.log("finalUpdatedSteps:", finalUpdatedSteps);

            setSteps(finalUpdatedSteps);
            setSelectedStep(finalUpdatedSteps[currentStepIndex])

            dispatch(updateStoryBeat({
                projectId: project.id,
                storyBeat: rewrittenStoryBeat
            }))

            setCurrentVersionIndex(selectedStep.versions.length)
        } catch (error) {
            console.error("Error fetching impulses for the new step:", error);
        }

        setLoadingStep(false);
        setSelectedMenuItem(null);
    }

    const handleEmotion = async () => {
        console.log("handleEmotion 0");
        if (!project || !steps || !selectedStep) return;

        handleSelect(MenuItem.EMOTION);
        setMenuSecondTitle('Analysing emotion');

        if (!!selectedStep.universalEmotion?.coreEmotion && !!selectedStep.universalEmotion?.reason && !!selectedStep.universalEmotion?.suggestions) return;
        console.log("handleEmotion 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I am searching for the core emotion / creative impulses for the story beat: ${currentStepIndex + 1}: ${currentStepText}`;

        try {
            const response = await getStoryBeatUniversalEmotion(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            console.log("Refinement handleUniversalEmotion response", response);

            const universalEmotionRes = response?.choices[0]?.message?.parsed ?? {
                core_emotion: '',
                core_emotion_reason: '',
                suggestions_for_enhanced_emotion: []
            };

            const updatedStoryBeat: StoryBeat = {
                ...selectedStep,
                universalEmotion: {
                    coreEmotion: universalEmotionRes.core_emotion,
                    reason: universalEmotionRes.core_emotion_reason,
                    suggestions: universalEmotionRes.suggestions_for_enhanced_emotion
                },
                universalEmotionStage: UniversalEmotionStage.SHOWN,
                impulseStage: (selectedStep.impulseStage === ImpulseStage.SHOWN || selectedStep.impulseStage === ImpulseStage.LOADING) ? ImpulseStage.HIDDEN : selectedStep.impulseStage,
                questionStage: (selectedStep.questionStage === QuestionStage.SHOWN || selectedStep.questionStage === QuestionStage.LOADING) ? QuestionStage.HIDDEN : selectedStep.questionStage,
            };

            const updatedSteps = steps.map((step, i) =>
                i === currentStepIndex ? updatedStoryBeat : step
            );
            setSteps(updatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }
        } catch (error) {
            console.error("Error fetching universal emotion for the story beat:", error);
        }
    };


    const handleQuestion = async () => {
        console.log("handleQuestion")
        if (!project || !steps || !selectedStep) return;

        handleSelect(MenuItem.QUESTION);
        setMenuSecondTitle('Finding questions');

        if (!!selectedStep && !!selectedStep?.questions
            && (selectedStep?.questions?.questions_raised?.length > 0
                || selectedStep?.questions?.questions_answered?.length > 0
                || selectedStep?.questions?.questions_unanswered?.length > 0)) {
            return;
        }

        const storyBeatPrompt = `I want to analyse the following story beat in terms of which questions it answers and which question it raises: ${currentStepIndex + 1}`;
        const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');

        try {
            const response = await getStoryBeatUniversalQuestion(storyBeatPrompt + storyBeatsStr, apiKey);
            console.log("Refinement handleUniversalQuestion response", response);

            // @ts-expect-error that's the format
            const questionsRaised = response?.choices[0]?.message?.parsed?.questions_raised ?? [];
            // @ts-expect-error that's the format
            const questionsAnswered = response?.choices[0]?.message?.parsed?.questions_answered ?? [];
            // @ts-expect-error that's the format
            const questionsUnanswered = response?.choices[0]?.message?.parsed?.questions_unanswered ?? [];

            const formattedQuestions: Questions = {
                id: uuidv4(),
                story_beat_id: selectedStep?.id,
                questions_raised: [...questionsRaised.map((q: Question) => ({
                    id: uuidv4(),
                    question: q.question,
                    current_index: q.current_index,
                    answer: q.answer,
                    other_index: q.other_index,
                    story_beat_id: selectedStep?.id,
                }))],
                questions_answered: [...questionsAnswered.map((q: Question) => ({
                    id: uuidv4(),
                    question: q.question,
                    other_index: q.other_index,
                    answer: q.answer,
                    current_index: q.current_index,
                    story_beat_id: selectedStep?.id,
                }))],
                questions_unanswered: [...questionsUnanswered.map((q: Question) => ({
                    id: uuidv4(),
                    question: q.question,
                    current_index: q.current_index,
                    story_beat_id: selectedStep?.id,
                }))],
            };

            console.log("formattedQuestions", formattedQuestions)

            const updatedStoryBeats = steps.map((step) => {
                if (step.index === currentStepIndex + 1) {
                    return {
                        ...step,
                        questions: formattedQuestions,
                        questionStage: !!formattedQuestions && (formattedQuestions.questions_raised.length > 0 || formattedQuestions.questions_answered.length > 0 || formattedQuestions.questions_unanswered.length > 0) ? QuestionStage.SHOWN : QuestionStage.UNINITIALIZED,
                    };
                }
                //
                // const relevantQuestions = formattedQuestions.filter(q => q.answer_storybeat === step.index + 1);
                // if (relevantQuestions.length > 0) {
                //     return {
                //         ...step,
                //         questions: [...(step.questions || []), ...relevantQuestions],
                //         questionStage: formattedQuestions.length > 0 ? QuestionStage.SHOWN : QuestionStage.UNINITIALIZED,
                //         impulseStage: (step.impulseStage === ImpulseStage.SHOWN || step.impulseStage === ImpulseStage.LOADING) ? ImpulseStage.HIDDEN : step.impulseStage,
                //         universalEmotionStage: (step.universalEmotionStage === UniversalEmotionStage.SHOWN || step.universalEmotionStage === UniversalEmotionStage.LOADING) ? UniversalEmotionStage.HIDDEN : step.universalEmotionStage
                //     };
                // }

                return step;
            });
            console.log("Refinement updatedStoryBeats", updatedStoryBeats)
            setSteps(updatedStoryBeats);

            if (project && project.id) {
                dispatch(updateStoryBeats({
                    projectId: project.id,
                    storyBeats: updatedStoryBeats
                }));
            }
        } catch (error) {
            console.error("Error fetching universal question for the story beat:", error);
        }
    };

    const goToStoryBeat = (index: number) => {
        if (!steps || index === currentStepIndex) return;

        setCurrentStepIndex(index);
        setSelectedStep(steps[index]);
        setCurrentStepText(steps[index].text);
    }

    const handleCritique = async () => {
        console.log("handleCritique 0");
        if (!project || !steps || !selectedStep) return;

        handleSelect(MenuItem.CRITIQUE);
        setMenuSecondTitle('Loading critique');

        if (selectedStep.critique && selectedStep.critique?.strength && selectedStep.critique?.improvementArea && selectedStep.critique?.improvementSummary) {
            return;
        }

        console.log("handleCritique 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I am looking for a critique on the story beat: ${currentStepIndex}: ${currentStepText}`;

        try {
            const response = await runCritique(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            console.log("Refinement handleCritique response", response);

            const critiqueRes = response?.choices[0]?.message?.parsed ?? {
                strength: '',
                improvementArea: '',
                improvementSummary: ''
            };

            const updatedStoryBeat: StoryBeat = {
                ...selectedStep,
                critique: {
                    strength: critiqueRes.strength,
                    // @ts-expect-error has this format
                    improvementArea: critiqueRes.areas_for_improvement,
                    // @ts-expect-error has this format
                    improvementSummary: critiqueRes.summary_for_improvement
                }
            };

            const updatedSteps = steps.map((step, i) =>
                i === currentStepIndex ? updatedStoryBeat : step
            );
            setSteps(updatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }
        } catch (error) {
            console.error("Error fetching critique for the story beat:", error);
        }

    }

    const handleAnalysis = async () => {
        if (!project || !steps || !selectedStep) return;

        handleSelect(MenuItem.ANALYSE);
        setMenuSecondTitle('Loading analysis');

        if (selectedStep.analysis && selectedStep.analysis?.incitingIncident && selectedStep.analysis?.characterDevelopment &&
            selectedStep.analysis?.thematicImplications && selectedStep.analysis?.narrativeForeshadowing) {
            return;
        }

        console.log("handleAnalysis 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I need an analysis for the story beat: ${currentStepIndex + 1}: ${currentStepText}`;

        try {
            const response = await runAnalysis(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            console.log("Refinement handleAnalysis response", response);

            const analysisRes = response?.choices[0]?.message?.parsed ?? {
                incitingIncident: '',
                characterDevelopment: '',
                thematicImplications: '',
                narrativeForeshadowing: ''
            };

            const updatedStoryBeat: StoryBeat = {
                ...selectedStep,
                analysis: {
                    // @ts-expect-error has this format
                    incitingIncident: analysisRes.inciting_incident,
                    // @ts-expect-error has this format
                    characterDevelopment: analysisRes.character_development,
                    // @ts-expect-error has this format
                    thematicImplications: analysisRes.thematic_implications,
                    // @ts-expect-error has this format
                    narrativeForeshadowing: analysisRes.narrative_foreshadowing
                },
            };

            const updatedSteps = steps.map((step, i) =>
                i === currentStepIndex ? updatedStoryBeat : step
            );
            setSteps(updatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }
        } catch (error) {
            console.error("Error fetching analysis for the story beat:", error);
        }
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

    const addSentenceToStepText = (extend: boolean = false) => {
        if (!project || !steps || !selectedStep || !highlightedText) return;

        console.log("highlightedText", highlightedText)
        console.log("rephrasedSentence", rephrasedSentence)
        console.log("extendedSentence", extendedSentence)

        const newSentence = extend ? extendedSentence : rephrasedSentence;
        const newText = currentStepText.replace(highlightedText, newSentence);
        console.log("newText", newText)

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
        setSelectedStep(updatedSteps[currentStepIndex])

        dispatch(updateStoryBeat({
            projectId: project.id,
            storyBeat: updatedStep
        }))
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
                    {currentStepIndex > 0 &&
                        <RefinementSideCard onClick={handlePrev}
                                            index={currentStepIndex - 1}
                                            text={steps[currentStepIndex - 1]?.text}
                                            tooltip="Select previous story beat"/>
                    }

                    <AddStepConnector onClick={() => addStep(currentStepIndex)}/>

                    <Box style={{
                        display: 'flex',
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
                            <ContextMenu secondTitle={menuSecondTitle ? menuSecondTitle : ''} ref={contextMenuRef}>
                                <ContextMenuItem icon={<RefreshIcon/>}
                                                 name="Rewrite Story Beat"
                                                 onClick={rewrite}/>
                                <ContextMenuItem icon={<MoodOutlinedIcon/>}
                                                 name="Emotion"
                                                 onClick={handleEmotion}
                                                 showDescription={true}
                                                 description="Analysis and enhancement suggestions"
                                                 backgroundColor={SwaColor.greenLight}/>
                                <ContextMenuItem icon={<QuestionMarkOutlinedIcon/>}
                                                 name="Question"
                                                 onClick={handleQuestion}
                                                 showDescription={true}
                                                 description="Analyse raised questions and answers"
                                                 backgroundColor={SwaColor.orangeLight}/>
                                <ContextMenuItem icon={<PriorityHighOutlinedIcon/>}
                                                 name="Critique"
                                                 onClick={handleCritique}
                                                 showDescription={true}
                                                 description="Critique the whole story beat"
                                                 backgroundColor={SwaColor.redLight}/>
                                <ContextMenuItem icon={<AutoGraphOutlinedIcon/>}
                                                 name="Analyse"
                                                 onClick={handleAnalysis}
                                                 showDescription={true}
                                                 description="Analyse this story beat"
                                                 backgroundColor={SwaColor.violetLight}/>
                                <ContextMenuItem icon={<DeleteForeverOutlinedIcon/>}
                                                 name="Delete Story Beat"
                                                 onClick={removeStep}
                                                 onSelect={() => handleSelect(MenuItem.DELETE)}/>
                            </ContextMenu>

                            {
                                (loadingMenu || selectedStep?.impulseStage === ImpulseStage.LOADING)
                                    ? <> {Array(3).fill(null).map(() => (
                                        <ImpulseSkeleton key={uuidv4()} style={{marginLeft: 32}} width={"100%"}/>))}
                                        <Skeleton variant="rounded" width={"100%"} height={36}
                                                  style={{marginTop: 16, marginLeft: 32,}}
                                        />

                                    </>
                                    : (selectedStep?.impulseStage === ImpulseStage.SHOWN)
                                    && <>{selectedStep?.impulses.map((impulse, indexImpulseCard) =>
                                        <ImpulseCard key={`${impulse}-${indexImpulseCard}`}
                                                     impulse={impulse}
                                                     index={indexImpulseCard}
                                                     handleAdd={() => handleAddImpulse(impulse)}
                                                     handleRewrite={() => handleRewriteImpulse(indexImpulseCard, impulse)}
                                                     handleDelete={() => handleDeleteImpulse(indexImpulseCard)}
                                                     loading={loadImpulse[indexImpulseCard] ?? false}
                                                     style={{marginLeft: 32}}
                                        />
                                    )}
                                        <Box sx={{width: '100%', mt: 2, ml: 4, pr: 8}}>
                                            <Button onClick={moreImpulses} sx={{width: '100%'}}
                                                    variant="outlined">More</Button>
                                        </Box>
                                    </>
                            }

                            {selectedMenuItem === MenuItem.EMOTION && (
                                (!!selectedStep.universalEmotion
                                    && !!selectedStep.universalEmotion?.coreEmotion
                                    && !!selectedStep.universalEmotion?.reason
                                    && !!selectedStep.universalEmotion?.suggestions)
                                    ? <EmotionCard coreEmotion={selectedStep.universalEmotion.coreEmotion}
                                                   reason={selectedStep.universalEmotion.reason}
                                                   suggestions={selectedStep.universalEmotion.suggestions}/>
                                    : <EmotionSkeleton width={menuWidth}/>
                            )}

                            {selectedMenuItem === MenuItem.QUESTION && (
                                selectedStep.questions && (selectedStep.questions?.questions_raised?.length > 0
                                    || selectedStep.questions?.questions_answered?.length > 0
                                    || selectedStep.questions?.questions_unanswered?.length > 0)
                                    ? <QuestionCard onClick={(index) => goToStoryBeat(index)}
                                                    questions={selectedStep.questions}/>
                                    : <QuestionSkeleton width={menuWidth}/>
                            )}

                            {selectedMenuItem === MenuItem.CRITIQUE && (selectedStep.critique
                                ? <CritiqueCard strengths={selectedStep.critique.strength}
                                                improvement={selectedStep.critique.improvementArea}
                                                summary={selectedStep.critique.improvementSummary}/>
                                : <QuestionSkeleton width={menuWidth}/>)
                            }

                            {selectedMenuItem === MenuItem.ANALYSE && (selectedStep.analysis
                                ? <AnalysisCard incident={selectedStep.analysis.incitingIncident}
                                                characters={selectedStep.analysis.characterDevelopment}
                                                themes={selectedStep.analysis.thematicImplications}
                                                foreshadowing={selectedStep.analysis.narrativeForeshadowing}/>
                                : <QuestionSkeleton width={menuWidth}/>)
                            }

                            {/* Floating Menu Cards */}
                            {selectedMenuItem === MenuItem.REPHRASE &&
                                <FloatingMenuAddCard text={rephrasedSentence}
                                                     onClick={addSentenceToStepText}
                                                     loading={!rephrasedSentence}
                                />}

                            {selectedMenuItem === MenuItem.EXPAND &&
                                <FloatingMenuAddCard text={extendedSentence}
                                                     onClick={() => addSentenceToStepText(true)}
                                                     loading={!extendedSentence}
                                />}

                            {selectedMenuItem === MenuItem.CRITIQUE_SENTENCE &&
                                <FloatingMenuCard text={sentenceCritique}
                                                  loading={!sentenceCritique}
                                />}

                        </Box>
                    </Box>

                    <FloatingContextMenu textFieldRef={textFieldContainerRef}
                                         onRephrase={(text) => handleSentenceRephrase(text)}
                                         onExpand={(text) => handleSentenceExpand(text)}
                                         onCritique={(text) => handleSentenceCritique(text)}
                    />

                    <AddStepConnector onClick={() => addStep(currentStepIndex + 1)}/>

                    {currentStepIndex < steps.length &&
                        <RefinementSideCard onClick={handleNext}
                                            index={currentStepIndex + 1}
                                            text={steps[currentStepIndex + 1]?.text}
                                            tooltip="Select next story beat"/>
                    }
                </>
                : <Skeleton/>
            }
        </Box>
    )
}

export default Refinement;