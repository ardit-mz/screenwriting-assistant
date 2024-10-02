// ContextMenuComponent.tsx
/* https://mui.com/material-ui/react-menu/#context-menu */

import React, {useEffect} from 'react';
import {Menu, MenuList, Paper} from '@mui/material';
import {useContextMenu} from "../../context/useContextMenu.tsx";
import RefreshIcon from '@mui/icons-material/Refresh';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import FloatingContextMenuItem from "./FloatingContextMenuItem.tsx";

interface FloatingContextMenuProps {
    textFieldRef: React.RefObject<HTMLElement>;
    onRephrase: (text: string) => void;
    onExpand: (text: string) => void;
    onCritique: (text: string) => void;
}

const FloatingContextMenu: React.FC<FloatingContextMenuProps> = ({ textFieldRef, onRephrase, onExpand, onCritique }) => {
    const { handleMouseUp, handleClose, anchorPosition, selectedText } = useContextMenu();

    useEffect(() => {
        const handleMouseUpEvent = (event: MouseEvent) => {
            handleMouseUp(event, textFieldRef.current);
        };

        const handleMouseDownEvent = () => {
            handleClose();
        };

        const textField = textFieldRef.current;
        if (textField) {
            textField.addEventListener('mouseup', handleMouseUpEvent);
            textField.addEventListener('mousedown', handleMouseDownEvent);
        }

        return () => {
            if (textField) {
                textField.removeEventListener('mouseup', handleMouseUpEvent);
                textField.addEventListener('mousedown', handleMouseDownEvent);
            }
        };
    }, [handleMouseUp, handleClose, textFieldRef]);

    const handleRephrase = () => {
        if (selectedText) {
            onRephrase(selectedText);
        }
    }

    const handleExpand = () => {
        if (selectedText) {
            onExpand(selectedText);
        }
    }

    const handleCritique = () => {
        if (selectedText) {
            onCritique(selectedText);
        }
    }

    return (
        <div onMouseUp={(event) => handleMouseUp(event.nativeEvent, textFieldRef.current)}>
            <Menu
                open={Boolean(anchorPosition)}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition ? { top: anchorPosition.top, left: anchorPosition.left } : undefined}>
            <Paper>
                <MenuList>
                    <FloatingContextMenuItem name={'Rephrase'}
                                             icon={<RefreshIcon />}
                                             onClick={handleRephrase}/>
                    <FloatingContextMenuItem name={'Expand'}
                                             icon={<DriveFileRenameOutlineOutlinedIcon />}
                                             onClick={handleExpand}/>
                    <FloatingContextMenuItem name={'Critique'}
                                             icon={<PriorityHighOutlinedIcon />}
                                             onClick={handleCritique}/>
                </MenuList>
            </Paper>
            </Menu>
        </div>
    );
};

export default FloatingContextMenu;
