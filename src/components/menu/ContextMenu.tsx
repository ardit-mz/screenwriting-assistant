import {ButtonBase, Card, CardContent, Collapse, MenuList, Typography} from "@mui/material";
import React, {ReactElement, ReactNode, useState} from "react";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import { ContextMenuItemProps } from "./ContextMenuItem.tsx";

interface ContextMenuProps {
    children?: ReactElement<ContextMenuItemProps>[];
    secondTitle?: string;
    style?: React.CSSProperties;
}

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
    ({ children, secondTitle, style }, ref) => {
        const [expanded, setExpanded] = useState(false);
        const [selectedItem, setSelectedItem] = useState<string | null>(null);
        const menuTitle = "ASK THE ASSISTANT";

        //TODO show selected item next to cart title

        const handleExpandClick = () => {
            setExpanded(!expanded);
        };

        const handleItemSelect = (itemName: string) => {
            console.log("handleItemSelect", itemName)
            setSelectedItem(itemName);
            // setExpanded(false);
        };

        const isContextMenuItem = (element: ReactNode): element is ReactElement<ContextMenuItemProps> => {
            return React.isValidElement(element) && 'onSelect' in element.props;
        };

        return (
            <Card style={{marginLeft: 32, backgroundColor: 'white', ...style}} ref={ref}>
                <ButtonBase onClick={handleExpandClick}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                width: '100%',
                                textAlign: 'left'
                            }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Typography  sx={{color: 'text.primary'}}>{menuTitle}</Typography>
                        {!!selectedItem && <Typography  sx={{color: 'text.secondary', ml:2}}>{selectedItem}</Typography>}
                        {!!secondTitle && <Typography  sx={{color: 'text.secondary', ml:2}}>{secondTitle}</Typography>}
                    </div>
                    {expanded ? <ExpandLess/> : <ExpandMore/>}
                </ButtonBase>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent sx={{p:0}} style={{paddingBottom: 6 }}>
                        <MenuList sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            width: '100%',
                            paddingBottom: 0
                        }}>
                            {React.Children.map(children, (child) => {
                                if (isContextMenuItem(child)) {
                                    return React.cloneElement(child, {
                                        onSelect: handleItemSelect,
                                    });
                                }
                                return child;
                            })}
                        </MenuList>
                    </CardContent>
                </Collapse>
            </Card>
        )
    }
)

export default ContextMenu;