import Box from "@mui/material/Box";
import PaginationVersions from "../version/PaginationVersions.tsx";
import Typography from "@mui/material/Typography";
import { TextField} from "@mui/material";
import {SwaColor} from "../../enum/SwaColor.ts";
import React, {useEffect, useState} from "react";

interface ScriptTextFieldProps {
    text: string;
    versions: { id: string, text: string }[];
}

const ScriptTextField: React.FC<ScriptTextFieldProps> = ({text, versions}) => {
    const [currentText, setCurrentText] = useState<string>(text);
    const [charCount, setCharCount] = useState<number>(0);
    const [wordCount, setWordCount] = useState<number>(0);
    const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0)

    useEffect(() => {
        if (text) {
            setCharCount(text.length);
            setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
        }
    }, []);

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setCurrentText(newText);
        setCharCount(newText.length);
        setWordCount(newText.trim().split(/\s+/).filter(Boolean).length);
    };

    console.log("ScriptTextField currentText", currentText);

    return (
        <Box sx={{ width: '100%', overflowY: 'auto', flex: 3, marginRight: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: "center"}}>
                {versions && versions.length > 0 &&
                    <PaginationVersions totalPages={versions.length}
                                        onChange={(newPageIndex) => setCurrentVersionIndex(newPageIndex - 1)}
                                        currentVersion={currentVersionIndex}/>
                }
                <Typography sx={{mt: '4px'}} variant="body2" color="textSecondary" align="right">
                    {`Words: ${wordCount} | Characters: ${charCount}`}
                </Typography>
            </Box>

            <TextField fullWidth
                       multiline
                       margin={"normal"}
                       variant={"outlined"}
                       defaultValue={text}
                       onChange={handleTextChange}
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
                       sx={{mt:0, mb:0}}
                       inputProps={{style: { color: SwaColor.primaryLighter }}}/>
        </Box>
    )
}

export default ScriptTextField;