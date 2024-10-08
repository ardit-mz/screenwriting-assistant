import React from "react";
import ContextMenu from "./ContextMenu.tsx";
import ContextMenuItem from "./ContextMenuItem.tsx";
import RefreshIcon from "@mui/icons-material/Refresh";
import {SwaColor} from "../../enum/SwaColor.ts";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import {MenuItem} from "../../enum/MenuItem.ts";
import {checkScriptConsistency, runAnalysis, runCritique} from "../../api/openaiAPI.ts";
import {updateProject} from "../../features/project/ProjectSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {selectApiKey} from "../../features/model/ModelSlice.ts";
import {Project} from "../../types/Project";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import DifferenceOutlinedIcon from "@mui/icons-material/DifferenceOutlined";
import {Script} from "../../types/Script";
import ShareMenuItem from "./ShareMenuItem.tsx";

interface CompletionMenuProps {
    project: Project | null;
    setCurrentVersionIndex: React.Dispatch<React.SetStateAction<number>>;
    handleRewriteScreenplay: () => void;
    handleShowTreatment: () => void;
    contextMenuRef: React.RefObject<HTMLDivElement>
    menuSecondTitle: string;
    setMenuSecondTitle: React.Dispatch<React.SetStateAction<string>>;
    selectedMenuItem: string | null;
    setSelectedMenuItem: React.Dispatch<React.SetStateAction<MenuItem | null>>;
}

