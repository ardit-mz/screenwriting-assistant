// views/Export.tsx

import Box from "@mui/material/Box";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../store.ts";
import {selectCurrentProject, updateProject} from "../features/project/ProjectSlice.ts";
import {useEffect, useRef, useState} from "react";
import {
    critiqueSentence,
    extendSentence,
    rephraseSentence,
    storyBeatsToScreenplay,
    storyBeatsToTreatment
} from "../api/openaiAPI.ts";
import {Project} from "../types/Project";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import TreatmentDialog from "../components/dialog/TreatmentDialog.tsx";
import {handleBlurBackground} from "../features/theme/ThemeSlice.ts";
import ExportSkeleton from "../components/skeleton/ExportSkeleton.tsx";
import ScriptTextField from "../components/textField/ScriptTextField.tsx";
import CompletionMenuCards from "../components/card/CompletionMenuCards.tsx";
import CompletionMenu from "../components/menu/CompletionMenu.tsx";
import {MenuItem} from "../enum/MenuItem.ts";
import FloatingContextMenu from "../components/menu/FloatingContextMenu.tsx";
import {v4 as uuidv4} from "uuid";

const Export = () => {
    const dispatch = useDispatch<AppDispatch>();
    const project = useSelector(selectCurrentProject)
    const apiKey = useSelector(selectApiKey);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const textFieldContainerRef = useRef<HTMLDivElement>(null);

    const [showTreatment, setShowTreatment] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [menuSecondTitle, setMenuSecondTitle] = useState<string>('');
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);
    const [menuWidth, setMenuWidth] = useState<number | string>('auto');
    const [rephrasedSentence, setRephrasedSentence] = useState<string>("");
    const [extendedSentence, setExtendedSentence] = useState<string>("");
    const [sentenceCritique, setSentenceCritique] = useState<string>("");
    const [currentText, setCurrentText] = useState<string>(project?.script?.screenplay ?? '');
    const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);

    useEffect(() => {
        if (!project?.script || !project?.script?.screenplay) {
            fetchScreenplay().then(res => {
                    console.log("Export fetchScreenplay res", res)
                }
            ).catch((e) => console.log("Export fetchScreenplay err", e));
        }
    }, []);

    useEffect(() => {
        if (contextMenuRef.current) {
            setMenuWidth(contextMenuRef.current.offsetWidth);
        }
    }, [contextMenuRef.current]);

    const fetchScreenplay = async (isRewrite: boolean = false) => {
        if (!project || !project.storyBeats) return;

        const storyBeatsStr = "My story beats are:\\n" + project.storyBeats.map((s, i) => `${i + 1}: ${s.text}`).join('\n');

        try {
            const StoryBeatsToScreenplayRes = await storyBeatsToScreenplay(storyBeatsStr, apiKey);
            const screenplay = StoryBeatsToScreenplayRes?.choices[0]?.message?.content ?? "";

            const versions = isRewrite ? [
                ...(project.script?.versions ?? []),
                {id: uuidv4(), text: screenplay},
            ] : project.script?.versions ?? [{id: uuidv4(), text: screenplay}]

            const script = {
                screenplay: screenplay,
                treatment: undefined,
                versions: versions,
                critique: undefined,
                analysis: undefined,
                consistency: undefined,
                whoWroteWhat: undefined,
            }

            const updatedProject: Project = {
                ...project,
                script: script
            };
            dispatch(updateProject(updatedProject))

            setLoading(false);
            setCurrentText(screenplay);
            if (isRewrite && !!project?.script?.versions && project.script.versions.length > 0) setCurrentVersionIndex(project.script.versions.length);
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
            const script = {
                screenplay: project?.script?.screenplay,
                treatment: treatment,
                versions: project?.script?.versions ?? [],
                critique: undefined,
                analysis: undefined,
                consistency: undefined,
                whoWroteWhat: undefined,
            }

            const updatedProject: Project = {
                ...project,
                script: script
            };
            dispatch(updateProject(updatedProject))
        } catch (error) {
            console.error("Error fetching screenplay for export:", error);
        }
    };

    const handleRewriteScreenplay = () => {
        setLoading(true);
        fetchScreenplay(true).catch((e) => console.log("fetchScreenplay error:", e));

    }

    const handleShowTreatment = () => {
        fetchTreatment().catch((e) => console.log("fetchTreatment error:", e));
        dispatch(handleBlurBackground(!showTreatment));
        setShowTreatment(!showTreatment);
    }

    const handleSentenceRephrase = async (selectedText: string) => {
        if (!project || !project.storyBeats || !project.script) return;

        setSelectedMenuItem(MenuItem.REPHRASE);
        if (rephrasedSentence) setRephrasedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Rephrase this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${!project.script}`

        try {
            const rephraseRes = await rephraseSentence(prompt + context, apiKey);
            const rephrasedNew = rephraseRes?.choices[0].message.content ?? '';
            setRephrasedSentence(rephrasedNew);
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const handleSentenceExpand = async (selectedText: string) => {
        if (!project || !project.storyBeats || !project.script) return;

        setSelectedMenuItem(MenuItem.EXPAND);
        if (extendedSentence) setExtendedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Continue on writing from this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${!project.script}`

        try {
            const extendedRes = await extendSentence(prompt + context, apiKey);
            const extendedNew = extendedRes?.choices[0].message.content ?? '';
            setExtendedSentence(extendedNew);
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const handleSentenceCritique = async (selectedText: string) => {
        if (!project || !project.storyBeats || !project.script) return;

        setSelectedMenuItem(MenuItem.CRITIQUE_SENTENCE);
        if (sentenceCritique) setSentenceCritique('');
        setHighlightedText(selectedText);

        const prompt = `Critique this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${!project.script}`

        try {
            const critiqueRes = await critiqueSentence(prompt + context, apiKey);
            const critiqueNew = critiqueRes?.choices[0].message.content ?? '';
            setSentenceCritique(critiqueNew);
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    console.log("project?.script", project?.script);

    return (<>{
        ((!project?.script && !project?.script?.screenplay) || loading)
            ? <ExportSkeleton/>
            : <Box sx={{display: 'flex', flexDirection: 'row', height: 'calc(100vh - 192px)'}}>
                <ScriptTextField style={{flex: 7}}
                                 text={currentText}
                                 versions={project?.script?.versions ?? []}
                                 ref={textFieldContainerRef}
                                 currentVersionIndex={currentVersionIndex}
                                 setCurrentVersionIndex={setCurrentVersionIndex}

                />
                {/*<ScriptEditor text={project?.script.screenplay} />*/}

                <Box sx={{flex: 3, width: '100%', mt: 3, minWidth: '500px'}}>
                    <CompletionMenu project={project}
                                    setCurrentVersionIndex={() => {}}
                                    handleRewriteScreenplay={handleRewriteScreenplay}
                                    handleShowTreatment={handleShowTreatment}
                                    contextMenuRef={contextMenuRef}
                                    menuSecondTitle={menuSecondTitle}
                                    setMenuSecondTitle={setMenuSecondTitle}
                                    selectedMenuItem={selectedMenuItem}
                                    setSelectedMenuItem={setSelectedMenuItem}
                    />

                    <CompletionMenuCards project={project}
                                         currentVersionIndex={0}
                                         loadingMenu={false}
                                         selectedMenuItem={selectedMenuItem}
                                         menuWidth={menuWidth}
                                         rephrasedSentence={rephrasedSentence}
                                         extendedSentence={extendedSentence}
                                         sentenceCritique={sentenceCritique}
                                         highlightedText={highlightedText}
                    />
                </Box>

                <FloatingContextMenu textFieldRef={textFieldContainerRef}
                                     onRephrase={(text) => handleSentenceRephrase(text)}
                                     onExpand={(text) => handleSentenceExpand(text)}
                                     onCritique={(text) => handleSentenceCritique(text)}
                />

                <TreatmentDialog open={showTreatment}
                                 onClose={handleShowTreatment}
                                 onExport={() => {
                                 }}
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