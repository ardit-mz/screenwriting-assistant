import React from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {SwaColor} from "../../enum/SwaColor.ts";

interface PaginationVersionsProps {
    totalPages: number;
    currentVersion: number;
    onChange: (versionNumber: number) => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}

const PaginationVersions: React.FC<PaginationVersionsProps> = ({ totalPages, currentVersion, onChange, disabled, style }) => {
    const handleVersionChange = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent> , value: number) => {
        if (value >= 1 && value <= totalPages) {
            onChange(value);
        }
    };

    return (
        <Box display="flex" alignItems="center" style={style}>
            <IconButton onClick={(e) => handleVersionChange(e, currentVersion - 1)}
                        disabled={currentVersion === 1 || disabled}
                        sx={{height: 16, width: 16}} >
                <ArrowBackIosNewIcon sx={{ height: 14, width: 14, color: currentVersion === 1 ? "inherit" : SwaColor.primaryLighter2 }} />
            </IconButton>

            <Typography sx={{mr:1, ml: 1}} color={SwaColor.primaryLighter2}>
                {`${currentVersion}/${totalPages}`}
            </Typography>

            <IconButton onClick={(e) => handleVersionChange(e, currentVersion + 1)}
                        disabled={currentVersion === totalPages || disabled}
                        sx={{height: 16, width: 16}} >
                <ArrowForwardIosIcon sx={{ height: 14, width: 14, color: currentVersion === totalPages ? "inherit" : SwaColor.primaryLighter2 }} />
            </IconButton>
        </Box>
    );
};

export default PaginationVersions;