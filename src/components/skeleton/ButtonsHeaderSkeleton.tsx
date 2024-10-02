import {useSelector} from "react-redux";
import {selectCurrentProject} from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";
import Box from "@mui/material/Box";
import {Skeleton} from "@mui/material";

const ButtonsHeaderSkeleton = () => {
    const project = useSelector(selectCurrentProject);

    return (<>{
            !!project && (project.projectStage === ProjectStage.STRUCTURE || project.projectStage === ProjectStage.REFINEMENT || project.projectStage === ProjectStage.COMPLETION) &&
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: project.projectStage === ProjectStage.STRUCTURE ? 'space-between' : 'end',
                padding: '0px 24px'}}>
                {
                    project.projectStage === ProjectStage.STRUCTURE &&
                    <Box sx={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                        <Skeleton variant="rounded" width={129} height={37} style={{marginLeft: 10}}/>
                        <Skeleton variant="rounded" width={134} height={37} style={{marginLeft: 10}}/>
                    </Box>
                }
                {
                    (project.projectStage === ProjectStage.STRUCTURE || project.projectStage === ProjectStage.REFINEMENT) &&
                    <Skeleton variant={"rounded"}  width={67} height={37} style={{marginRight: 10}} />
                }
                {
                    project.projectStage === ProjectStage.COMPLETION &&
                    <Skeleton variant={"rounded"}  width={82} height={37} style={{marginRight: 10}} />
                }
            </Box>
        }</>
    )
}

export default ButtonsHeaderSkeleton;