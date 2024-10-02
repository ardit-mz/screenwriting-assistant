// components/AddStepConnectorProps.tsx

import React from 'react';
import Box from "@mui/material/Box";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";

interface AddStepConnectorProps {
    onClick: () => void;
}

const AddStepConnector: React.FC<AddStepConnectorProps> = ({onClick}) => {
    return (
        <Box sx={{display: 'flex', alignItems: 'center', marginTop: 5}}>
            <Box sx={{borderTop: '1px solid #ccc', width: 24}}/>
            <Tooltip title="New story beat" placement={"top"} arrow>
                <IconButton style={{padding: 0}} onClick={onClick} aria-valuetext={"new story beat"}>
                    <AddBoxOutlinedIcon/>
                </IconButton>
            </Tooltip>
            <Box sx={{borderTop: '1px solid #ccc', minWidth: 24}}/>
        </Box>
    );
};

export default AddStepConnector;
