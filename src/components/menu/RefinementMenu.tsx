import React from "react";
import ContextMenu from "./ContextMenu.tsx";
import ContextMenuItem from "./ContextMenuItem.tsx";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import {SwaColor} from "../../enum/SwaColor.ts";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import {MenuItem} from "../../enum/MenuItem.ts";
import {StoryBeatVersion} from "../../types/StoryBeat";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";

interface RefinementMenuProps {
    selectedVersion: StoryBeatVersion;
    contextMenuRef: React.RefObject<HTMLDivElement>
    menuSecondTitle: string;
    selectedMenuItem: string | null;
    onRewrite: () => void;
    onEmotion: () => void;
    onQuestion: () => void;
    onCritique: () => void;
    onAnalysis: () => void;
    menuWidth: string | number;
}

const RefinementMenu: React.FC<RefinementMenuProps> = ({
                                                           selectedVersion,
                                                           contextMenuRef,
                                                           menuSecondTitle,
                                                           selectedMenuItem,
                                                           onRewrite,
                                                           onEmotion,
                                                           onQuestion,
                                                           onCritique,
                                                           onAnalysis,
                                                           menuWidth,
                                                       }) => {
    const showDescription = (typeof menuWidth === 'number') ? (menuWidth > 350) : (parseFloat(menuWidth) > 450);

    const getDescription = (menuItem: MenuItem, stage: MenuCardStage, defaultText: string) => {
        if (stage === MenuCardStage.NEEDS_UPDATE) {
            return 'Click to update';
        }
        if (selectedMenuItem === menuItem) {
            return defaultText;
        }
        return '';
    };

    return (
        <ContextMenu secondTitle={menuSecondTitle ? menuSecondTitle : ''} ref={contextMenuRef}>
            <ContextMenuItem icon={<RefreshIcon/>}
                             name={"Rewrite Story Beat"}
                             onClick={onRewrite}/>

            <ContextMenuItem icon={<MoodOutlinedIcon/>}
                             name="Emotion"
                             onClick={onEmotion}
                             showDescription={showDescription}
                             description={getDescription(MenuItem.EMOTION, selectedVersion?.emotionStage, 'Analysis and enhancement suggestions')}
                             backgroundColor={SwaColor.greenLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.EMOTION}/>

            <ContextMenuItem icon={<QuestionMarkOutlinedIcon/>}
                             name="Question"
                             onClick={onQuestion}
                             showDescription={showDescription}
                             description={getDescription(MenuItem.QUESTION, selectedVersion?.questionStage, 'Analyse raised questions and answers')}
                             backgroundColor={SwaColor.orangeLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.QUESTION}/>

            <ContextMenuItem icon={<PriorityHighOutlinedIcon/>}
                             name="Critique"
                             onClick={onCritique}
                             showDescription={showDescription}
                             description={getDescription(MenuItem.CRITIQUE, selectedVersion?.critiqueStage, 'Critique the whole story beat')}
                             backgroundColor={SwaColor.redLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.CRITIQUE}/>

            <ContextMenuItem icon={<AutoGraphOutlinedIcon/>}
                             name="Analyse"
                             onClick={onAnalysis}
                             showDescription={showDescription}
                             description={getDescription(MenuItem.ANALYSE, selectedVersion?.analysisStage, 'Analyse this story beat')}
                             backgroundColor={SwaColor.violetLight}
                             active={!!selectedMenuItem && selectedMenuItem === MenuItem.ANALYSE}/>
        </ContextMenu>
    )
}

export default RefinementMenu;