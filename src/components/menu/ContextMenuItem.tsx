import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {createTheme, MenuItem, ThemeProvider} from "@mui/material";
import React, {ReactNode, useRef, useState} from "react";

export interface ContextMenuItemProps {
    icon: ReactNode;
    name: string;
    onClick: () => void;
    onSelect?: () => void;
    active?: boolean;
    showDescription?: boolean;
    description?: string;
    backgroundColor?: string;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
                                                             icon,
                                                             name,
                                                             onClick,
                                                             onSelect,
                                                             active,
                                                             showDescription,
                                                             description,
                                                             backgroundColor,
                                                         }) => {

    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const menuItemRef = useRef<HTMLLIElement>(null);

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (menuItemRef.current && !menuItemRef.current.contains(event.target as Node)) {
    //             setIsClicked(false);
    //         }
    //     };
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);

    const theme = createTheme({
        components: {
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        width: '100%',
                        backgroundColor: active ? backgroundColor : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        '&:hover': {
                            backgroundColor: backgroundColor ?? '',
                        },
                        '&:focus-visible': {
                            backgroundColor: backgroundColor ?? '',
                        },
                        '&:focus': {
                            backgroundColor: backgroundColor ?? '',
                        },
                    }
                }
            },
            MuiListItemText: {
                styleOverrides: {
                    root: {
                        display: 'inline-flex',
                        marginLeft: '8px',
                        flexGrow: 1,
                    }
                }
            },
            MuiListItemIcon: {
                styleOverrides: {
                    root: {
                        minWidth: 'auto',
                        marginRight: '8px'
                    }
                }
            }
        }
    });

    const handleClick = () => {
        if (onSelect) {
            onSelect();
        }

        setIsClicked(!isClicked);
        onClick();
    }

    return (
        <ThemeProvider theme={theme}>
            <MenuItem ref={menuItemRef}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      onClick={handleClick}
            >
                <ListItemIcon> {icon} </ListItemIcon>
                <ListItemText> {name} </ListItemText>
                {
                    // showDescription && (isHovered || isClicked) &&
                    (showDescription || isHovered) &&
                    <ListItemText sx={{marginLeft: 3, color: '#888', flexGrow: 0}}
                                  primaryTypographyProps={{fontSize: '15px'}}>
                        {description}
                    </ListItemText>
                }
            </MenuItem>
        </ThemeProvider>
    )
}

export default ContextMenuItem;