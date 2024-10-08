import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Accordion, AccordionDetails, AccordionSummary, createTheme, MenuItem, ThemeProvider} from "@mui/material";
import React, {useRef, useState} from "react";
import ShareIcon from "@mui/icons-material/Share";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {ShareMenuItem} from "../../enum/ShareMenuItem.ts";
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import {useSelector} from "react-redux";
import {selectCurrentProject} from "../../features/project/ProjectSlice.ts";
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export interface ShareMenuProps {
    text: string | null;
}

const SUB_ITEMS = [
    {
        icon: <SaveAltIcon />,
        name: ShareMenuItem.SAVE,
        savingName: ShareMenuItem.SAVE.replace('Save', 'Saving'),
    },
    {
        icon: <MailOutlineIcon />,
        name: ShareMenuItem.EMAIL,
        savingName: ShareMenuItem.EMAIL.replace('Send', 'Sending'),
    },
    {
        icon: <PictureAsPdfIcon />,
        name: ShareMenuItem.PDF,
        savingName: ShareMenuItem.PDF.replace('Save', 'Saving'),
    },
    {
        icon: <TextSnippetIcon />,
        name: ShareMenuItem.WORD,
        savingName: ShareMenuItem.WORD.replace('Save', 'Saving'),
    },
    {
        icon: <HistoryEduOutlinedIcon />,
        name: ShareMenuItem.FOUNTAIN,
        savingName: ShareMenuItem.FOUNTAIN.replace('Save', 'Saving'),
    },
]

