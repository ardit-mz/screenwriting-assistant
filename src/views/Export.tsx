// views/Export.tsx

import Box from "@mui/material/Box";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../store.ts";
import {selectCurrentProject, updateProject} from "../features/project/ProjectSlice.ts";
import {useEffect, useState} from "react";
import {storyBeatsToScreenplay, storyBeatsToTreatment} from "../api/openaiAPI.ts";
import {Project} from "../types/Project";
import {SwaColor} from "../enum/SwaColor.ts";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import ContextMenu from "../components/menu/ContextMenu.tsx";
import ContextMenuItem from "../components/menu/ContextMenuItem.tsx";
import RefreshIcon from "@mui/icons-material/Refresh";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import DifferenceOutlinedIcon from '@mui/icons-material/DifferenceOutlined';
import WhoWroteWhatCard from "../components/card/WhoWroteWhatCard.tsx";
import ShareIcon from '@mui/icons-material/Share';
import TreatmentDialog from "../components/dialog/TreatmentDialog.tsx";
import {handleBlurBackground} from "../features/theme/ThemeSlice.ts";
import ExportSkeleton from "../components/skeleton/ExportSkeleton.tsx";
import ScriptTextField from "../components/textField/ScriptTextField.tsx";

const Export = () => {
    const dispatch = useDispatch<AppDispatch>();
    const project = useSelector(selectCurrentProject)
    const apiKey = useSelector(selectApiKey);

    const [showTreatment, setShowTreatment] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!project?.script || !project?.script?.screenplay) {
            fetchScreenplay().then(res => {
                console.log("Export fetchScreenplay res", res)
                }
            ).catch( (e) => console.log("Export fetchScreenplay err", e));
        }
    }, []);

    const fetchScreenplay = async () => {
        if (!project || !project.storyBeats) return;

        const storyBeatsStr = "My storybeats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');

        try {
            const StoryBeatsToScreenplayRes = await storyBeatsToScreenplay(storyBeatsStr, apiKey);
            const screenplay = StoryBeatsToScreenplayRes?.choices[0]?.message?.content ?? "";
            const script = {screenplay: screenplay, treatment: undefined, versions: project.script?.versions ?? []}

            const updatedProject: Project = {
                ...project,
                script: script
            };
            dispatch(updateProject(updatedProject))

            setLoading(false);
        } catch (error) {
            console.error("Error fetching screenplay for export:", error);
        }
    };

    const fetchTreatment = async () => {
        if (!project || !project.storyBeats || !project.script) return;

        const storyBeatsStr = "My storybeats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');

        try {
            const StoryBeatsToScreenplayRes = await storyBeatsToTreatment(storyBeatsStr, apiKey);
            const treatment = StoryBeatsToScreenplayRes?.choices[0]?.message?.content ?? "";
            const script = {screenplay: project?.script?.screenplay, treatment: treatment, versions: project?.script?.versions ?? []}

            const updatedProject: Project = {
                ...project,
                script: script
            };
            dispatch(updateProject(updatedProject))
        } catch (error) {
            console.error("Error fetching screenplay for export:", error);
        }
    };


    // const handleShare = () => {
    //     // TODO handle export share
    //     // console.log("Export share")
    // }

    // console.log("Export project", project)

    const handleRewriteScreenplay = () => {
        setLoading(true);
        fetchScreenplay();
    }

    const handleShowTreatment = () => {
        fetchTreatment();
        dispatch(handleBlurBackground(!showTreatment));
        setShowTreatment(!showTreatment);
    }

    return (<>{
        ((!project?.script && !project?.script?.screenplay) || loading) ? <ExportSkeleton/>
        : <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100%'}}>
            <ScriptTextField text={project?.script.screenplay} versions={project?.script?.versions ?? []}/>
            {/*<ScriptEditor text={project?.script.screenplay} />*/}

            <Box sx={{flex:2, width: '100%', mt: 3}}>
                <ContextMenu style={{minWidth:360}}>
                    <ContextMenuItem icon={<RefreshIcon/>}
                                     name="Rewrite Script"
                                     onClick={handleRewriteScreenplay}/>
                    <ContextMenuItem icon={<SummarizeOutlinedIcon/>}
                                     name="Show Treatment"
                                     onClick={handleShowTreatment}
                                     showDescription={true}
                                     description=""
                                     onSelect={() => "Show Treatment"}/>
                    <ContextMenuItem icon={<PriorityHighOutlinedIcon/>}
                                     name="Critique"
                                     onClick={() => console.log("Critique")}
                                     showDescription={true}
                                     description="Critique the whole story beat"
                                     backgroundColor={SwaColor.redLight}
                                     onSelect={() => "Critique"}/>
                    <ContextMenuItem icon={<AutoGraphOutlinedIcon/>}
                                     name="Analyse"
                                     onClick={() => console.log("Analyse")}
                                     showDescription={true}
                                     description="Analyse this story beat"
                                     backgroundColor={SwaColor.violetLight}
                                     onSelect={() => "Analyse"}/>
                    <ContextMenuItem icon={<TaskOutlinedIcon/>}
                                     name="Check Consistency"
                                     onClick={() => console.log("Check Consistency")}
                                     showDescription={true}
                                     description=""
                                     backgroundColor={'#F9FCD7'}
                                     onSelect={() => "Check Consistency"}/>
                    <ContextMenuItem icon={<DifferenceOutlinedIcon/>}
                                     name="Who wrote what"
                                     onClick={() => console.log("Who wrote what")}
                                     showDescription={true}
                                     description=""
                                     backgroundColor={'#D1F5EA'}
                                     onSelect={() => "Who wrote what"}/>
                    <ContextMenuItem icon={<ShareIcon/>}
                                     name="Share"
                                     onClick={() => console.log("Share")}/>
                </ContextMenu>

                {/*<CritiqueCard onClick={() => {}}*/}
                {/*              index={0}*/}
                {/*              text={""}/>*/}

                {/*<AnalysisCard onClick={() => {}}*/}
                {/*              index={0}*/}
                {/*              text={""}/>*/}

                {/*<ConsistencyCard onClick={() => {}}*/}
                {/*              index={0}*/}
                {/*              text={""}/>*/}

                <WhoWroteWhatCard onClick={() => {}}
                                  index={0}
                                  text={""}/>

            </Box>

            <TreatmentDialog open={showTreatment}
                             onClose={handleShowTreatment}
                             onExport={() => {}}
                             onRewrite={fetchTreatment}
                             treatment={project.script.treatment}
            />

            {/*<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'end', maxWidth:240 }}>*/}
            {/*    <Button onClick={handleRegenerateScreenplay} variant="contained" style={{marginTop:10}}>{project && !project.export ? "Generate Screenplay" : "Re-Generate Screenplay"}</Button>*/}
            {/*    <Button onClick={handleRegenerateTreatment} variant="contained" style={{marginTop:10}}>{project && !project.export ? "Generate Treatment" : "Re-Generate Treatment"}</Button>*/}
            {/*    <Tooltip title={"TODO"}>*/}
            {/*        <Button onClick={handleShare} variant="contained" style={{marginTop:10}}>Share</Button>*/}
            {/*    </Tooltip>*/}
            {/*</Box>*/}

        </Box>
        }</>)
}

export default Export;