// AppBar.tsx

import {styled} from '@mui/material/styles';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: 'none',
    flex: 'flexGrow',
    // transition: theme.transitions.create(['width', 'margin'], {
    //   easing: theme.transitions.easing.sharp,
    //   duration: theme.transitions.duration.leavingScreen,
    // }),
    ...(open && {
        marginLeft: drawerWidth,
        //width: `calc(100% - ${drawerWidth}px)`,
        width: `calc(100% - 68px)`,
        // transition: theme.transitions.create(['width', 'margin'], {
        //   easing: theme.transitions.easing.sharp,
        //   duration: theme.transitions.duration.enteringScreen,
        // }),
    }),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

export default AppBar;