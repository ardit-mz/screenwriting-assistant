import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
import {useDispatch, useSelector} from "react-redux";
import {selectProjects, setRoute, updateProjectStage} from "../features/project/ProjectSlice.ts";
import {selectApiKey} from "../features/model/ModelSlice.ts";
import {useEffect} from "react";
import {ProjectStage} from "../enum/ProjectStage.ts";
import {Button} from "@mui/material";
import {setShowAdd, setShowConfig} from "../features/drawer/DrawerSlice.ts";

const InitialPage = () => {
    const projects = useSelector(selectProjects);
    const apiKey = useSelector(selectApiKey);
    const dispatch = useDispatch();

    useEffect(() => {
        if (projects.length > 0 && !!apiKey) {
            dispatch(updateProjectStage(ProjectStage.BRAINSTORMING));
            dispatch(setRoute(ProjectStage.BRAINSTORMING));
        }
    }, [projects, apiKey]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'start', height: 100}}>
            {
                projects.length === 0 &&
                // <Typography variant={'h6'}>Create a new project</Typography>
                <Button onClick={() => dispatch(setShowAdd(true))} variant="text"> Create a new project</Button>
            }

            {
                !apiKey &&
                // <Typography variant={'h6'} sx={{ mt: projects.length === 0 ? 2 : 0 }}>
                //     Add your API key in the configuration
                // </Typography>

                <Button onClick={() => dispatch(setShowConfig(true))} variant="text" sx={{mt: 2}}>Add your API key in the configuration</Button>
            }
        </Box>
    )
}

export default InitialPage;