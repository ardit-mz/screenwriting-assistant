import Box from "@mui/material/Box";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../store.ts";
import {selectCurrentProject, updateProject} from "../features/project/ProjectSlice.ts";
import {useEffect, useRef, useState} from "react";
import {
    checkScriptConsistency,
    critiqueSentence,
    extendSentence,
    rephraseSentence,
    screenplayAnalysis,
    screenplayCritique,
    storyBeatsToScreenplay,
    screenplayToTreatment, updateScreenplay
} from "../api/openaiAPI.ts";
import {Project} from "../types/Project";
import {selectApiKey, selectModel} from "../features/model/ModelSlice.ts";
import TreatmentDialog from "../components/dialog/TreatmentDialog.tsx";
import {handleBlurBackground} from "../features/theme/ThemeSlice.ts";
import ExportSkeleton from "../components/skeleton/ExportSkeleton.tsx";
import ScriptTextField from "../components/textField/ScriptTextField.tsx";
import CompletionMenuCards from "../components/card/CompletionMenuCards.tsx";
import CompletionMenu from "../components/menu/CompletionMenu.tsx";
import {MenuItem} from "../enum/MenuItem.ts";
import FloatingContextMenu from "../components/menu/FloatingContextMenu.tsx";
import {v4 as uuidv4} from "uuid";
import {debounce} from "../helper/DebounceHelper.ts";
import {showDialogError} from "../features/drawer/DrawerSlice.ts";
import {ParsedChatCompletion} from "openai/resources/beta/chat/completions";
import {Script, ScriptVersion} from "../types/Script";
import {MenuCardStage} from "../enum/MenuCardStage.ts";
import {storyBeatSToString} from "../helper/StringHelper.ts";

