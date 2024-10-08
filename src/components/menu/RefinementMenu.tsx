import React from "react";
import ContextMenu from "./ContextMenu.tsx";
import ContextMenuItem from "./ContextMenuItem.tsx";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import {SwaColor} from "../../enum/SwaColor.ts";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import {MenuItem} from "../../enum/MenuItem.ts";
import {
    getStoryBeatUniversalEmotion,
    getStoryBeatUniversalQuestion,
    rewriteStoryBeat, runAnalysis,
    runCritique
} from "../../api/openaiAPI.ts";
import {v4 as uuidv4} from "uuid";
import {updateStoryBeat, updateStoryBeats} from "../../features/project/ProjectSlice.ts";
import {StoryBeat} from "../../types/StoryBeat";
import {UniversalEmotionStage} from "../../enum/UniversalEmotionStage.ts";
import {QuestionStage} from "../../enum/QuestionStage.ts";
import {Question, Questions} from "../../types/Question";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {selectApiKey} from "../../features/model/ModelSlice.ts";
import {Project} from "../../types/Project";

interface RefinementMenuProps {
    project: Project | null;
    steps: StoryBeat[];
    setSteps: React.Dispatch<React.SetStateAction<StoryBeat[] | undefined>>;
    selectedStep: StoryBeat;
    setSelectedStep: React.Dispatch<React.SetStateAction<StoryBeat | undefined>>
    currentStepText: string;
    currentStepIndex: number;
    setCurrentVersionIndex: React.Dispatch<React.SetStateAction<number>>;
    setLoadingStep: React.Dispatch<React.SetStateAction<boolean>>;
    contextMenuRef: React.RefObject<HTMLDivElement>
    menuSecondTitle: string;
    setMenuSecondTitle: React.Dispatch<React.SetStateAction<string>>;
    onRemoveStep: () => void;
    selectedMenuItem: string | null;
    setSelectedMenuItem: React.Dispatch<React.SetStateAction<MenuItem | null>>;
}

