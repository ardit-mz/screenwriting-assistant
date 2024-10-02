// components/SDrawerItem.tsx

import React, {useState} from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {useDispatch, useSelector} from "react-redux";
import {deleteProject, selectCurrentProject, setCurrentProject} from "../../features/project/ProjectSlice.ts";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ArticleIcon from '@mui/icons-material/Article';
import {useNavigate} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteDialog from "../dialog/DeleteDialog.tsx";
import {handleBlurBackground, selectBlur} from "../../features/theme/ThemeSlice.ts";

interface DrawerItemProps {
    id: string;
    text: string;
    open: boolean;
    selected: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ id, text, open, selected }) => {
    const dispatch = useDispatch();
    const currentProject = useSelector(selectCurrentProject);
    const navigate = useNavigate();
    const [hover, setHover] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const blur = useSelector(selectBlur); // TODO check if necessary

    const handleClick = () => {
        dispatch(setCurrentProject(id));
        if (currentProject) {
            navigate(currentProject?.projectStage)
        }
    }

    const handleDeleteClick = () => {
        setDialogOpen(true);
        dispatch(handleBlurBackground(true))
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        dispatch(handleBlurBackground(false))
    };

    const handleConfirmDelete = () => {
        setDialogOpen(false);
        dispatch(deleteProject(id))
        dispatch(handleBlurBackground(false))
    };

    return (
        // <ListItem disablePadding sx={{ display: 'block', backgroundColor: selected ? '#dedede' : 'WhiteSmoke', position: 'relative' }}>
        <ListItem disablePadding sx={{ display: 'block', backgroundColor: selected ? '#dedede' : '', position: 'relative' }}>
            <ListItemButton
                onClick={handleClick}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                    }}
                >
                    { selected ? <ArticleIcon/> : <ArticleOutlinedIcon/> }
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                {open && hover && (
                    <IconButton
                        sx={{ position: 'absolute', right: 16 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick();
                        }}
                    >
                        <DeleteForeverOutlinedIcon />
                    </IconButton>
                )}
            </ListItemButton>

            <DeleteDialog open={dialogOpen}
                          onClose={handleDialogClose}
                          onConfirm={handleConfirmDelete}
                          projectName={text}
            />
        </ListItem>
    );
};

export default DrawerItem;