const CompletionMenu: React.FC<CompletionMenuProps> = ({
                                                           project,
                                                           setCurrentVersionIndex,
                                                           handleRewriteScreenplay,
                                                           handleShowTreatment,
                                                           contextMenuRef,
                                                           menuSecondTitle,
                                                           setMenuSecondTitle,
                                                           selectedMenuItem,
                                                           setSelectedMenuItem,
                                                       }) => {
    const dispatch = useDispatch<AppDispatch>();
    const apiKey = useSelector(selectApiKey);
    console.log(setCurrentVersionIndex); // TODO remove if not needed

    const handleCritique = async () => {
        // console.log("handleCritique 0");
        if (!project || !project.script) return;

        setSelectedMenuItem(MenuItem.CRITIQUE);
        // setMenuSecondTitle('Loading critique');

        if (project.script.critique && project.script.critique?.strength && project.script.critique?.improvementArea && project.script.critique?.improvementSummary) {
            setMenuSecondTitle('');
            return;
        }

        // console.log("handleCritique 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I am looking for a critique for this script draft: ${project.script}`;

        try {
            const response = await runCritique(currentStoryBeatsStr + storyBeatPrompt, apiKey);
            // console.log("Refinement handleCritique response", response);

            const critiqueRes = response?.choices[0]?.message?.parsed ?? {
                strength: '',
                improvementArea: '',
                improvementSummary: ''
            };

            const updatedScript: Script = {
                ...project.script,
                critique: {
                    strength: critiqueRes.strength,
                    // @ts-expect-error has this format
                    improvementArea: critiqueRes.areas_for_improvement,
                    // @ts-expect-error has this format
                    improvementSummary: critiqueRes.summary_for_improvement
                }
            };

            const updatedProject: Project = {
                ...project,
                script: updatedScript
            };

            dispatch(updateProject(updatedProject))
            setMenuSecondTitle('');
        } catch (error) {
            console.error("Error fetching critique for the script:", error);
        }
    }

    const handleAnalysis = async () => {
        if (!project || !project.script) return;

        setSelectedMenuItem(MenuItem.ANALYSE);
        setMenuSecondTitle('Loading analysis');

        if (project.script.analysis && project.script.analysis?.incitingIncident && project.script.analysis?.characterDevelopment &&
            project.script.analysis?.thematicImplications && project.script.analysis?.narrativeForeshadowing) {
            setMenuSecondTitle('');
            return;
        }

        // console.log("handleAnalysis 1");
        const currentStoryBeatsStr = project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');
        const storyBeatPrompt = `I need an analysis for this script draft: ${project.script}`;

        try {
            const response = await runAnalysis(currentStoryBeatsStr + storyBeatPrompt, apiKey, 'script');
            // console.log("Refinement handleAnalysis response", response);

            const analysisRes = response?.choices[0]?.message?.parsed ?? {
                incitingIncident: '',
                characterDevelopment: '',
                thematicImplications: '',
                narrativeForeshadowing: ''
            };

            const updatedScript: Script = {
                ...project.script,
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

            const updatedProject: Project = {
                ...project,
                script: updatedScript
            };

            dispatch(updateProject(updatedProject))
            setMenuSecondTitle('');
        } catch (error) {
            console.error("Error fetching analysis for the story beat:", error);
        }
    }

    const handleCheckConsistency = async () => {
        // console.log("handleCheckConsistency 0");
        if (!project || !project.script) return;

        setSelectedMenuItem(MenuItem.CONSISTENCY);
        setMenuSecondTitle('Checking consistency');

        if (project.script.consistency && project.script.consistency.length > 0) {
            setMenuSecondTitle('');
            return;
        }

        // console.log("handleCheckConsistency 1");
        // TODO improve prompt check consistency
        const consistencyPrompt = `I need to check the consistency of this script draft: ${project.script}`;

        try {
            const response = await checkScriptConsistency(consistencyPrompt, apiKey);
            // console.log("handleCheckConsistency response", response);
            // @ts-expect-error It has this format
            const critiqueRes = response?.choices[0]?.message?.parsed.inconsistencies ?? [];

            const updatedScript: Script = {
                ...project.script,
                consistency: critiqueRes,
            };

            const updatedProject: Project = {
                ...project,
                script: updatedScript
            };

            dispatch(updateProject(updatedProject))
            setMenuSecondTitle('');
        } catch (error) {
            console.error("Error fetching checking consistency for the script:", error);
        }
    }

    const handleWhoWroteWhat = async () => {
        console.log("handleWhoWroteWhat 0");
        if (!project || !project.script)
            return;

        setSelectedMenuItem(MenuItem.WHO);

        if (project.script.whoWroteWhat && project.script.whoWroteWhat?.initialText && project.script.whoWroteWhat?.aiChanges && project.script.whoWroteWhat?.userChanges) {
            setMenuSecondTitle('');
            return;
        }
    }

    return (
        <ContextMenu secondTitle={menuSecondTitle ? menuSecondTitle : ''} ref={contextMenuRef}>
            <ContextMenuItem icon={<RefreshIcon/>}
                             name="Rewrite Script"
                             onClick={handleRewriteScreenplay}/>
            <ContextMenuItem icon={<SummarizeOutlinedIcon/>}
                             name="Show Treatment"
                             onClick={handleShowTreatment}/>
            <ContextMenuItem icon={<PriorityHighOutlinedIcon/>}
                             name="Critique"
                             onClick={handleCritique}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem != MenuItem.CRITIQUE ? '' : 'Get a critique of the draft so far' }
                             backgroundColor={SwaColor.redLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.CRITIQUE}/>
            <ContextMenuItem icon={<AutoGraphOutlinedIcon/>}
                             name="Analyse"
                             onClick={handleAnalysis}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem != MenuItem.ANALYSE ? '' : 'Get an analysis of the draft so far'}
                             backgroundColor={SwaColor.violetLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.ANALYSE}/>
            <ContextMenuItem icon={<TaskOutlinedIcon/>}
                             name="Check Consistency"
                             onClick={handleCheckConsistency}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem != MenuItem.CONSISTENCY ? '' : 'Find inconsistencies in the draft'}
                             backgroundColor={SwaColor.yellowLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.CONSISTENCY}/>
            <ContextMenuItem icon={<DifferenceOutlinedIcon/>}
                             name="Who wrote what"
                             onClick={handleWhoWroteWhat}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem === MenuItem.WHO ? 'Show who wrote what' : ''}
                             backgroundColor={SwaColor.greenLighter}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.WHO}/>
            <ShareMenuItem text={project?.script?.screenplay || null} />
        </ContextMenu>
    )
}

export default CompletionMenu;