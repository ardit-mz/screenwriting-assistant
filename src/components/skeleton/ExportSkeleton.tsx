import Box from "@mui/material/Box";
import {Skeleton} from "@mui/material";

const ExportSkeleton = () => {
    const NUM_LINES = 28;

    return (
        <Box sx={{display: 'flex', flexDirection: 'row', height: 'calc(100vh - 192px)', width: '100%'}}>
            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                <Box sx={{ width: '100%', overflowY: 'auto', flex: 3, mr: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Box sx={{mt: 4}} width={550}>
                        {[...new Array(NUM_LINES)].map((index) => <Skeleton key={index} variant="text" sx={{fontSize: '16px'}}/>)}
                    </Box>
                </Box>
                <Box sx={{flex:2, width: '100%', mt: 4, ml: 4}}>
                    <Skeleton key={"ajksdhawiuezaioudhaiuwdh"} variant="rectangular" width={500} height={280}/>
                </Box>
            </Box>
        </Box>
    )
}

export default ExportSkeleton;