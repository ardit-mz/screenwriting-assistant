import Box from "@mui/material/Box";
import PaginationVersions from "../version/PaginationVersions.tsx";
import Typography from "@mui/material/Typography";
import {TextField} from "@mui/material";
import {SwaColor} from "../../enum/SwaColor.ts";
import React, {useEffect, useState} from "react";
import {Project} from "../../types/Project";
import {selectCurrentProject, updateProject} from "../../features/project/ProjectSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {Script} from "../../types/Script";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";

interface ScriptTextFieldProps {
    text: string;
    versions: { id: string, text: string }[];
    style?: React.CSSProperties;
    currentVersionIndex: number;
    setCurrentVersionIndex: React.Dispatch<React.SetStateAction<number>>;
}


const ScriptTextField = React.forwardRef<HTMLDivElement, ScriptTextFieldProps>(
    ({text, versions, style, currentVersionIndex, setCurrentVersionIndex}, ref) => {
        const dispatch = useDispatch<AppDispatch>();
        const project = useSelector(selectCurrentProject);

        const [currentText, setCurrentText] = useState<string>(text);
        const [charCount, setCharCount] = useState<number>(0);
        const [wordCount, setWordCount] = useState<number>(0);
        const [textChanged, setTextChanged] = useState<boolean>(false);

        useEffect(() => {
            if (text) {
                setCharCount(text.length);
                setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
            }
        }, []);

        useEffect(() => {
            if (versions[currentVersionIndex]) {
                const newText = versions[currentVersionIndex].text;
                setCurrentText(newText);
                setCharCount(newText.length);
                setWordCount(newText.trim().split(/\s+/).filter(Boolean).length);

                if (!!project && !!project.script) {
                    const updatedScript: Script = {
                        ...project.script,
                        critiqueStage: MenuCardStage.UNINITIALIZED,
                        analysisStage: MenuCardStage.UNINITIALIZED,
                        consistencyStage: MenuCardStage.UNINITIALIZED,
                    };

                    const updatedProject: Project = {
                        ...project,
                        script: updatedScript,
                    };

                    dispatch(updateProject(updatedProject))
                }
            }
        }, [currentVersionIndex, versions]);

        const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newText = event.target.value;
            const hasTextChanged = currentText.replace(/\s+/g, '') !== newText.replace(/\s+/g, '');
            setTextChanged(hasTextChanged);
            setCurrentText(newText);
            setCharCount(newText.length);
            setWordCount(newText.trim().split(/\s+/).filter(Boolean).length);
        };

        const updateScript = () => {
            if (!project || !project.script) return;

            const updatedScript: Script = {
                ...project.script,
                screenplay: currentText,
                versions: project.script.versions.map((version) =>
                    version.id === project?.script?.versions[currentVersionIndex].id
                        ? { ...version, text: currentText }
                        : version
                ),
                critiqueStage: textChanged ? MenuCardStage.NEEDS_UPDATE : project.script.critiqueStage,
                analysisStage: textChanged ? MenuCardStage.NEEDS_UPDATE : project.script.analysisStage,
                consistencyStage: textChanged ? MenuCardStage.NEEDS_UPDATE : project.script.consistencyStage,
                whoWroteWhatStage: textChanged ? MenuCardStage.NEEDS_UPDATE : project.script.whoWroteWhatStage,

            }

            const updatedProject: Project = {
                ...project,
                script: updatedScript,
            };

            dispatch(updateProject(updatedProject))
        }

        return (
            <Box sx={{
                width: '100%',
                overflowY: 'auto',
                flex: 3,
                marginRight: 2,
                // '&::-webkit-scrollbar': {display: 'none'},
                ...style
            }}>
                <Box
                    sx={{display: 'flex', flexDirection: 'row', justifyContent: versions.length > 1 ? "space-between" : "end", alignItems: "center"}}>
                    {versions && versions.length > 1 &&
                        <PaginationVersions totalPages={versions.length}
                                            onChange={(newPageIndex) => setCurrentVersionIndex(newPageIndex - 1)}
                                            currentVersion={currentVersionIndex + 1}/>
                    }
                    <Typography sx={{mt: '4px'}} variant="body2" color="textSecondary" align="right">
                        {`Words: ${wordCount} | Characters: ${charCount}`}
                    </Typography>
                </Box>

                <Box sx={{
                    height: "96%",
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' }
                }}>
                    <TextField ref={ref}
                           fullWidth
                           multiline
                           margin={"normal"}
                           variant={"outlined"}
                           value={currentText}
                           onChange={handleTextChange}
                           onBlur={updateScript}
                           style={{
                               backgroundColor: SwaColor.grey,
                               height: '100%',
                               fontFamily: 'Courier, monospace',
                               whiteSpace: 'pre-wrap',
                               fontSize: 20,
                               textAlign: 'left',
                               border: "undefined",
                               width: '100%',
                               minWidth: 550,
                           }}
                           sx={{
                               mt: 0,
                               mb: 0,
                               '& .MuiFilledInput-root': {
                                   '& fieldset': {
                                       border: 'none',
                                   },
                                   '&:hover fieldset': {
                                       border: 'none',
                                   },
                                   '&.Mui-focused fieldset': {
                                       border: 'none',
                                   }
                               },
                           }}
                           inputProps={{style: {
                               // color: SwaColor.primaryLighter
                                   color: SwaColor.primary
                           }}}/>
                </Box>
            </Box>
        )
    }
)

export default ScriptTextField;