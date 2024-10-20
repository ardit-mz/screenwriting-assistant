import Box from "@mui/material/Box";
import PaginationVersions from "../version/PaginationVersions.tsx";
import Typography from "@mui/material/Typography";
import {Button, TextField, Tooltip} from "@mui/material";
import {SwaColor} from "../../enum/SwaColor.ts";
import React, {useEffect, useState} from "react";
import {Project} from "../../types/Project";
import {selectCurrentProject, updateProject} from "../../features/project/ProjectSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {Script, ScriptVersion} from "../../types/Script";
import {MenuCardStage} from "../../enum/MenuCardStage.ts";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ScriptTextFieldProps {
    text: string;
    versions: ScriptVersion[];
    style?: React.CSSProperties;
    currentVersionIndex: number;
    setCurrentVersionIndex: React.Dispatch<React.SetStateAction<number>>;
    update?: () => void;
}


const ScriptTextField = React.forwardRef<HTMLDivElement, ScriptTextFieldProps>(
    ({text, versions, style, currentVersionIndex, setCurrentVersionIndex, update,}, ref) => {
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
                const newText = versions[currentVersionIndex].screenplay;
                setCurrentText(newText);
                setCharCount(newText.length);
                setWordCount(newText.trim().split(/\s+/).filter(Boolean).length);
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
                versions: project.script.versions.map((version) => {
                    const updateStage = (stage: MenuCardStage) => (textChanged && stage != MenuCardStage.UNINITIALIZED)
                        ? MenuCardStage.NEEDS_UPDATE : stage;
                    return version.id === project.script?.versions[currentVersionIndex].id
                        ? {
                            ...version,
                            screenplay: currentText,
                            critiqueStage: updateStage(version.critiqueStage),
                            analysisStage: updateStage(version.analysisStage),
                            consistencyStage: updateStage(version.consistencyStage),
                            whoWroteWhatStage: updateStage(version.whoWroteWhatStage),
                        }
                        : version
                })
            }

            const updatedProject: Project = {
                ...project,
                script: updatedScript,
            };

            dispatch(updateProject(updatedProject))
        }

        const handleVersionChange = (versionIndex: number) => {
            setCurrentVersionIndex(versionIndex);

            if (project && project?.script) {
                const updatedProject: Project = {
                    ...project,
                    script: {...project?.script, selectedVersion: versionIndex}
                };
                dispatch(updateProject(updatedProject))
            }
        }

        return (
            <Box sx={{
                overflowY: 'auto',
                marginRight: 2,
                height: '100%',
                // '&::-webkit-scrollbar': {display: 'none'},
                ...style
            }}>
                <Box
                    sx={{display: 'flex', flexDirection: 'row', justifyContent: (versions.length > 1 || !!project?.script?.needsUpdate) ? "space-between" : "end", alignItems: "center"}}>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        {
                            project?.script?.needsUpdate && <Tooltip title={"Story beats changed. Update needed"} placement="top" arrow>
                                <Button onClick={update} size="small" variant="outlined" sx={{mb: 1}}>Update</Button>
                            </Tooltip>
                        }

                        {
                            versions && versions.length > 1 &&
                            <PaginationVersions totalPages={versions.length}
                                                onChange={(newPageIndex) => handleVersionChange(newPageIndex - 1)}
                                                currentVersion={currentVersionIndex + 1}/>
                        }
                    </Box>

                    <Typography sx={{mt: '4px'}} variant="body2" color="textSecondary" align="right">
                        {`Words: ${wordCount} | Characters: ${charCount}`}
                    </Typography>
                </Box>

                <Box sx={{
                    height: "96%",
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' },
                    position: 'relative'
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
                    <Box sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                    }}>
                        <Tooltip title={"Highlight a sentence to see more options"} placement="left" arrow>
                            <IconButton sx={{p:0}}><InfoOutlinedIcon sx={{height: 18}} /></IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        )
    }
)

export default ScriptTextField;