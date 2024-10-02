//https://draftjs.org/

import Box from "@mui/material/Box";
import { Editor, EditorState, RichUtils, ContentState, Modifier, CompositeDecorator } from "draft-js";
import "draft-js/dist/Draft.css";
import PaginationVersions from "../version/PaginationVersions.tsx";
import Typography from "@mui/material/Typography";
import {Button} from "@mui/material";
import {SwaColor} from "../../enum/SwaColor.ts";
import React, {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {selectCurrentProject} from "../../features/project/ProjectSlice.ts";

interface ScriptEditorProps {

}

const ScriptEditor: React.FC<ScriptEditorProps> = ({}) => {
    const project = useSelector(selectCurrentProject);

    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    // () => {
    //     const content = project?.export || "";
    //     return EditorState.createWithContent(createInitialContent(content));
    // });

    const [charCount, setCharCount] = useState<number>(0);
    const [wordCount, setWordCount] = useState<number>(0);


    useEffect(() => {
        if (project?.script.screenplay) {
            const contentState = ContentState.createFromText(project.script.screenplay);
            const newContentState = Modifier.applyInlineStyle(
                contentState,
                contentState.getSelectionAfter(),
                "GREY_TEXT"
            );
            setEditorState(EditorState.createWithContent(newContentState));
        }
    }, [project]);

    const findStyledText = (style: string) => (contentBlock: any, callback: any) => {
        contentBlock.findStyleRanges(
            (char: any) => char.hasStyle(style),
            callback
        );
    };

    // const createInitialContent = (text: string) => {
    //     const contentState = Modifier.insertText(EditorState.createEmpty().getCurrentContent(), EditorState.createEmpty().getSelection(), text);
    //     return Modifier.applyInlineStyle(contentState, EditorState.createEmpty().getSelection(), "GREY_TEXT");
    // };
    //
    // const findGreyText = (contentBlock: any, callback: any, contentState: any) => {
    //     contentBlock.findStyleRanges((char: any) => char.hasStyle("GREY_TEXT"), callback);
    // };
    //
    // const findBlueText = (contentBlock: any, callback: any, contentState: any) => {
    //     contentBlock.findStyleRanges((char: any) => char.hasStyle("BLUE_TEXT"), callback);
    // };
    //
    // const findBlackText = (contentBlock: any, callback: any, contentState: any) => {
    //     contentBlock.findStyleRanges((char: any) => char.hasStyle("BLACK_TEXT"), callback);
    // };

    const decorator = new CompositeDecorator([
        {
            strategy: findStyledText("GREY_TEXT"),
            component: (props: any) => <span style={{ color: "grey" }}>{props.children}</span>,
        },
        {
            strategy: findStyledText("BLUE_TEXT"),
            component: (props: any) => <span style={{ color: "blue" }}>{props.children}</span>,
        },
        {
            strategy: findStyledText("BLACK_TEXT"),
            component: (props: any) => <span style={{ color: "black" }}>{props.children}</span>,
        },
    ]);

    const insertTextAtIndex = (textToInsert: string, index: number, style: string) => {
        if (!project?.script.screenplay) return;

        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();

        const targetSelection = selectionState.merge({
            anchorOffset: index,
            focusOffset: index,
        });

        const newContentState = Modifier.insertText(contentState, targetSelection, textToInsert);
        const newStyledContentState = Modifier.applyInlineStyle(newContentState, targetSelection, style);

        setEditorState(EditorState.push(editorState, newStyledContentState, "insert-characters"));
        updateCounts(newStyledContentState.getPlainText());
    };


    const handleEditorChange = (state: EditorState) => {
        const selection = state.getSelection();

        if (!selection.isCollapsed()) {
            const contentState = Modifier.applyInlineStyle(state.getCurrentContent(), selection, "BLACK_TEXT");
            setEditorState(EditorState.push(state, contentState, "change-inline-style"));
        } else {
            setEditorState(state);
        }

        updateCounts(state.getCurrentContent().getPlainText());
    };

    // const handleUserInput = () => {
    //     if (contentRef.current) {
    //         const currentContent = contentRef.current.textContent ?? "";
    //         const userTypedText = currentContent.replace(initialText, "").replace(buttonText, "");
    //         setUserText(userTypedText);
    //     }
    // };

    // const insertTextAtIndex = (textToInsert: string, index: number) => {
    //     const currentText = contentRef.current?.textContent ?? "";
    //     const newText = currentText.slice(0, index) + textToInsert + currentText.slice(index);
    //     setButtonText(buttonText + textToInsert); // Track inserted text
    //     contentRef.current!.textContent = newText;
    //     updateCounts(newText);
    // };

    const updateCounts = (text: string) => {
        setCharCount(text.length);
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    };

    return (
        <Box sx={{ width: '100%', overflowY: 'auto', flex: 3, marginRight: 2,
            // '&::-webkit-scrollbar': { display: 'none' }
        }}>{ !project?.script.screenplay ? <></>
            : <>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: "center"}}>
                <PaginationVersions totalPages={3}
                                    onChange={() => {
                                    }}
                                    currentVersion={1}/>
                <Typography variant="body2" color="textSecondary" align="right">
                    {`Words: ${wordCount} | Characters: ${charCount}`}
                </Typography>

                <Button
                    onClick={() => insertTextAtIndex(" InsertedText ", 10, "BLUE_TEXT")}
                    sx={{marginTop: 2}}
                >
                    Insert Text
                </Button>
            </Box>

            <Box
            sx={{
            backgroundColor: SwaColor.grey,
            fontFamily: "Courier, monospace",
            whiteSpace: "pre-wrap",
            fontSize: 20,
            textAlign: "left",
            padding: 2,
            minHeight: "200px",
            border: "1px solid #ccc",
        }}
        >
            <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder="Start typing..."
                customStyleMap={{
                    GREY_TEXT: {color: "grey"},
                    BLUE_TEXT: {color: "blue"},
                    BLACK_TEXT: {color: "black"},
                }}
                decorator={decorator}
            />
        </Box>

    {/*<TextField fullWidth*/
    }
    {/*           multiline*/
    }
    {/*           margin={"normal"}*/
    }
    {/*           variant={"outlined"}*/
    }
    {/*           defaultValue={project?.export}*/
    }
    {/*           onChange={handleTextChange}*/
    }
    {/*           style={{*/
    }
    {/*               backgroundColor: SwaColor.grey,*/
    }
    {/*               height: '100%',*/
    }
    {/*               fontFamily: 'Courier, monospace',*/
    }
    {/*               whiteSpace: 'pre-wrap',*/
    }
    {/*               fontSize: 20,*/
    }
    {/*               textAlign: 'left',*/
    }
    {/*               border: "undefined",*/
    }
    {/*               width: '100%',*/
    }
    {/*           }}*/
    }
    {/*           sx={{mt:0, mb:0}}*/
    }
    {/*           inputProps={{style: { color: SwaColor.primaryLighter }}}/>*/
    }

    {/*<Box*/
    }
    {/*    contentEditable*/
    }
    {/*    suppressContentEditableWarning={true}*/
    }
    {/*    onInput={handleUserInput}*/
    }
    {/*    ref={contentRef}*/
    }
    {/*    sx={{*/
    }
    {/*        backgroundColor: SwaColor.grey,*/
    }
    {/*        fontFamily: 'Courier, monospace',*/
    }
    {/*        whiteSpace: 'pre-wrap',*/
    }
    {/*        fontSize: 20,*/
    }
    {/*        textAlign: 'left',*/
    }
    {/*        padding: 2,*/
    }
    {/*        minHeight: '200px',*/
    }
    {/*        border: '1px solid #ccc',*/
    }
    {/*        "& span.initialText": { color: 'grey' },*/
    }
    {/*        "& span.buttonText": { color: 'blue' },*/
    }
    {/*        "& span.userText": { color: 'black' }*/
    }
    {/*    }}*/
    }
    {/*>*/
    }
    {/*    <span className="initialText">{initialText}</span>*/
    }
    {/*    <span className="buttonText">{buttonText}</span>*/
    }
    {/*    <span className="userText">{userText}</span>*/
    }
    {/*</Box>*/
    }
        </>}
        </Box>
    )
}

export default ScriptEditor;