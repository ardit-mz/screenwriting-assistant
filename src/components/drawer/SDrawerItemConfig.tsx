import React, {useEffect, useState} from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch } from "../../store.ts";
import ListItemText from "@mui/material/ListItemText";
import {handleBlurBackground} from "../../features/theme/ThemeSlice.ts";
import ConfigurationDialog from "../dialog/ConfigurationDialog.tsx";
import SettingsIcon from '@mui/icons-material/Settings';
import {setModel} from "../../features/model/ModelSlice.ts";
import {selectDialogError} from "../../features/drawer/DrawerSlice.ts";

interface DrawerItemProps {
    open: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ open }) => {
    const dispatch = useDispatch<AppDispatch>();
    const showDialogError = useSelector(selectDialogError);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (showDialogError) {
            setDialogOpen(true);
            dispatch(handleBlurBackground(true))
        }
    }, [showDialogError]);

    const handleConfig = () => {
        setDialogOpen(true);
        dispatch(handleBlurBackground(true))
    };

    const handleClose = () => {
        setDialogOpen(false);
        dispatch(handleBlurBackground(false))
    };

    const handleSave = (modelName: string, apiKey: string) => {
        dispatch(setModel({
            modelName: modelName,
            apiKey: apiKey
        }))

        setDialogOpen(false);
    };

    return (
        <>
            <ListItem disablePadding sx={{ display: 'block'}}>
                <ListItemButton
                    onClick={handleConfig}
                    sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary={'Configuration'} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ConfigurationDialog open={dialogOpen}
                       onClose={handleClose}
                       onSave={handleSave}
                        error={showDialogError}
            />
        </>
    );
};

export default DrawerItem;