const RefinementMenu: React.FC<RefinementMenuProps> = ({
                                                           project,
                                                           steps,
                                                           setSteps,
                                                           selectedStep,
                                                           setSelectedStep,
                                                           currentStepText,
                                                           currentStepIndex,
                                                           setCurrentVersionIndex,
                                                           setLoadingStep,
                                                           contextMenuRef,
                                                           menuSecondTitle,
                                                           setMenuSecondTitle,
                                                           onRemoveStep,
                                                           selectedMenuItem,
                                                           setSelectedMenuItem,
                                                       }) => {
    const dispatch = useDispatch<AppDispatch>();
    const apiKey = useSelector(selectApiKey);

    const rewrite = async () => {
        if (!project || !steps || !selectedStep) return;
        setSelectedMenuItem(MenuItem.REWRITE)
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

            // console.log("finalUpdatedSteps:", finalUpdatedSteps);

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
        setMenuSecondTitle('');
    }

    const handleEmotion = async () => {
        // console.log("handleEmotion 0");
        if (!project || !steps || !selectedStep) return;

        setSelectedMenuItem(MenuItem.EMOTION);
        setMenuSecondTitle('Analysing emotion');

        if (!!selectedStep.universalEmotion?.coreEmotion && !!selectedStep.universalEmotion?.reason && !!selectedStep.universalEmotion?.suggestions) {
            setMenuSecondTitle('');
            return;
        }

        console.log("handleEmotion 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I am searching for the core emotion / creative impulses for the story beat: ${currentStepIndex + 1}: ${currentStepText}`;

        try {
            const response = await getStoryBeatUniversalEmotion(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            // console.log("Refinement handleUniversalEmotion response", response);

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
           };

            const updatedSteps = steps.map((step, i) =>
                i === currentStepIndex ? updatedStoryBeat : step
            );
            setSelectedStep(updatedStoryBeat);
            setSteps(updatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }

            setMenuSecondTitle('');
            // console.log("EMOTION UPDATED")
        } catch (error) {
            console.error("Error fetching universal emotion for the story beat:", error);
        }
    };

    const handleQuestion = async () => {
        // console.log("handleQuestion")
        if (!project || !steps || !selectedStep) return;

        setSelectedMenuItem(MenuItem.QUESTION);
        setMenuSecondTitle('Finding questions');

        if (!!selectedStep && !!selectedStep?.questions
            && (selectedStep?.questions?.questions_raised?.length > 0
                || selectedStep?.questions?.questions_answered?.length > 0
                || selectedStep?.questions?.questions_unanswered?.length > 0)) {
            setMenuSecondTitle('');
            return;
        }

        const storyBeatPrompt = `I want to analyse the following story beat in terms of which questions it answers and which question it raises: ${currentStepIndex + 1}`;
        const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');

        try {
            const response = await getStoryBeatUniversalQuestion(storyBeatPrompt + storyBeatsStr, apiKey);
            // console.log("Refinement handleUniversalQuestion response", response);

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

            // console.log("formattedQuestions", formattedQuestions)

            const updatedStoryBeat = {
                ...selectedStep,
                questions: formattedQuestions,
                questionStage: !!formattedQuestions && (formattedQuestions.questions_raised.length > 0 || formattedQuestions.questions_answered.length > 0 || formattedQuestions.questions_unanswered.length > 0) ? QuestionStage.SHOWN : QuestionStage.UNINITIALIZED,
            }

            const updatedStoryBeats = steps.map((step) => {
                if (step.index === currentStepIndex + 1) {
                    return updatedStoryBeat;
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
            // console.log("Refinement updatedStoryBeats", updatedStoryBeats)
            setSelectedStep(updatedStoryBeat);
            setSteps(updatedStoryBeats);

            if (project && project.id) {
                dispatch(updateStoryBeats({
                    projectId: project.id,
                    storyBeats: updatedStoryBeats
                }));
            }
            setMenuSecondTitle('');
        } catch (error) {
            console.error("Error fetching universal question for the story beat:", error);
        }
    };

    const handleCritique = async () => {
        // console.log("handleCritique 0");
        if (!project || !steps || !selectedStep) return;

        setSelectedMenuItem(MenuItem.CRITIQUE);
        setMenuSecondTitle('Loading critique');

        if (selectedStep.critique && selectedStep.critique?.strength && selectedStep.critique?.improvementArea && selectedStep.critique?.improvementSummary) {
            setMenuSecondTitle('');
            return;
        }

        // console.log("handleCritique 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I am looking for a critique on the story beat: ${currentStepIndex}: ${currentStepText}`;

        try {
            const response = await runCritique(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            // console.log("Refinement handleCritique response", response);

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
            setSelectedStep(updatedStoryBeat);
            setSteps(updatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }
            setMenuSecondTitle('');
        } catch (error) {
            console.error("Error fetching critique for the story beat:", error);
        }

    }

    const handleAnalysis = async () => {
        if (!project || !steps || !selectedStep) return;

        setSelectedMenuItem(MenuItem.ANALYSE);
        setMenuSecondTitle('Loading analysis');

        if (selectedStep.analysis && selectedStep.analysis?.incitingIncident && selectedStep.analysis?.characterDevelopment &&
            selectedStep.analysis?.thematicImplications && selectedStep.analysis?.narrativeForeshadowing) {
            setMenuSecondTitle('');
            return;
        }

        // console.log("handleAnalysis 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I need an analysis for the story beat: ${currentStepIndex + 1}: ${currentStepText}`;

        try {
            const response = await runAnalysis(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            // console.log("Refinement handleAnalysis response", response);

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
            setSelectedStep(updatedStoryBeat);
            setSteps(updatedSteps);

            if (project && project.id) {
                dispatch(updateStoryBeat({
                    projectId: project.id,
                    storyBeat: updatedStoryBeat
                }));
            }
            setMenuSecondTitle('');
        } catch (error) {
            console.error("Error fetching analysis for the story beat:", error);
        }
    }

    return (
        <ContextMenu secondTitle={menuSecondTitle ? menuSecondTitle : ''} ref={contextMenuRef}>
            <ContextMenuItem icon={<RefreshIcon/>}
                             name={"Rewrite Story Beat"}
                             onClick={rewrite}/>
            <ContextMenuItem icon={<MoodOutlinedIcon/>}
                             name="Emotion"
                             onClick={handleEmotion}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem === MenuItem.EMOTION ? "Analysis and enhancement suggestions" : ''}
                             backgroundColor={SwaColor.greenLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.EMOTION}/>
            <ContextMenuItem icon={<QuestionMarkOutlinedIcon/>}
                             name="Question"
                             onClick={handleQuestion}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem === MenuItem.QUESTION ? 'Analyse raised questions and answers' : ''}
                             backgroundColor={SwaColor.orangeLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.QUESTION}/>
            <ContextMenuItem icon={<PriorityHighOutlinedIcon/>}
                             name="Critique"
                             onClick={handleCritique}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem === MenuItem.CRITIQUE ? 'Critique the whole story beat' : ''}
                             backgroundColor={SwaColor.redLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.CRITIQUE}/>
            <ContextMenuItem icon={<AutoGraphOutlinedIcon/>}
                             name="Analyse"
                             onClick={handleAnalysis}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem === MenuItem.ANALYSE ? 'Analyse this story beat' : ''}
                             backgroundColor={SwaColor.violetLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.ANALYSE}/>
            <ContextMenuItem icon={<DeleteForeverOutlinedIcon/>}
                             name="Delete Story Beat"
                             onClick={onRemoveStep}
                             onSelect={() => setSelectedMenuItem(MenuItem.DELETE)}/>
        </ContextMenu>
    )
}

export default RefinementMenu;