// AppBar.tsx

import {styled} from '@mui/material/styles';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import {DRAWER_WIDTH} from "../../constants/UI.ts";


interface AppBarProps extends MuiAppBarProps {
    open?: boolean; // open not used
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: 'none',
    flex: 'flexGrow',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: DRAWER_WIDTH,
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

export default AppBar;