const Export = () => {
    const dispatch = useDispatch<AppDispatch>();
    const project = useSelector(selectCurrentProject)
    const apiKey = useSelector(selectApiKey);
    const model = useSelector(selectModel);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const textFieldContainerRef = useRef<HTMLDivElement>(null);

    const [script, setScript] = useState(project?.script);
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
        if (contextMenuRef.current) {
            setMenuWidth(contextMenuRef.current.offsetWidth);
        }
    }, [contextMenuRef.current]);

    useEffect(() => {
        if (project?.script) {
            setScript(project.script);
            setCurrentText(script?.versions[currentVersionIndex]?.screenplay ?? '')
        }
    }, [project?.script, currentVersionIndex]);

    const fetchScreenplay = async (isRewrite: boolean = false) => {
        if (!project || !project.storyBeats) return;

        const storyBeatsStr = `My story beats are:\n ${storyBeatSToString(project.storyBeats)}`;

        try {
            const StoryBeatsToScreenplayRes = await storyBeatsToScreenplay(storyBeatsStr, apiKey, model);

            if (typeof StoryBeatsToScreenplayRes === 'number') {
                if (StoryBeatsToScreenplayRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const screenplay = StoryBeatsToScreenplayRes?.choices[0]?.message?.content ?? "";

                const newVersion: ScriptVersion = {
                    id: uuidv4(),
                    screenplay: screenplay,
                    treatment: undefined,
                    critique: undefined,
                    analysis: undefined,
                    consistency: undefined,
                    whoWroteWhat: undefined,
                    critiqueStage: MenuCardStage.UNINITIALIZED,
                    analysisStage: MenuCardStage.UNINITIALIZED,
                    consistencyStage: MenuCardStage.UNINITIALIZED,
                    whoWroteWhatStage: MenuCardStage.UNINITIALIZED,
                }

                const versions = isRewrite
                    ? [...(project.script?.versions ?? []), newVersion ]
                    : project.script?.versions ?? [newVersion]

                const updatedScript: Script = {
                    screenplay: screenplay,
                    treatment: undefined,
                    versions: versions,
                    needsUpdate: false,
                    selectedVersion: (isRewrite && !!versions && versions.length > 0) ? (versions.length - 1) : currentVersionIndex
                }

                const updatedProject: Project = {
                    ...project,
                    script: updatedScript
                };
                dispatch(updateProject(updatedProject))

                setLoading(false);
                setCurrentText(screenplay);
                if (isRewrite && !!versions && versions.length > 0) setCurrentVersionIndex(versions.length - 1);
            }
        } catch (error) {
            console.error("Error fetching screenplay for export:", error);
        }
    };

    const debouncedFetchScreenplay = useRef(debounce(() => fetchScreenplay(false), 1000));

    useEffect(() => {
        if (!script || !script?.screenplay) {
            debouncedFetchScreenplay.current();
        }
    }, []);

    const fetchTreatment = async () => {
        if (!project || !script) return;

        const prompt = `My screenplay is:\n ${script.screenplay}`

        try {
            const storyBeatsToTreatmentRes = await screenplayToTreatment(prompt, apiKey, model);

            if (typeof storyBeatsToTreatmentRes === 'number') {
                if (storyBeatsToTreatmentRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const treatment = storyBeatsToTreatmentRes?.choices[0]?.message?.content ?? "";

                const newVersions = script.versions.map((version) =>
                    version.id === script.versions[currentVersionIndex].id
                        ? {...version, treatment: treatment}
                        : version
                );

                const updatedScript = {
                    ...script,
                    treatment: treatment,
                    versions: newVersions,
                }

                const updatedProject: Project = {
                    ...project,
                    script: updatedScript
                };
                dispatch(updateProject(updatedProject))

            }
        } catch (error) {
            console.error("Error fetching screenplay for export:", error);
        }
    };

    const handleUpdate = async () => {
        if (!project || !script) return;

        setLoading(true);

        const prompt = `
        My story beats are:\n ${storyBeatSToString(project.storyBeats)}
        My current screenplay, which needs to be updated to the modified story beats is:\n${project.script?.screenplay}
        `

        try {
            const updatedScreenplayRes = await updateScreenplay(prompt, apiKey, model);

            if (typeof updatedScreenplayRes === 'number') {
                if (updatedScreenplayRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const screenplay = updatedScreenplayRes?.choices[0]?.message?.content ?? "";

                const newVersion: ScriptVersion = {
                    id: uuidv4(),
                    screenplay: screenplay,
                    treatment: undefined,
                    critique: undefined,
                    analysis: undefined,
                    consistency: undefined,
                    whoWroteWhat: undefined,
                    critiqueStage: MenuCardStage.UNINITIALIZED,
                    analysisStage: MenuCardStage.UNINITIALIZED,
                    consistencyStage: MenuCardStage.UNINITIALIZED,
                    whoWroteWhatStage: MenuCardStage.UNINITIALIZED,
                }

                const versions = project.script?.versions ?? [newVersion]

                const updatedScript: Script = {
                    screenplay: screenplay,
                    treatment: undefined,
                    versions: versions,
                    selectedVersion: 0,
                    needsUpdate: false,
                }

                const updatedProject: Project = {
                    ...project,
                    script: updatedScript
                };
                dispatch(updateProject(updatedProject))

                setLoading(false);
                setCurrentText(screenplay);
                setCurrentVersionIndex(0);
            }
        } catch (error) {
            console.error("Error updating screenplay for export:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleRewriteScreenplay = () => {
        setLoading(true);
        fetchScreenplay(true).catch((e) => console.log("fetchScreenplay error:", e));
    }

    const handleShowTreatment = () => {
        fetchTreatment().catch((e) => console.log("fetchTreatment error:", e));
        dispatch(handleBlurBackground(!showTreatment));
        setShowTreatment(!showTreatment);
    }

    const shouldUpdateStage = (stage: MenuCardStage) =>
        stage === MenuCardStage.NEEDS_UPDATE || stage === MenuCardStage.UNINITIALIZED;

    const handleMenuAction = async (
        menuItem: MenuItem,
        menuTitle: string,
        prompt: string,
        apiFunction: (prompt: string, apiKey: string, model: string) =>  Promise<number | ParsedChatCompletion<null> | undefined>,
        successHandler: (response: ParsedChatCompletion<null> | undefined) => Script,
        updateCondition: boolean,
    ) => {
        if (!project || !script) return;

        setSelectedMenuItem(menuItem);

        const createNewScript = (stage: MenuCardStage): Script => {
            let stageKey = '';
            switch(menuItem) {
                case MenuItem.CRITIQUE:
                    stageKey = 'critiqueStage';
                    break;
                case MenuItem.ANALYSE:
                    stageKey = 'analysisStage';
                    break;
                case MenuItem.CONSISTENCY:
                    stageKey = 'consistencyStage';
                    break;
                case MenuItem.WHO:
                    stageKey = 'whoWroteWhatStage';
                    break;
                default:
                    return script;
            }

            return {
                ...script,
                versions: script.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            [stageKey]: stage
                        };
                    }
                    return version;
                }),
            };
        };

        const newScript = createNewScript(
            updateCondition ? MenuCardStage.LOADING : MenuCardStage.SHOWN
        );

        setScript(newScript);

        const updatedProject: Project = {
            ...project,
            script: newScript
        };
        dispatch(updateProject(updatedProject))

        if (updateCondition) {
            setMenuSecondTitle(menuTitle);

            try {
                const response = await apiFunction(prompt, apiKey, model);

                if (typeof response === 'number') {
                    if (response === 401) dispatch(showDialogError(true));
                } else {
                    dispatch(showDialogError(false));
                    const updatedScript = successHandler(response);

                    const updatedProject: Project = {
                        ...project,
                        script: updatedScript
                    };
                    dispatch(updateProject(updatedProject))
                }
            } catch (error) {
                console.error(`Error handling ${menuItem}:`, error);
            } finally {
                setMenuSecondTitle('');
            }
        }
    };

    const handleCritique = () => {
        if (!project || !script) return;

        const prompt = `I am looking for a critique for this script draft: ${script}`;

        handleMenuAction(
            MenuItem.CRITIQUE,
            'Loading critique',
            prompt,
            screenplayCritique,
            (response) => {
                const critiqueRes = response?.choices[0]?.message?.parsed ?? {
                    strength: '',
                    improvementArea: '',
                    improvementSummary: ''
                };

                const updatedVersions = script.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            critique: critiqueRes,
                            critiqueStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });

                return {
                    ...script,
                    versions: updatedVersions,
                } as Script;
            },
            shouldUpdateStage(script.versions[currentVersionIndex].critiqueStage)
        );
    };

    const handleAnalyse = () => {
        if (!project || !script) return;

        const prompt = `I need an analysis for this script draft: ${script}`;

        handleMenuAction(
            MenuItem.ANALYSE,
            'Loading analysis',
            prompt,
            screenplayAnalysis,
            (response) => {
                const analysisRes = response?.choices[0]?.message?.parsed ?? {
                    incitingIncident: '',
                    characterDevelopment: '',
                    thematicImplications: '',
                    narrativeForeshadowing: ''
                };

                const updatedVersions = script.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,
                            analysis: analysisRes,
                            analysisStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });

                return {
                    ...script,
                    versions: updatedVersions,
                } as Script;
            },
            shouldUpdateStage(script.versions[currentVersionIndex].analysisStage)
        );
    };

    const handleCheckConsistency = () => {
        if (!project || !script) return;

        const prompt = `I need to check the consistency of this script draft: ${script}`;

        handleMenuAction(
            MenuItem.CONSISTENCY,
            'Checking consistency',
            prompt,
            checkScriptConsistency,
            (response) => {
                // @ts-expect-error It has this format
                const consistencyRes = response?.choices[0]?.message?.parsed.inconsistencies ?? [];

                const updatedVersions = script.versions.map((version, index) => {
                    if (index === currentVersionIndex) {
                        return {
                            ...version,consistency: consistencyRes,
                            consistencyStage: MenuCardStage.SHOWN,
                        };
                    }
                    return version;
                });

                return {
                    ...script,
                    versions: updatedVersions,
                } as Script;
            },
            shouldUpdateStage(script.versions[currentVersionIndex].consistencyStage)
        );
    };

    const handleSentenceRephrase = async (selectedText: string) => {
        if (!project || !script) return;

        setSelectedMenuItem(MenuItem.REPHRASE);
        if (rephrasedSentence) setRephrasedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Rephrase this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${!script}`

        try {
            const rephraseRes = await rephraseSentence(prompt + context, apiKey, model);

            if (typeof rephraseRes === 'number') {
                if (rephraseRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const rephrasedNew = rephraseRes?.choices[0].message.content ?? '';
                setRephrasedSentence(rephrasedNew);
            }
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const handleSentenceExpand = async (selectedText: string) => {
        if (!project || !script) return;

        setSelectedMenuItem(MenuItem.EXPAND);
        if (extendedSentence) setExtendedSentence('');
        setHighlightedText(selectedText);

        const prompt = `Continue on writing from this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${!script}`

        try {
            const extendedRes = await extendSentence(prompt + context, apiKey, model);

            if (typeof extendedRes === 'number') {
                if (extendedRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const extendedNew = extendedRes?.choices[0].message.content ?? '';
                setExtendedSentence(extendedNew);
            }
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const handleSentenceCritique = async (selectedText: string) => {
        if (!project || !script) return;

        setSelectedMenuItem(MenuItem.CRITIQUE_SENTENCE);
        if (sentenceCritique) setSentenceCritique('');
        setHighlightedText(selectedText);

        const prompt = `Critique this sentence: ${selectedText}`
        const context = `\nThis is the context/story beat for the sentence: ${!script}`

        try {
            const critiqueRes = await critiqueSentence(prompt + context, apiKey, model);

            if (typeof critiqueRes === 'number') {
                if (critiqueRes === 401) dispatch(showDialogError(true));
            } else {
                dispatch(showDialogError(false));
                const critiqueNew = critiqueRes?.choices[0].message.content ?? '';
                setSentenceCritique(critiqueNew);
            }
        } catch (err) {
            console.error("Refinement Error rephrasing sentence:", err);
        }
    }

    const addSentenceToStepText = (extend: boolean = false) => {
        if (!project || !script || !highlightedText) return;

        const newSentence = extend ? extendedSentence : rephrasedSentence;
        const newText = script.screenplay.replace(highlightedText, newSentence);

        const updatedScript: Script = {
            ...script,
            screenplay: newText,
            versions: script.versions.map((version) => {
                const updateStage = (stage: MenuCardStage) => stage != MenuCardStage.UNINITIALIZED ? MenuCardStage.NEEDS_UPDATE : stage;
                return version.id === script?.versions[currentVersionIndex].id
                    ? {
                        ...version,
                        screenplay: newText,
                        critiqueStage: updateStage(version.critiqueStage),
                        analysisStage: updateStage(version.analysisStage),
                        consistencyStage: updateStage(version.consistencyStage),
                        whoWroteWhatStage: updateStage(version.whoWroteWhatStage),
                    }
                    : version
            })
        }

        setScript(updatedScript);

        const updatedProject: Project = {
            ...project,
            script: updatedScript
        };

        dispatch(updateProject(updatedProject))
    }

    // const handleReplaceInconsistentText = (incIndex: number) => {
    //     if (!project || !script) return;
    //
    //     if (!!script?.consistency && script.consistency.length > 0) {
    //         const inconsistentText = script?.consistency[incIndex].text;
    //         const revisedText = script?.consistency[incIndex].revisedText;
    //         const newText = script.screenplay.replace(inconsistentText, revisedText);
    //
    //         const updatedScript: Script = {
    //             ...script,
    //             screenplay: newText,
    //             versions: script.versions.map((version) =>
    //                 version.id === script?.versions[currentVersionIndex].id
    //                     ? {...version, text: newText}
    //                     : version
    //             )
    //         }
    //
    //         setScript(updatedScript);
    //
    //         const updatedProject: Project = {
    //             ...project,
    //             script: updatedScript
    //         };
    //
    //         dispatch(updateProject(updatedProject))
    //     }
    // }

    return (<Box sx={{display: 'flex', flexDirection: 'row', height: 'calc(100vh - 192px)', width: '100%'}}>{
        (!script?.screenplay || loading)
            ? <ExportSkeleton/>

            : <Box sx={{display: 'flex', flexDirection: 'row', height: '100%'}}>
            {/*: <Box sx={{display: 'flex', flexDirection: 'row', height: 'calc(100vh - 192px)', width: '100%'}}>*/}
                <ScriptTextField text={currentText}
                                 versions={script?.versions ?? []}
                                 ref={textFieldContainerRef}
                                 currentVersionIndex={currentVersionIndex}
                                 setCurrentVersionIndex={setCurrentVersionIndex}
                                 update={() => handleUpdate()}

                />
                {/*<ScriptEditor text={project?.script.screenplay} />*/}

                <Box sx={{flex: 4, mt: 3, width: '600px', height: '100%'}}>
                    <CompletionMenu project={project}
                                    selectedVersion={script?.versions[currentVersionIndex]}
                                    handleRewriteScreenplay={handleRewriteScreenplay}
                                    handleShowTreatment={handleShowTreatment}
                                    contextMenuRef={contextMenuRef}
                                    menuSecondTitle={menuSecondTitle}
                                    selectedMenuItem={selectedMenuItem}
                                    onCritique={handleCritique}
                                    onAnalyse={handleAnalyse}
                                    onConsistencyCheck={handleCheckConsistency}
                    />
                    <Box style={{
                        // flex: 5,
                        marginTop: 10,
                        // overflowY: 'auto',
                        // height: '100%',
                        width: '532px',
                    }}>
                        <CompletionMenuCards project={project}
                                             script={script}
                                             currentVersionIndex={currentVersionIndex}
                                             selectedMenuItem={selectedMenuItem}
                                             menuWidth={menuWidth}
                                             rephrasedSentence={rephrasedSentence}
                                             extendedSentence={extendedSentence}
                                             sentenceCritique={sentenceCritique}
                                             onAddSentence={addSentenceToStepText}
                            // onClickConsistencyCheck={(index) => handleReplaceInconsistentText(index)}
                        />
                    </Box>
                </Box>

                <FloatingContextMenu textFieldRef={textFieldContainerRef}
                                     onRephrase={(text) => handleSentenceRephrase(text)}
                                     onExpand={(text) => handleSentenceExpand(text)}
                                     onCritique={(text) => handleSentenceCritique(text)}
                />

                <TreatmentDialog open={showTreatment}
                                 onClose={handleShowTreatment}
                                 onRewrite={fetchTreatment}
                                 treatment={script?.versions[currentVersionIndex].treatment}
                />
            </Box>
    }</Box>)
}

export default Export;