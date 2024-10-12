import React from "react";
import ContextMenu from "./ContextMenu.tsx";
import ContextMenuItem from "./ContextMenuItem.tsx";
import RefreshIcon from "@mui/icons-material/Refresh";
import {SwaColor} from "../../enum/SwaColor.ts";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import {MenuItem} from "../../enum/MenuItem.ts";
import {Project} from "../../types/Project";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import ShareMenuItem from "./ShareMenuItem.tsx";

interface CompletionMenuProps {
    project: Project | null;
    handleRewriteScreenplay: () => void;
    handleShowTreatment: () => void;
    contextMenuRef: React.RefObject<HTMLDivElement>
    menuSecondTitle: string;
    selectedMenuItem: string | null;
    onCritique: () => void;
    onAnalyse: () => void;
    onConsistencyCheck: () => void;
    // onWhoWroteWhat: () => void;
}

const CompletionMenu: React.FC<CompletionMenuProps> = ({
                                                           project,
                                                           handleRewriteScreenplay,
                                                           handleShowTreatment,
                                                           contextMenuRef,
                                                           menuSecondTitle,
                                                           selectedMenuItem,
                                                           onCritique,
                                                           onAnalyse,
                                                           onConsistencyCheck,
                                                           // onWhoWroteWhat,
                                                       }) => {

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
                             onClick={onCritique}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem != MenuItem.CRITIQUE ? '' : 'Get a critique of the draft so far' }
                             backgroundColor={SwaColor.redLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.CRITIQUE}/>
            <ContextMenuItem icon={<AutoGraphOutlinedIcon/>}
                             name="Analyse"
                             onClick={onAnalyse}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem != MenuItem.ANALYSE ? '' : 'Get an analysis of the draft so far'}
                             backgroundColor={SwaColor.violetLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.ANALYSE}/>
            <ContextMenuItem icon={<TaskOutlinedIcon/>}
                             name="Check Consistency"
                             onClick={onConsistencyCheck}
                             showDescription={true}
                             description={!!selectedMenuItem && selectedMenuItem != MenuItem.CONSISTENCY ? '' : 'Find inconsistencies in the draft'}
                             backgroundColor={SwaColor.yellowLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.CONSISTENCY}/>
            {/*<ContextMenuItem icon={<DifferenceOutlinedIcon/>}*/}
            {/*                 name="Who wrote what"*/}
            {/*                 onClick={onWhoWroteWhat}*/}
            {/*                 showDescription={true}*/}
            {/*                 description={!!selectedMenuItem && selectedMenuItem === MenuItem.WHO ? 'Show who wrote what' : ''}*/}
            {/*                 backgroundColor={SwaColor.greenLighter}*/}
            {/*                 active={!!selectedMenuItem && selectedMenuItem === MenuItem.WHO}/>*/}
            <ShareMenuItem text={project?.script?.screenplay || null} />
        </ContextMenu>
    )
}

export default CompletionMenu;