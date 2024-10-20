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
import {StoryBeatVersion} from "../../types/StoryBeat";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";
import Box from "@mui/material/Box";

interface RefinementMenuCardsProps {
    selectedVersion: StoryBeatVersion;
    selectedMenuItem: MenuItem | null,
    menuWidth: string | number,
    rephrasedSentence: string,
    extendedSentence: string,
    sentenceCritique: string,
    onGoToStoryBeat: (index: number) => void,
    onAddSentence: (extend: boolean) => void;
}

const RefinementMenuCards: React.FC<RefinementMenuCardsProps> = ({
                                                 selectedVersion,
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
        if (isLoading(selectedVersion.emotionStage)) {
            return <EmotionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion.emotionStage, !!selectedVersion.emotion) &&
            !!selectedVersion.emotion?.coreEmotion && !!selectedVersion.emotion?.reason && !!selectedVersion.emotion?.suggestions) {
            return <EmotionCard coreEmotion={selectedVersion.emotion.coreEmotion}
                                reason={selectedVersion.emotion.reason}
                                suggestions={selectedVersion.emotion.suggestions}/>;
        }
    };

    const renderQuestionCard = () => {
        if (isLoading(selectedVersion.questionStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion.questionStage, !!selectedVersion.questions) &&
            ((!!selectedVersion?.questions?.questions_raised && selectedVersion.questions.questions_raised?.length > 0) ||
                (!!selectedVersion?.questions?.questions_answered && selectedVersion.questions.questions_answered?.length > 0) ||
                (!!selectedVersion?.questions?.questions_unanswered && selectedVersion.questions.questions_unanswered?.length > 0))) {
            return <QuestionCard onClick={onGoToStoryBeat}
                                 questions={selectedVersion.questions}/>;
        }
    };

    const renderCritiqueCard = () => {
        if (isLoading(selectedVersion.critiqueStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion.critiqueStage, !!selectedVersion.critique) && !!selectedVersion?.critique) {
            return <CritiqueCard strengths={selectedVersion.critique.strength}
                                 improvement={selectedVersion.critique.improvementArea}
                                 summary={selectedVersion.critique.improvementSummary}/>;
        }
    };

    const renderAnalysisCard = () => {
        if (isLoading(selectedVersion.analysisStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion.analysisStage, !!selectedVersion.analysis) && !!selectedVersion.analysis) {
            return <AnalysisCard incident={selectedVersion.analysis.incitingIncident}
                                 characters={selectedVersion.analysis.characterDevelopment}
                                 themes={selectedVersion.analysis.thematicImplications}
                                 foreshadowing={selectedVersion.analysis.narrativeForeshadowing}/>;
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

    return (<Box sx={{overflow: 'hidden'}}>{ renderCard() }</Box>);
}

export default RefinementMenuCards;