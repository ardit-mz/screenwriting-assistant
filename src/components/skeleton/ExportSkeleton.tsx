import Box from "@mui/material/Box";
import {Skeleton} from "@mui/material";

const ExportSkeleton = () => {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100%'}}>
            <Box sx={{ width: '100%', overflowY: 'auto', flex: 3, marginRight: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: "center"}}>
                    <Skeleton variant="rectangular" width={70} height={24}/>
                    <Skeleton variant="rectangular" width={155} height={24}/>
                </Box>
                <Skeleton variant="rectangular" width={690} height={600} sx={{mt: 1}}/>
            </Box>
            <Box sx={{flex:2, width: '100%', mt: 4, ml: 4}}>
                <Skeleton variant="rectangular" width={429} height={56}/>
            </Box>
        </Box>
    )
}

export default ExportSkeleton;