// components/SDrawerItems.tsx

import React from 'react';
import List from '@mui/material/List';
import DrawerItem from './SDrawerItem.tsx'
import {Project} from "../../types/Project";
import SDrawerItemAdd from "./SDrawerItemAdd.tsx";
import {useSelector} from "react-redux";
import {selectCurrentProject} from "../../features/project/ProjectSlice.ts";
import SDrawerItemConfig from "./SDrawerItemConfig.tsx";

interface DrawerItemsProps {
    open: boolean;
    items: Project[]
}

const DrawerItems: React.FC<DrawerItemsProps> = ({open, items}) => {
    const currentProject = useSelector(selectCurrentProject);

    return (
        <List sx={{ marginTop: 17}}>
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
    );
}

export default DrawerItems;
