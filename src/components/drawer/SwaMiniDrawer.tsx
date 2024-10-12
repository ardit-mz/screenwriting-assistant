import React, {useEffect} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AppBar from './SAppBar.tsx';
import SDrawer from './SDrawer.tsx';
import DrawerItems from './SDrawerItems.tsx';
import SwaStepper from "../stepper/SwaStepper.tsx";
import Export from "../../views/Export.tsx";
import Refinement from "../../views/Refinement.tsx";
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Structure from "../../views/Structure.tsx";
import {ScreenNames} from "../../enum/ScreenNames.ts";
import {useSelector} from "react-redux";
import {selectCurrentProject, selectProjects} from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import {createTheme, ThemeProvider} from "@mui/material";
import { selectBlur, selectMode} from "../../features/theme/ThemeSlice.ts";
import RightDrawerItems from "./RightDrawerItems.tsx";
import ButtonsHeader from "../button/ButtonsHeader.tsx";
import ButtonsHeaderSkeleton from "../skeleton/ButtonsHeaderSkeleton.tsx";
import {SwaColor} from "../../enum/SwaColor.ts";
import {selectOpenRight} from "../../features/drawer/DrawerSlice.ts";
import About from "../../views/About.tsx";
import Brainstorming from "../../views/Brainstorming.tsx";

