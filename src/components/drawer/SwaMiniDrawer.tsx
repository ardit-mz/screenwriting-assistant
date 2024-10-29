import React, {useEffect, useState} from 'react';
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
import Structure from "../../views/Structure.tsx";
import {useDispatch, useSelector} from "react-redux";
import {
    selectCurrentProject,
    selectProjects,
    selectRoute, setRoute,
    updateProjectStage
} from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import {
    // Fab,
    ThemeProvider} from "@mui/material";
import {handleBlurBackground, selectBlur} from "../../features/theme/ThemeSlice.ts";
import RightDrawerItems from "./RightDrawerItems.tsx";
import ButtonsHeader from "../button/ButtonsHeader.tsx";
import ButtonsHeaderSkeleton from "../skeleton/ButtonsHeaderSkeleton.tsx";
import {selectOpenRight} from "../../features/drawer/DrawerSlice.ts";
import About from "../../views/About.tsx";
import Brainstorming from "../../views/Brainstorming.tsx";
import {AppDispatch} from "../../store.ts";
import {theme} from "../MuiTheme.ts";
import InitialPage from "../../views/InitialPage.tsx";
import FeedbackDialog from "../dialog/FeedbackDialog.tsx";

const MiniDrawer: React.FC = () => {
    const projects = useSelector(selectProjects)
    const project = useSelector(selectCurrentProject);
    const blur = useSelector(selectBlur);
    const isOpenRight = useSelector(selectOpenRight);
    const tmpTitle = 'wr-AI-ter';
    const dispatch = useDispatch<AppDispatch>();
    const route = useSelector(selectRoute);

    const [open, setOpen] = React.useState(false);
    const [openRight, setOpenRight] = React.useState(false);
    const [activeStep, setActiveStep] = React.useState(0);
    const [completed] = React.useState<{ [k: number]: boolean }>({});
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    useEffect(() => {
        if (!!project && (project.projectStage != ProjectStage.ABOUT || project.projectStage != ProjectStage.ABOUT)) {
            if (route === ProjectStage.ABOUT) {
                setActiveStep(4);
            } else if (route === ProjectStage.INITIAL) {
                setActiveStep(5);
            } else {
                setActiveStep(getIndex(project.projectStage));
            }
        } else {
            if (route === ProjectStage.ABOUT) {
                setActiveStep(4);
            } else if (route === ProjectStage.INITIAL) {
                setActiveStep(5);
            }
        }
    }, [project, project?.projectStage, route]);

    useEffect(() => {
        if (projects.length === 0) {
            // setOpen(true);
            dispatch(setRoute(ProjectStage.INITIAL));

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
                return 0;
        }
    }

    const handleStepChange = (step: number) => {
        if (projects.length === 0) return;
        setActiveStep(step);
        switch (step) {
            case 0:
                dispatch(updateProjectStage(ProjectStage.BRAINSTORMING));
                dispatch(setRoute(ProjectStage.BRAINSTORMING));
                break;
            case 1:
                dispatch(updateProjectStage(ProjectStage.STRUCTURE));
                dispatch(setRoute(ProjectStage.STRUCTURE));
                break;
            case 2:
                dispatch(updateProjectStage(ProjectStage.REFINEMENT));
                dispatch(setRoute(ProjectStage.REFINEMENT));
                break;
            case 3:
                dispatch(updateProjectStage(ProjectStage.COMPLETION));
                dispatch(setRoute(ProjectStage.COMPLETION));
                break;
            default:
                dispatch(updateProjectStage(ProjectStage.BRAINSTORMING));
                dispatch(setRoute(ProjectStage.BRAINSTORMING));
        }
    };

    // const handleOpenFeedback = () => {
    //     setShowFeedback(true);
    //     dispatch(handleBlurBackground(true));
    // }

    const handleCloseFeedback = () => {
        setShowFeedback(false);
        dispatch(handleBlurBackground(false));
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{display: 'flex', pb: 0}}>
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
                            <SwaStepper steps={Object.values(ProjectStage).filter(ps => ps != ProjectStage.ABOUT && ps != ProjectStage.INITIAL)}
                                        activeStep={activeStep}
                                        setActiveStep={handleStepChange}
                                        completed={completed}/>
                            {project ? <ButtonsHeader/> : <ButtonsHeaderSkeleton/>}
                        </Box>
                        {(project?.projectStage === ProjectStage.BRAINSTORMING && route === ProjectStage.BRAINSTORMING)
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
                    <div className={blur ? 'blur-background' : ''} style={{height: '100%'}}>
                        <DrawerItems open={open} items={projects}/>
                    </div>
                </SDrawer>

                <Box sx={{
                    flexGrow: 1,
                    // p: 3,
                    mt: '162px',
                    ml: '68px',
                    mr: '0px',
                    // width: '100%',
                    height: 'calc(100vh - 162px)',
                    overflowY: 'auto',
                }} className={blur ? 'blur-background' : ''}>
                    {(() => {
                        switch (route) {
                            case ProjectStage.BRAINSTORMING:
                                return <Brainstorming/>
                            case ProjectStage.STRUCTURE:
                                return <Structure/>
                            case ProjectStage.REFINEMENT:
                                return <Refinement/>
                            case ProjectStage.COMPLETION:
                                return <Export/>
                            case ProjectStage.ABOUT:
                                return <About/>
                            case ProjectStage.INITIAL:
                                return <InitialPage/>
                            default:
                                return <InitialPage/>
                        }
                    })()}
                </Box>

                {project?.projectStage === ProjectStage.BRAINSTORMING && route === ProjectStage.BRAINSTORMING &&
                    <SDrawer variant="permanent" open={openRight} anchor={"right"}>
                        <div className={blur ? 'blur-background' : ''} style={{height: '100%'}}>
                            {openRight && <RightDrawerItems/>}
                        </div>
                    </SDrawer>
                }

                {/*<Fab onClick={handleOpenFeedback}*/}
                {/*     variant="extended"*/}
                {/*     size="small"*/}
                {/*     color="primary"*/}
                {/*     className={blur ? 'blur-background' : ''}*/}
                {/*     sx={{*/}
                {/*         position: 'absolute',*/}
                {/*         right: -30,*/}
                {/*         bottom: '10vh',*/}
                {/*         transform:'rotate(270deg)',*/}
                {/*         borderRadius: '8px',*/}
                {/*         height: '22px',*/}
                {/*         fontSize: 11,*/}
                {/*     }}*/}
                {/*>Feedback</Fab>*/}

                <FeedbackDialog open={showFeedback} onClose={handleCloseFeedback} />
            </Box>
        </ThemeProvider>
    );
}

export default MiniDrawer;
