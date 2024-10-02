import {styled} from "@mui/material/styles";

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'flex-start',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

export default DrawerHeader;