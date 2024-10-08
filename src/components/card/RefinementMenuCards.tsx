import {ImpulseStage} from "../../enum/ImpulseStage.ts";
import {MenuItem} from "../../enum/MenuItem.ts";
import EmotionCard from "./EmotionCard.tsx";
import EmotionSkeleton from "../skeleton/EmotionSkeleton.tsx";
import QuestionCard from "./QuestionCard.tsx";
import QuestionSkeleton from "../skeleton/QuestionSkeleton.tsx";
import CritiqueCard from "./CritiqueCard.tsx";
import AnalysisCard from "./AnalysisCard.tsx";
import FloatingMenuAddCard from "./FloatingMenuAddCard.tsx";
import FloatingMenuCard from "./FloatingMenuCard.tsx";
import React, {useState} from "react";
import {updateStoryBeat, updateStoryBeatImpulses} from "../../features/project/ProjectSlice.ts";
import {getStoryBeatImpulse, rewriteStoryBeatImpulse} from "../../api/openaiAPI.ts";
import {StoryBeat} from "../../types/StoryBeat";
import {Project} from "../../types/Project.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import ImpulseCards from "./ImpulseCards.tsx";
import {selectApiKey} from "../../features/model/ModelSlice.ts";

interface RefinementMenuCardsProps {
    project: Project | null;
    steps: StoryBeat[];
    setSteps: React.Dispatch<React.SetStateAction<StoryBeat[] | undefined>>;
    selectedStep: StoryBeat;
    setSelectedStep: React.Dispatch<React.SetStateAction<StoryBeat | undefined>>
    currentStepIndex: number;
    currentVersionIndex: number,
    impulseStage: ImpulseStage;
    impulses: string[];
    loadingMenu: boolean;
    selectedMenuItem: MenuItem | null,
    menuWidth: string | number,
    rephrasedSentence: string,
    extendedSentence: string,
    sentenceCritique: string,
    highlightedText: string | null,
    onGoToStoryBeat: (index: number) => void,
}

const RefinementMenuCards: React.FC<RefinementMenuCardsProps> = ({
                                                 project,
                                                 steps,
                                                 setSteps,
                                                 selectedStep,
                                                 setSelectedStep,
                                                 currentStepIndex,
                                                 currentVersionIndex,
                                                 impulseStage,
                                                 impulses,
                                                 loadingMenu,
                                                 selectedMenuItem,
                                                 menuWidth,
                                                 rephrasedSentence,
                                                 extendedSentence,
                                                 sentenceCritique,
                                                 highlightedText,
                                                 onGoToStoryBeat
                                             }) => {
    const dispatch = useDispatch<AppDispatch>();
    const apiKey = useSelector(selectApiKey);

    const [loadImpulse, setLoadImpulse] = useState<{ [k: number]: boolean }>({});

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

        // console.log("Steps", steps)
        setLoadImpulse(prevImpulses => ({
            ...prevImpulses,
            [impulseIndex]: true,
        }));

        // TODO improve rewriteStoryBeatImpulse prompt
        const response = await rewriteStoryBeatImpulse(impulse, apiKey);
        const newImpulse = response?.choices[0]?.message?.content ?? "";
        // console.log("newImpulse", newImpulse)

        const updatedImpulses = [...selectedStep.impulses];
        updatedImpulses[impulseIndex] = newImpulse;

        const updatedSteps = steps.map((step, i) =>
            i === currentStepIndex ? {...step, impulses: updatedImpulses} : step
        );

        // console.log("updatedSteps", updatedSteps)

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
        // console.log("steps 2", steps)

    };

    const handleDeleteImpulse = (impulseIndex: number) => {
        // console.log("impulseIndex", impulseIndex)
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

    const addSentenceToStepText = (extend: boolean = false) => {
        if (!project || !steps || !selectedStep || !highlightedText) return;

        // console.log("highlightedText", highlightedText)
        // console.log("rephrasedSentence", rephrasedSentence)
        // console.log("extendedSentence", extendedSentence)

        const newSentence = extend ? extendedSentence : rephrasedSentence;
        // const newText = currentStepText.replace(highlightedText, newSentence); TODO
        const newText = selectedStep.text.replace(highlightedText, newSentence);
        // console.log("newText", newText)

        const updatedStep: StoryBeat = {
            ...selectedStep,
            text: newText,
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

    // console.log("RefinementMenuCards selectedStep", selectedStep)
    const renderCard = () => {
        switch (selectedMenuItem) {
            case MenuItem.EMOTION:
                if (!!selectedStep.universalEmotion && !!selectedStep.universalEmotion?.coreEmotion && !!selectedStep.universalEmotion?.reason && !!selectedStep.universalEmotion?.suggestions) {
                    return <EmotionCard coreEmotion={selectedStep.universalEmotion.coreEmotion}
                                        reason={selectedStep.universalEmotion.reason}
                                        suggestions={selectedStep.universalEmotion.suggestions}/>;
                } else {
                    return <EmotionSkeleton width={menuWidth}/>;
                }
            case MenuItem.QUESTION:
                if (selectedStep.questions && (selectedStep.questions?.questions_raised?.length > 0 || selectedStep.questions?.questions_answered?.length > 0 || selectedStep.questions?.questions_unanswered?.length > 0)) {
                    return <QuestionCard onClick={(index) => onGoToStoryBeat(index)}
                                         questions={selectedStep.questions}/>;
                } else {
                    return <QuestionSkeleton width={menuWidth}/>;
                }
            case MenuItem.CRITIQUE:
                if (selectedStep.critique) {
                    return <CritiqueCard strengths={selectedStep.critique.strength}
                                         improvement={selectedStep.critique.improvementArea}
                                         summary={selectedStep.critique.improvementSummary}/>;
                } else {
                    return <QuestionSkeleton width={menuWidth}/>;
                }
            case MenuItem.ANALYSE:
                if (selectedStep.analysis) {
                    return <AnalysisCard incident={selectedStep.analysis.incitingIncident}
                                         characters={selectedStep.analysis.characterDevelopment}
                                         themes={selectedStep.analysis.thematicImplications}
                                         foreshadowing={selectedStep.analysis.narrativeForeshadowing}/>;
                } else {
                    return <QuestionSkeleton width={menuWidth}/>;
                }
            case MenuItem.REPHRASE:
                return <FloatingMenuAddCard text={rephrasedSentence}
                                            onClick={addSentenceToStepText}
                                            loading={!rephrasedSentence}/>;
            case MenuItem.EXPAND:
                return <FloatingMenuAddCard text={extendedSentence}
                                            onClick={() => addSentenceToStepText(true)}
                                            loading={!extendedSentence}/>;
            case MenuItem.CRITIQUE_SENTENCE:
                return <FloatingMenuCard text={sentenceCritique}
                                         loading={!sentenceCritique}/>;
            default:
                return <></>;
        }
    }

    // console.log("selectedMenuItem", selectedMenuItem)
    return (<>
        <ImpulseCards impulses={impulses}
                      impulseStage={impulseStage}
                      handleAdd={(impulse) => handleAddImpulse(impulse)}
                      handleRewrite={(index, impulse) => handleRewriteImpulse(index, impulse)}
                      handleDelete={(index) => handleDeleteImpulse(index)}
                      handleMore={moreImpulses}
                      loadImpulse={loadImpulse}
                      width={menuWidth}
                      loading={loadingMenu}
        />

        { renderCard() }
    </>)
}

export default RefinementMenuCards;