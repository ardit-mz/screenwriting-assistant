import React, { useState } from "react";
import { Editor, EditorState, Modifier, ContentState, CompositeDecorator } from 'draft-js';
import "draft-js/dist/Draft.css";
import { Button, Box, Typography } from "@mui/material";
import PaginationVersions from "../version/PaginationVersions.tsx";
import {SwaColor} from "../../enum/SwaColor.ts";

interface ScriptEditorProps {
    text: string;
}

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

const InsertedText = (props: any) => <span style={{ color: "#1E76CE" }}>{props.children}</span>;
const InitialText = (props: any) => <span style={{ color: SwaColor.primaryLighter }}>{props.children}</span>;

const ScriptEditor: React.FC<ScriptEditorProps> = ({ text }) => {

    const decorator = new CompositeDecorator([
        {
            strategy: (contentBlock, callback) => {
                const text = contentBlock.getText();
                const regex = /\[Inserted Text\]/g;
                let matchArr;
                while ((matchArr = regex.exec(text)) !== null) {
                    callback(matchArr.index, matchArr.index + matchArr[0].length);
                }
            },
            component: InsertedText,
        },
        {
            strategy: (contentBlock, callback) => {
                const text = contentBlock.getText();
                const regex = /^[^[]+/;
                let matchArr;
                while ((matchArr = regex.exec(text)) !== null) {
                    callback(matchArr.index, matchArr.index + matchArr[0].length);
                }
            },
            component: InitialText,
        },
    ]);

    const initialContentState = ContentState.createFromText(text);

    const [editorState, setEditorState] = useState(EditorState.createWithContent(initialContentState, decorator));
    const [charCount, setCharCount] = useState<number>(text.length);
    const [wordCount, setWordCount] = useState<number>( countWords(text) );

    const insertText = (text: string) => {
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const newContentState = Modifier.insertText(contentState, selectionState, text, undefined, 'INSERTED_TEXT');
        setEditorState(EditorState.push(editorState, newContentState, 'insert-characters'));
    };

    const handleEditorChange = (state: EditorState) => {
        setEditorState(state);
        const plainText = state.getCurrentContent().getPlainText();
        setCharCount(plainText.length);
        setWordCount(countWords(plainText));
    }

    const customStyleMap = {
        BLACK: { color: "black" },
        INSERTED_TEXT: { color: "#1E76CE" },
    };

    return (
        <Box sx={{width: "100%", overflowY: "auto", flex: 3, marginRight: 2}}>
            <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <PaginationVersions totalPages={3} onChange={() => {
                }} currentVersion={1}/>
                <Typography variant="body2" color="textSecondary" align="right">
                    {`Words: ${wordCount} | Characters: ${charCount}`}
                </Typography>
                <Button onClick={() => insertText(" [Inserted Text]")}>Insert Text</Button>
            </Box>

            <div style={{minHeight: '200px', padding: '10px'}}>
            <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="Type here..."
                    customStyleMap={customStyleMap}
                    // handleKeyCommand={(command) => {
                    //     if (command === 'bold') {
                    //         const contentState = editorState.getCurrentContent();
                    //         const selectionState = editorState.getSelection();
                    //         const newContentState = Modifier.applyInlineStyle(contentState, selectionState, 'BLACK');
                    //         setEditorState(EditorState.push(editorState, newContentState, 'change-inline-style'));
                    //         return 'handled';
                    //     }
                    //     return 'not-handled';
                    // }}
                />
            </div>
        </Box>
    );
};

export default ScriptEditor;