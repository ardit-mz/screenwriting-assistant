import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {MenuItem} from "@mui/material";
import React from "react";
import Divider from "@mui/material/Divider";

interface FloatingContextMenuItemProps {
    onClick : () => void;
    icon: React.ReactNode;
    name: string;
}

const FloatingContextMenuItem: React.FC<FloatingContextMenuItemProps> = ({onClick, icon, name}) => {

    return (
        <MenuItem onClick={onClick}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{name}</ListItemText>
            <Divider/>
        </MenuItem>
    )
}

export default FloatingContextMenuItem;