const ShareMenu: React.FC<ShareMenuProps> = ({text}) => {
    const project = useSelector(selectCurrentProject);
    const menuItemRef = useRef<HTMLLIElement>(null);
    const parsedText = text ? text.replace('```fountain', '').replace('```', '') : null

    const [isCopied, setIsCopied] = useState(false);
    const [isSaving, setIsSaving] =  useState<{ [k: number]: boolean }>({});

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (menuItemRef.current && !menuItemRef.current.contains(event.target as Node)) {
    //             setIsClicked(false);
    //         }
    //     };
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);

    const theme = createTheme({
        components: {
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        width: '100%',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }
                }
            },
            MuiListItemText: {
                styleOverrides: {
                    root: {
                        display: 'inline-flex',
                        marginLeft: '8px',
                        flexGrow: 1,
                    }
                }
            },
            MuiListItemIcon: {
                styleOverrides: {
                    root: {
                        minWidth: 'auto',
                        marginRight: '8px'
                    }
                }
            }
        }
    });

    const handleSubItemClick = (item: ShareMenuItem, index: number) => {
        switch (item) {
            case ShareMenuItem.COPY:
                handleCopy();
                break;
            case ShareMenuItem.SAVE:
                handleSave(index);
                break;
            case ShareMenuItem.EMAIL:
                handleEmail(index);
                break;
            case ShareMenuItem.PDF:
                handlePDF(index);
                break;
            case ShareMenuItem.WORD:
                handleWord(index);
                break;
            case ShareMenuItem.FOUNTAIN:
                handleFountain(index);
                break;
            default: return;
        }
    }

    const handleCopy = () => {
        // if (!text) return;
        if (!parsedText) return;

        navigator.clipboard.writeText(parsedText);

        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 6000); // 6 sec
    }

    const handleSave = (index: number) => {
        // if (!text) return;
        if (!parsedText) return;

        const blob = new Blob([parsedText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.name}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);

        setIsSaving(prevState => ({ ...prevState, [index]: true }));
        setTimeout(() => {
            setIsSaving(prevState => ({ ...prevState, [index]: false }));
        }, 3000); // 3 sec
    }

    const handleEmail = (index: number) => {
        // if (!text) return;
        if (!parsedText) return;

        const subject = "Screenwriting assistant draft";
        const body = encodeURIComponent(`Here is a draft you made using the screenwriting assistant:\n\n${parsedText}`).replace(/%0A/g, '%0D%0A');
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;

        setIsSaving(prevState => ({ ...prevState, [index]: true }));
        setTimeout(() => {
            setIsSaving(prevState => ({ ...prevState, [index]: false }));
        }, 3000); // 3 sec
    }

    const handleFountain = (index: number) => {
        // if (!text || !project?.name) return;
        if (!parsedText || !project?.name) return;

        const blob = new Blob([parsedText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.name}.fountain`;
        a.click();
        window.URL.revokeObjectURL(url);

        setIsSaving(prevState => ({ ...prevState, [index]: true }));
        setTimeout(() => {
            setIsSaving(prevState => ({ ...prevState, [index]: false }));
        }, 3000); // 3 sec
    }

    const handlePDF = (index: number) => {
        // if (!text || !project?.name) return;
        if (!parsedText || !project?.name) return;

        const doc = new jsPDF();

        // title
        doc.setFontSize(18);
        const titleWidth = doc.getStringUnitWidth(project.name) * 12 / doc.internal.scaleFactor;
        const x_title = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
        doc.text(project.name, x_title, 20);

        // text
        doc.setFontSize(12);
        const mlText = 15
        const maxWidth = doc.internal.pageSize.getWidth() - 2 * mlText;
        const lines = doc.splitTextToSize(parsedText, maxWidth);

        // pages
        let y = 40;
        lines.forEach((line: string | string[]) => {
            if (y + 8 > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                y = 8;
            }
            doc.text(line, mlText, y);
            y += 8;
        });

        doc.save(`${project.name}.pdf`);

        setIsSaving(prevState => ({ ...prevState, [index]: true }));
        setTimeout(() => {
            setIsSaving(prevState => ({ ...prevState, [index]: false }));
        }, 3000); // 3 sec
    }

    const handleWord = (index: number) => {
        // if (!text || !project?.name) return;
        if (!parsedText || !project?.name) return;

        const paragraphs: Paragraph[] = [];

        // title
        const title = new Paragraph({
                    children: [
                        new TextRun({
                            text: project.name,
                            bold: true,
                            size: 40,
                        }),
                        new TextRun({
                            break: 2,
                        }),
                    ],
                });
        paragraphs.push(title);

        // text
        const lines = parsedText.split('\n');
        lines.forEach(line => {
                const textParagraph = new Paragraph({
                    children: [
                        new TextRun({
                            text: line,
                            size: 24,
                        }),
                    ],
                });
                paragraphs.push(textParagraph);
            }
        )

        const doc = new Document({
            sections: [
                {
                    children: [
                        ...paragraphs
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });

        setIsSaving(prevState => ({ ...prevState, [index]: true }));
        setTimeout(() => {
            setIsSaving(prevState => ({ ...prevState, [index]: false }));
        }, 3000); // 3 sec
    }

    const renderSubItems = () => {
        return SUB_ITEMS.map(({icon, name, savingName}, index) =>
            <MenuItem key={name} onClick={() => handleSubItemClick(name, index)}>
                <ListItemIcon> {icon} </ListItemIcon>
                <ListItemText primary={isSaving[index] ? savingName : name}
                                     primaryTypographyProps={{ fontWeight: isSaving[index] ? 'bold' : ''}}> {name} </ListItemText>
            </MenuItem>)
    }

    return (
        <ThemeProvider theme={theme}>
            <MenuItem ref={menuItemRef}
            >
                <Accordion
                    elevation={0}
                    disableGutters
                    sx={{
                        backgroundColor: "transparent",
                        width: '100%',
                        px: 0
                    }}
                >
                    <AccordionSummary
                        sx={{
                            padding: 0,
                            minHeight: 0,
                            '& .MuiAccordionSummary-content': {my: 0},
                            '& .MuiAccordionSummary-content.Mui-expanded': {my: 0},
                        }}
                    >
                        <ListItemIcon> <ShareIcon/> </ListItemIcon>
                        <ListItemText> Share </ListItemText>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            pt: 1,
                            pb: 0,
                            margin: 0,
                            marginTop: "6px",
                            width: '100%',
                            px: 0
                        }}
                    >
                        <MenuItem onClick={handleCopy}>
                            <ListItemIcon> <ContentCopyIcon /> </ListItemIcon>
                            <ListItemText primary={isCopied ? "Script copied" : "Copy"}
                                          primaryTypographyProps={{ fontWeight: isCopied ? 'bold' : ''}}/>
                        </MenuItem>
                        {renderSubItems()}
                    </AccordionDetails>
                </Accordion>

            </MenuItem>

        </ThemeProvider>
    )
}

export default ShareMenu;