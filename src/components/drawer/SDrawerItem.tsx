// components/SDrawerItem.tsx

import React, {useEffect, useState} from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {useDispatch, useSelector} from "react-redux";
import {
    deleteProject,
    selectCurrentProject,
    setCurrentProject, updateProject
} from "../../features/project/ProjectSlice.ts";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ArticleIcon from '@mui/icons-material/Article';
import {useNavigate} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteDialog from "../dialog/DeleteDialog.tsx";
import {handleBlurBackground} from "../../features/theme/ThemeSlice.ts";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {TextField, Tooltip} from "@mui/material";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {Project} from "../../types/Project";
import {SwaColor} from "../../enum/SwaColor.ts";
import Box from "@mui/material/Box";

interface DrawerItemProps {
    id: string;
    text: string;
    open: boolean;
    selected: boolean;
}


const DrawerItem: React.FC<DrawerItemProps> = ({id, text, open, selected}) => {
    const dispatch = useDispatch();
    const currentProject = useSelector(selectCurrentProject);
    const navigate = useNavigate();
    const [hover, setHover] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // const blur = useSelector(selectBlur); // TODO check if necessary
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(text);

    useEffect(() => {
        if (!selected) {
            setIsEditing(false);
        }
    }, [selected]);

    const handleClick = () => {
        if (isEditing) return;

        dispatch(setCurrentProject(id));
        if (currentProject) {
            navigate(currentProject?.projectStage)
        }
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        dispatch(handleBlurBackground(true))
    };

    const handleDialogClose = () => {
        setDeleteDialogOpen(false);
        dispatch(handleBlurBackground(false))
    };

    const handleConfirmDelete = () => {
        setDeleteDialogOpen(false);
        dispatch(deleteProject(id))
        dispatch(handleBlurBackground(false))
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!currentProject) return;

        setIsEditing(false);

        const updatedProject: Project = {
            ...currentProject,
            name: newText,
        };

        dispatch(updateProject(updatedProject));
    };

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewText(text);
        setIsEditing(false);
    };

    return (
        <ListItem disablePadding
                  sx={{display: 'block', backgroundColor: selected ? '#dedede' : '', position: 'relative'}}>
            <ListItemButton
                onClick={handleClick}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    pl: 2.5,
                    pr: 0,
                    py: isEditing ? 0 : '',
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center'}}>
                    {selected ? <ArticleIcon/> : <ArticleOutlinedIcon/>}
                </ListItemIcon>

                {selected && isEditing ? (
                    <TextField
                        variant={"standard"}
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        size="small"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        sx={{background: '#dedede', mb: 0}}
                    />
                ) : (
                    <Tooltip title={newText.length > 15 ? newText : ''} placement={"top"} arrow>
                        <ListItemText primary={text} sx={{opacity: open ? 1 : 0, width: hover ? '50%' : ''}}/>
                    </Tooltip>
                )}

                {open && hover && selected && !isEditing && (
                    <Box sx={{backgroundColor: hover ? SwaColor.darkGrey : ''}}>
                        <Tooltip title={'Rename'} placement={"top"} arrow>
                            <IconButton size={"small"}
                                        sx={{'&:hover': {color: SwaColor.primary}}}
                                        onClick={handleEditClick}>
                                <EditOutlinedIcon fontSize={'small'}/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={'Delete'} placement={"top"} arrow>
                            <IconButton size={"small"}
                                        sx={{'&:hover': {color: SwaColor.primary}}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick();
                                        }}
                            >
                                <DeleteForeverOutlinedIcon fontSize={'small'}/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {selected && isEditing && (<Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Tooltip title={'Cancel'} placement={"top"} arrow>
                        <IconButton size={"small"} sx={{'&:hover': {color: SwaColor.primary}}}
                                    onClick={handleCancelClick}>
                            <CloseOutlinedIcon fontSize={'small'}/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={'Save'} placement={"top"} arrow>
                        <IconButton size={"small"} sx={{'&:hover': {color: SwaColor.primary}}}
                                    onClick={handleSaveClick}
                                    autoFocus>
                            <CheckOutlinedIcon fontSize={'small'}/>
                        </IconButton>
                    </Tooltip>
                </Box>)}
            </ListItemButton>

            <DeleteDialog open={deleteDialogOpen}
                          onClose={handleDialogClose}
                          onConfirm={handleConfirmDelete}
                          projectName={text}
            />
        </ListItem>
    );
};

export default DrawerItem;
