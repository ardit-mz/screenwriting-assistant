import {MenuItem} from "../../enum/MenuItem.ts";
import EmotionCard from "./EmotionCard.tsx";
import EmotionSkeleton from "../skeleton/EmotionSkeleton.tsx";
import QuestionCard from "./QuestionCard.tsx";
import QuestionSkeleton from "../skeleton/QuestionSkeleton.tsx";
import CritiqueCard from "./CritiqueCard.tsx";
import AnalysisCard from "./AnalysisCard.tsx";
import FloatingMenuAddCard from "./FloatingMenuAddCard.tsx";
import FloatingMenuCard from "./FloatingMenuCard.tsx";
import React from "react";
import {StoryBeat} from "../../types/StoryBeat";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";

interface RefinementMenuCardsProps {
    selectedStep: StoryBeat;
    selectedMenuItem: MenuItem | null,
    menuWidth: string | number,
    rephrasedSentence: string,
    extendedSentence: string,
    sentenceCritique: string,
    onGoToStoryBeat: (index: number) => void,
    onAddSentence: (extend: boolean) => void;
}

const RefinementMenuCards: React.FC<RefinementMenuCardsProps> = ({
                                                 selectedStep,
                                                 selectedMenuItem,
                                                 menuWidth,
                                                 rephrasedSentence,
                                                 extendedSentence,
                                                 sentenceCritique,
                                                 onGoToStoryBeat,
                                                 onAddSentence,
                                             }) => {
    const isLoading = (stage: MenuCardStage) => stage === MenuCardStage.LOADING;

    const isReadyToShow = (stage: MenuCardStage, data: boolean) =>
        (stage === MenuCardStage.SHOWN || stage === MenuCardStage.NEEDS_UPDATE) && data;

    const renderEmotionCard = () => {
        if (isLoading(selectedStep.emotionStage)) {
            return <EmotionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedStep.emotionStage, !!selectedStep.emotion) &&
            !!selectedStep.emotion?.coreEmotion && !!selectedStep.emotion?.reason && !!selectedStep.emotion?.suggestions) {
            return <EmotionCard coreEmotion={selectedStep.emotion.coreEmotion}
                                reason={selectedStep.emotion.reason}
                                suggestions={selectedStep.emotion.suggestions}/>;
        }
    };

    const renderQuestionCard = () => {
        if (isLoading(selectedStep.questionStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedStep.questionStage, !!selectedStep.questions) &&
            ((!!selectedStep?.questions?.questions_raised && selectedStep.questions.questions_raised?.length > 0) ||
                (!!selectedStep?.questions?.questions_answered && selectedStep.questions.questions_answered?.length > 0) ||
                (!!selectedStep?.questions?.questions_unanswered && selectedStep.questions.questions_unanswered?.length > 0))) {
            return <QuestionCard onClick={onGoToStoryBeat}
                                 questions={selectedStep.questions}/>;
        }
    };

    const renderCritiqueCard = () => {
        if (isLoading(selectedStep.critiqueStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedStep.critiqueStage, !!selectedStep.critique) && !!selectedStep?.critique) {
            return <CritiqueCard strengths={selectedStep.critique.strength}
                                 improvement={selectedStep.critique.improvementArea}
                                 summary={selectedStep.critique.improvementSummary}/>;
        }
    };

    const renderAnalysisCard = () => {
        if (isLoading(selectedStep.analysisStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedStep.analysisStage, !!selectedStep.analysis) && !!selectedStep.analysis) {
            return <AnalysisCard incident={selectedStep.analysis.incitingIncident}
                                 characters={selectedStep.analysis.characterDevelopment}
                                 themes={selectedStep.analysis.thematicImplications}
                                 foreshadowing={selectedStep.analysis.narrativeForeshadowing}/>;
        }
    };

    const renderCard = () => {
        switch (selectedMenuItem) {
            case MenuItem.EMOTION:
                return renderEmotionCard();
            case MenuItem.QUESTION:
                return renderQuestionCard();
            case MenuItem.CRITIQUE:
                return renderCritiqueCard();
            case MenuItem.ANALYSE:
                return renderAnalysisCard();
            case MenuItem.REPHRASE:
                return <FloatingMenuAddCard text={rephrasedSentence}
                                            onClick={() => onAddSentence(false)}
                                            loading={!rephrasedSentence}/>;
            case MenuItem.EXPAND:
                return <FloatingMenuAddCard text={extendedSentence}
                                            onClick={() => onAddSentence(true)}
                                            loading={!extendedSentence}/>;
            case MenuItem.CRITIQUE_SENTENCE:
                return <FloatingMenuCard text={sentenceCritique} loading={!sentenceCritique}/>;
            default:
                return <></>;
        }
    };

    return (<>{ renderCard() }</>);
}

export default RefinementMenuCards;