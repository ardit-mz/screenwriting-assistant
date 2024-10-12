import {MenuItem} from "../../enum/MenuItem.ts";
import QuestionSkeleton from "../skeleton/QuestionSkeleton.tsx";
import CritiqueCard from "./CritiqueCard.tsx";
import AnalysisCard from "./AnalysisCard.tsx";
import FloatingMenuAddCard from "./FloatingMenuAddCard.tsx";
import FloatingMenuCard from "./FloatingMenuCard.tsx";
import React from "react";
import {Project} from "../../types/Project.ts";
// import WhoWroteWhatCard from "./WhoWroteWhatCard.tsx";
import {Script} from "../../types/Script";
import ConsistencyAccordion from "../accordion/ConsistencyAccordion.tsx";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";

interface CompletionMenuCardsProps {
    project: Project | null;
    script: Script;
    selectedMenuItem: MenuItem | null,
    menuWidth: string | number,
    rephrasedSentence: string,
    extendedSentence: string,
    sentenceCritique: string,
    onAddSentence: (extend: boolean) => void;
    // onClickConsistencyCheck: (index: number) => void;
}

const CompletionMenuCards: React.FC<CompletionMenuCardsProps> = ({
                                                                     project,
                                                                     script,
                                                                     selectedMenuItem,
                                                                     menuWidth,
                                                                     rephrasedSentence,
                                                                     extendedSentence,
                                                                     sentenceCritique,
                                                                     onAddSentence,
                                                                     // onClickConsistencyCheck,
                                                                 }) => {
    const isLoading = (stage: MenuCardStage) => stage === MenuCardStage.LOADING;

    const isReadyToShow = (stage: MenuCardStage, data: boolean) =>
        (stage === MenuCardStage.SHOWN || stage === MenuCardStage.NEEDS_UPDATE) && data;

    const renderCritiqueCard = () => {
        if (isLoading(script.critiqueStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(script.critiqueStage, !!script.critique) && !!script?.critique) {
            return <CritiqueCard strengths={script.critique.strength}
                                 improvement={script.critique.improvementArea}
                                 summary={script.critique.improvementSummary}/>;
        }
    };

    const renderAnalysisCard = () => {
        if (isLoading(script.analysisStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(script.analysisStage, !!script.analysis) && !!script.analysis) {
            return <AnalysisCard incident={script.analysis.incitingIncident}
                                 characters={script.analysis.characterDevelopment}
                                 themes={script.analysis.thematicImplications}
                                 foreshadowing={script.analysis.narrativeForeshadowing}/>;
        }
    };

    const renderConsistencyCard = () => {
        if (isLoading(script.consistencyStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(script.consistencyStage, !!script.consistency && script.consistency.length > 0) && !!script.consistency) {
            return (script.consistency.map((c, index) =>
                <ConsistencyAccordion key={index}
                                      index={index}
                                      text={c.text}
                                      issue={c.issue}
                                      suggestion={c.suggestion}
                                      revisedText={c.revisedText}
                                      // onClick={(index) => onClickConsistencyCheck(index)}
                                      menuWidth={menuWidth}/>
            ))
        }
    };

    const renderCard = () => {
        if (!project || !project.script) return <></>;

        switch (selectedMenuItem) {
            case MenuItem.CRITIQUE:
                return renderCritiqueCard();
            case MenuItem.ANALYSE:
                return renderAnalysisCard();
            case MenuItem.CONSISTENCY:
                return renderConsistencyCard();
            // case MenuItem.WHO:
            //     return <WhoWroteWhatCard onClick={() => {}}
            //                              index={0}
            //                              text={""}/>
            case MenuItem.REPHRASE:
                return <FloatingMenuAddCard text={rephrasedSentence}
                                            onClick={() => onAddSentence(false)}
                                            loading={!rephrasedSentence}/>;
            case MenuItem.EXPAND:
                return <FloatingMenuAddCard text={extendedSentence}
                                            onClick={() => onAddSentence(true)}
                                            loading={!extendedSentence}/>;
            case MenuItem.CRITIQUE_SENTENCE:
                return <FloatingMenuCard text={sentenceCritique}
                                         loading={!sentenceCritique}/>;
            default:
                return <></>;
        }
    }

    return (<>{renderCard()}</>)
}

export default CompletionMenuCards;