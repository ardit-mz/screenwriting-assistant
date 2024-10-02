import React, {useRef, useState} from "react";
import {Button, Tooltip} from "@mui/material";
import * as mammoth from "mammoth";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentProject, updateProject} from "../../features/project/ProjectSlice.ts";

const UploadWriting = () => {
    const project = useSelector(selectCurrentProject);
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fileName, setFileName] = useState<string>("");

    const uploadButtonTitle = project?.uploadedText && fileName ? `Uploaded: ${fileName}` : 'Upload your writing';
    const uploadButtonTooltip = 'It should be no longer then about one or two pages';

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        if (file.type === "text/plain") {
            reader.onload = (e) => {
                const text = e.target?.result as string;
                dispatchUpload(text);
            };
            reader.readAsText(file);
        } else if (file.name.endsWith(".docx")) {
            reader.onload = (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                handleDocxFile(arrayBuffer);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const dispatchUpload = (text: string) => {
        if (!project) return;

        dispatch(updateProject({
            ...project,
            uploadedText: text
        }));
    };

    const handleDocxFile = async (arrayBuffer: ArrayBuffer) => {
        try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            dispatchUpload(result.value);
        } catch (err) {
            console.error("UploadWriting Error processing .docx file:", err);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".txt,.docx"
                onChange={handleFileUpload}
            />
            <Tooltip title={uploadButtonTooltip} placement={'bottom'} arrow>
                <Button onClick={triggerFileInput}
                        variant={project?.uploadedText && fileName ? "contained" : "outlined"}
                        color={project?.uploadedText && fileName ? "secondary" : "primary"}
                        style={{marginLeft: 10}}>
                    {uploadButtonTitle}
                </Button>
            </Tooltip>
        </>
    );
}

export default UploadWriting;