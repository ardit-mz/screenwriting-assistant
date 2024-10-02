// components/SDrawerItem.tsx

import React, {useState} from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import AddIcon from '@mui/icons-material/Add';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch } from "../../store.ts";
import {Project} from "../../types/Project";
import {addProject, setCurrentProject } from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import { v4 as uuidv4 } from 'uuid';
import ListItemText from "@mui/material/ListItemText";
import AddDialog from "../dialog/AddDialog.tsx";
import {handleBlurBackground, selectBlur} from "../../features/theme/ThemeSlice.ts";


interface DrawerItemProps {
    open: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ open }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleAddProject = () => {
        setDialogOpen(true);
        dispatch(handleBlurBackground(true))
    };

    const handleClose = () => {
        setDialogOpen(false);
        dispatch(handleBlurBackground(false))
    };

    const handleSave = (projectName: string) => {
        const projectId = uuidv4();

        const newProject: Project = {
            id: projectId,
            name: projectName,
            projectStage: ProjectStage.BRAINSTORMING,
            brainstorm: '',
            script: undefined,
            storyBeats: [],
        };

        dispatch(addProject(newProject));
        dispatch(setCurrentProject(projectId))
        setDialogOpen(false);
        dispatch(handleBlurBackground(false))
    };

    return (
        <>
            <ListItem disablePadding sx={{ display: 'block'}}>
            {/*<ListItem disablePadding sx={{ display: 'block', backgroundColor: 'WhiteSmoke'}}>*/}
                <ListItemButton
                    onClick={handleAddProject}
                    sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Create project'} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <AddDialog open={dialogOpen}
                       onClose={handleClose}
                       onSave={handleSave}
            />
        </>
    );
};

export default DrawerItem;