const MiniDrawer: React.FC = () => {
    const location = useLocation();
    const projects = useSelector(selectProjects)
    const project = useSelector(selectCurrentProject);
    const mode = useSelector(selectMode)
    const blur = useSelector(selectBlur);
    const isOpenRight = useSelector(selectOpenRight);
    const navigate = useNavigate();
    const tmpTitle = 'wr-AI-ter';

    const [open, setOpen] = React.useState(false);
    const [openRight, setOpenRight] = React.useState(false);
    const [activeStep, setActiveStep] = React.useState(0);
    const [completed] = React.useState<{ [k: number]: boolean }>({});

    const theme = createTheme({
        palette: {
            mode: mode ? 'dark' : 'light',
            ...(!mode
                    ? {
                        primary: {
                            main: '#1e1e1e',
                            light: '#5e5e5e',
                            dark: '#0a0a0a',
                            contrastText: '#ffffff',
                        },
                        secondary: {
                            main: '#5e5e5e',
                            light: '#a1a1a1',
                            dark: '#333333',
                            contrastText: '#ffffff',
                        },
                        background: {
                            default: '#f5f5f5',
                            paper: '#f5f5f5',
                        },
                        text: {
                            primary: '#1e1e1e',
                            secondary: '#5e5e5e',
                            disabled: '#a1a1a1'

                        },
                    }
                    : {
                        primary: {
                            main: '#e0e0e0',
                            light: '#f5f5f5',
                            dark: '#bdbdbd',
                            contrastText: '#0a0a0a',
                        },
                        secondary: {
                            main: '#a1a1a1',
                            light: '#cccccc',
                            dark: '#5e5e5e',
                            contrastText: '#0a0a0a',
                        },
                        background: {
                            default: '#1e1e1e',
                            paper: '#1e1e1e',
                        },
                        text: {
                            primary: '#f5f5f5',
                            secondary: '#a1a1a1',
                            disabled: '#a1a1a1',
                        },
                    }
            )
        },
        components: {
            MuiStepper: {
                styleOverrides: {
                    root: {
                        // marginLeft: 80,
                        //marginRight: 80,
                        width: '100%',
                        padding: '24px'
                    }
                }
            },
            MuiStepIcon: {
                styleOverrides: {
                    root: {
                        //minWidth: 400,
                        marginRight: 10,
                        '&.Mui-active': {
                            // color: 'black',
                            outline: 'none'
                        }
                    }
                }
            },
            MuiStepButton: {
                styleOverrides: {
                    root: {
                        // width: 40,
                        borderRadius: 20,
                        '&:focus': {
                            outline: 'none',
                            borderColor: 'none'
                        },
                        '&.Mui-disabled .MuiSvgIcon-root': {
                            color: SwaColor.darkGrey,
                        },
                    }
                }
            },
            MuiButtonBase: {
                styleOverrides: {
                    root: {
                        '&:focus': {
                            outline: 'none',
                            borderColor: 'none'
                        },
                    },
                }
            },
            MuiStep: {
                styleOverrides: {
                    root: {
                        // minWidth: 300,
                    },
                }
            },
            MuiStepLabel: {
                styleOverrides: {
                    iconContainer: {
                        padding: 0,
                        //paddingRight: 10
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        fontSize: 'large',
                    }
                }
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode ? '#111111' : 'white',
                        marginBottom: 20,
                        fontSize: 'larger',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                // borderColor: 'black',
                            },
                            '&:hover fieldset': {
                                // borderColor: 'black',
                            },
                            '&.Mui-focused fieldset': {
                                // borderColor: 'black',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#F0F0F0'
                            }
                        },

                    }
                },
            },
            MuiFormLabel: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused': {
                            color: 'grey',
                        },
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        // backgroundColor: '#1e1e1e',
                        // color: '#f5f5f5',
                        outline: 'none',
                        '&:hover': {
                            // backgroundColor: '#4d4d4d', //'#D5D5D5'
                            outline: 'none'
                        },
                        '&.Mui-focused': {
                            // backgroundColor: '#4d4d4d', //'#D5D5D5'
                            outline: 'none'
                        },
                        '&:active': {
                            // backgroundColor: '#4d4d4d', //'#D5D5D5'
                            outline: 'none'
                        },
                        '&.Mui-disabled': {
                            // backgroundColor: '#ff0000',
                            // color: SwaColor.primary,
                        },
                        '&:focus-visible': {
                            outline: 'none'
                        },
                        '&:focus': {
                            outline: 'none',
                        },
                    },
                    startIcon: {
                        // padding: 0,
                        // margin: 0
                    }
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: '#a1a1a1',
                        '&:focus': {
                            outline: 'none',
                        }
                    }
                }
            },
            MuiList: {
                styleOverrides: {
                    root: {
                        padding: 0
                    }
                }
            },
            MuiPopover: {
                styleOverrides: {
                    // root: {
                    //     boxShadow: "",
                    //     outline: "#1E1E1E solid 4px"
                    // },
                    paper: {
                        boxShadow: "none",
                        outline: `${SwaColor.grayBorder} solid 1px`
                    }

                }
            },

        },
    });

    useEffect(() => {
        if (project && location.pathname !== ScreenNames.ABOUT) {
        // if (project) {
            setActiveStep(getIndex(project.projectStage));
            navigate(getPathForStage(project.projectStage));
        }
    }, [project, project?.projectStage, navigate, location.pathname]);

    useEffect(() => {
        if (projects.length === 0) {
            setOpen(true)
        }
    }, [projects]);

    useEffect(() => {
        if (isOpenRight) {
            setOpenRight(true);
        }
    }, [isOpenRight]);

    useEffect(() => {
        if (open && project?.projectStage === ProjectStage.STRUCTURE) {
            setOpen(false)
        }
    }, [project?.projectStage]);

    function getIndex(stage: string) {
        switch (stage) {
            case ProjectStage.BRAINSTORMING:
                return 0;
            case ProjectStage.STRUCTURE:
                return 1;
            case ProjectStage.REFINEMENT:
                return 2;
            case ProjectStage.COMPLETION:
                return 3;
            default:
                return 0
        }
    }

    function getPathForStage(stage: string) {
        switch (stage) {
            case ProjectStage.BRAINSTORMING:
                return ScreenNames.BRAINSTORMING;
            case ProjectStage.STRUCTURE:
                return ScreenNames.STRUCTURE;
            case ProjectStage.REFINEMENT:
                return ScreenNames.REFINEMENT;
            case ProjectStage.COMPLETION:
                return ScreenNames.EXPORT;
            default:
                return ScreenNames.BRAINSTORMING;
        }
    }

    const handleStepChange = (step: number) => {
        if (projects.length === 0) return
        setActiveStep(step);
        switch (step) {
            case 0:
                navigate(ScreenNames.BRAINSTORMING);
                break;
            case 1:
                navigate(ScreenNames.STRUCTURE);
                break;
            case 2:
                navigate(ScreenNames.REFINEMENT);
                break;
            case 3:
                navigate(ScreenNames.EXPORT);
                break;
            default:
                navigate(ScreenNames.BRAINSTORMING);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>

                <AppBar position="fixed"
                        className={blur ? 'blur-background' : ''}
                        style={{minHeight: '142px', justifyContent: 'flex-start'}}>
                    <Toolbar sx={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        width: '100%',
                        paddingBottom: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => setOpen(!open)}
                            edge="start"
                            style={{marginTop: 49}}
                        >
                            {open ? <ViewSidebarIcon transform={'rotate(180)'}/> :
                                <ViewSidebarOutlinedIcon transform={'rotate(180)'}/>}
                        </IconButton>
                        <Box style={{width: '100%', maxWidth: 1000}}>
                            <Typography variant="h6" noWrap component="div"
                                        style={{marginLeft: 10, marginRight: 10, minWidth: 300}}>
                                {project ? project.name : tmpTitle}
                            </Typography>
                            <SwaStepper steps={Object.values(ProjectStage)}
                                        activeStep={activeStep}
                                        setActiveStep={handleStepChange}
                                        completed={completed}/>
                            {project ? <ButtonsHeader/> : <ButtonsHeaderSkeleton/>}
                        </Box>
                        {project?.projectStage === ProjectStage.BRAINSTORMING
                            ? <IconButton color="inherit"
                                          aria-label="open drawer"
                                          onClick={() => setOpenRight(!openRight)}
                                          style={{marginTop: 49}}
                                          edge="end">
                                {openRight ? <ViewSidebarIcon/> : <ViewSidebarOutlinedIcon/>}
                            </IconButton>
                            : <Box sx={{minWidth: 28}}></Box>}
                    </Toolbar>
                </AppBar>

                <SDrawer variant="permanent" open={open}>
                    <div className={blur ? 'blur-background' : ''} style={{height: '100%'}} >
                        <DrawerItems open={open} items={projects}/>
                    </div>
                </SDrawer>

                <Box sx={{flexGrow: 1, p: 3, mt: 10, width: '100%',
                    // height: '100vh',
                    height: 'calc(100vh - 192px)'
                }} className={blur ? 'blur-background' : ''}>
                    <Routes>
                        <Route path="*" element={<Brainstorming />} />
                        <Route path={ScreenNames.ABOUT} element={<About />} />

                        {!!projects && projects.length > 0 ? (
                            <>
                                <Route path={ScreenNames.STRUCTURE} element={<Structure />} />
                                <Route path={ScreenNames.REFINEMENT} element={<Refinement />} />
                                <Route path={ScreenNames.EXPORT} element={<Export />} />
                            </>
                        ) : (
                            <>
                                <Route path={ScreenNames.STRUCTURE} element={<Navigate to="/" />} />
                                <Route path={ScreenNames.REFINEMENT} element={<Navigate to="/" />} />
                                <Route path={ScreenNames.EXPORT} element={<Navigate to="/" />} />
                            </>
                        )}
                    </Routes>
                </Box>

                {project?.projectStage === ProjectStage.BRAINSTORMING &&
                    <SDrawer variant="permanent" open={openRight} anchor={"right"}>
                        <div className={blur ? 'blur-background' : ''} style={{height: '100%'}}>
                            { openRight && <RightDrawerItems/> }
                        </div>
                    </SDrawer>
                }
            </Box>
        </ThemeProvider>
    );
}

export default MiniDrawer;
