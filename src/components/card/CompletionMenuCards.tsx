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
    currentVersionIndex: number;
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
                                                                     currentVersionIndex,
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
        const selectedVersion = script.versions[currentVersionIndex];
        if (isLoading(selectedVersion.critiqueStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion.critiqueStage, !!selectedVersion.critique) && !!selectedVersion?.critique) {
            return <CritiqueCard strengths={selectedVersion.critique.strength}
                                 improvement={selectedVersion.critique.improvementArea}
                                 summary={selectedVersion.critique.improvementSummary}/>;
        }
    };

    const renderAnalysisCard = () => {
        const selectedVersion = script.versions[currentVersionIndex];
        if (isLoading(selectedVersion.analysisStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion.analysisStage, !!selectedVersion.analysis) && !!selectedVersion.analysis) {
            return <AnalysisCard incident={selectedVersion.analysis.incitingIncident}
                                 characters={selectedVersion.analysis.characterDevelopment}
                                 themes={selectedVersion.analysis.thematicImplications}
                                 foreshadowing={selectedVersion.analysis.narrativeForeshadowing}/>;
        }
    };

    const renderConsistencyCard = () => {
        const selectedVersion = script.versions[currentVersionIndex];
        if (isLoading(selectedVersion?.consistencyStage)) {
            return <QuestionSkeleton width={menuWidth}/>;
        } else if (isReadyToShow(selectedVersion?.consistencyStage, !!selectedVersion?.consistency && selectedVersion.consistency.length > 0) && !!selectedVersion.consistency) {
            return (selectedVersion.consistency.map((c, index) =>
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