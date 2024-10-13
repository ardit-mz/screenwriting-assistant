import React from 'react';
import List from '@mui/material/List';
import DrawerItem from './SDrawerItem.tsx'
import {Project} from "../../types/Project";
import SDrawerItemAdd from "./SDrawerItemAdd.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentProject, setRoute} from "../../features/project/ProjectSlice.ts";
import SDrawerItemConfig from "./SDrawerItemConfig.tsx";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Box from "@mui/material/Box";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import {AppDispatch} from "../../store.ts";

interface DrawerItemsProps {
    open: boolean;
    items: Project[]
}

const DrawerItems: React.FC<DrawerItemsProps> = ({open, items}) => {
    const currentProject = useSelector(selectCurrentProject);
    const dispatch = useDispatch<AppDispatch>();

    return (
        <Box 
            sx={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'space-between'}}
        >
            <List sx={{flexGrow: 1, marginTop: 17}}>
                <SDrawerItemConfig open={open}/>
                <SDrawerItemAdd open={open}/>
                {items.map((item) => (
                    <DrawerItem key={item.id}
                                id={item.id}
                                text={item.name}
                                open={open}
                                selected={!!currentProject && currentProject.id === item.id}/>
                ))}
            </List>

            <List>
                <ListItem disablePadding sx={{display: 'block'}}>
                    <ListItemButton
                        onClick={() => dispatch(setRoute(ProjectStage.ABOUT))}
                        sx={{minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5}}>
                        <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center'}}>
                            <InfoOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary={'About'} sx={{opacity: open ? 1 : 0}}/>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
}

export default DrawerItems;
