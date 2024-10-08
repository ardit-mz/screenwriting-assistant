import {MenuItem} from "../../enum/MenuItem.ts";
import QuestionSkeleton from "../skeleton/QuestionSkeleton.tsx";
import CritiqueCard from "./CritiqueCard.tsx";
import AnalysisCard from "./AnalysisCard.tsx";
import FloatingMenuAddCard from "./FloatingMenuAddCard.tsx";
import FloatingMenuCard from "./FloatingMenuCard.tsx";
import React from "react";
import {updateProject} from "../../features/project/ProjectSlice.ts";
import {Project} from "../../types/Project.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../store.ts";
import WhoWroteWhatCard from "./WhoWroteWhatCard.tsx";
import {Script} from "../../types/Script";
import ConsistencyAccordion from "../accordion/ConsistencyAccordion.tsx";

interface CompletionMenuCardsProps {
    project: Project | null;
    currentVersionIndex: number,
    loadingMenu: boolean;
    selectedMenuItem: MenuItem | null,
    menuWidth: string | number,
    rephrasedSentence: string,
    extendedSentence: string,
    sentenceCritique: string,
    highlightedText: string | null,
}

const CompletionMenuCards: React.FC<CompletionMenuCardsProps> = ({
                                                                     project,
                                                                     currentVersionIndex,
                                                                     loadingMenu,
                                                                     selectedMenuItem,
                                                                     menuWidth,
                                                                     rephrasedSentence,
                                                                     extendedSentence,
                                                                     sentenceCritique,
                                                                     highlightedText,
                                                                 }) => {
    const dispatch = useDispatch<AppDispatch>();

    const addSentenceToStepText = (extend: boolean = false) => {
        if (!project || !project.script || !highlightedText) return;

        console.log(loadingMenu); // TODO remove if not needed
        console.log("highlightedText", highlightedText)
        console.log("rephrasedSentence", rephrasedSentence)
        console.log("extendedSentence", extendedSentence)

        const newSentence = extend ? extendedSentence : rephrasedSentence;
        const newText = project.script.screenplay.replace(highlightedText, newSentence);
        // console.log("newText", newText)

        const updatedScript: Script = {
            ...project.script,
            screenplay: newText,
            versions: project.script.versions.map((version) =>
                version.id === project?.script?.versions[currentVersionIndex].id
                    ? {...version, text: newText}
                    : version
            )
        }

        const updatedProject: Project = {
            ...project,
            script: updatedScript
        };

        dispatch(updateProject(updatedProject))
    }

    const renderCard = () => {
        if (!project || !project.script) return <></>;

        switch (selectedMenuItem) {
            case MenuItem.CRITIQUE:
                if (project.script.critique) {
                    return <CritiqueCard strengths={project.script.critique.strength}
                                         improvement={project.script.critique.improvementArea}
                                         summary={project.script.critique.improvementSummary}/>;
                } else {
                    return <QuestionSkeleton width={menuWidth}/>;
                }
            case MenuItem.ANALYSE:
                if (project.script.analysis) {
                    return <AnalysisCard incident={project.script.analysis.incitingIncident}
                                         characters={project.script.analysis.characterDevelopment}
                                         themes={project.script.analysis.thematicImplications}
                                         foreshadowing={project.script.analysis.narrativeForeshadowing}/>;
                } else {
                    return <QuestionSkeleton width={menuWidth}/>;
                }
            case MenuItem.CONSISTENCY:
                if (project.script.consistency && project.script.consistency.length > 0) {
                    return (project.script.consistency.map((c, index) =>
                        <ConsistencyAccordion key={index}
                                              index={index}
                                              text={c.text}
                                              issue={c.issue}
                                              suggestion={c.suggestion}
                                              revisedText={c.revisedText}
                                              menuWidth={menuWidth}/>
                    ))
                } else {
                    return <QuestionSkeleton width={menuWidth}/>;
                }
            case MenuItem.WHO:
                return <WhoWroteWhatCard onClick={() => {}}
                                         index={0}
                                         text={""}/>
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

    return (<>{renderCard()}</>)
}

export default CompletionMenuCards;