// src/components/CustomStepIcon.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { SwaColor } from '../enum/SwaColor';

interface SwaStepIconProps {
    index: number;
    bgColor?: string;
    active?: boolean;
}

const SwaStepIcon: React.FC<SwaStepIconProps> = ({index, bgColor, active}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 24,
                height: 24,
                // border: '2px solid #A1A1A1',
                borderRadius: '12px',
                backgroundColor: active ? SwaColor.primary : bgColor ?? SwaColor.primaryLighter, //'#F5F5F5',
                color: SwaColor.grey,
                // fontWeight: 'bold',
                fontSize: 14,
            }}
        >
            {index + 1}
        </Box>
    );
};

export default SwaStepIcon;
