// components/SwaStepper.tsx

import React from 'react';
import {
    Step,
    StepButton,
    StepLabel,
    Stepper,
} from '@mui/material';
import {useDispatch } from "react-redux";
import { updateProjectStage} from "../../features/project/ProjectSlice.ts";
import {ProjectStage} from "../../enum/ProjectStage.ts";

interface SwaStepperProps {
    steps: string[];
    activeStep: number;
    setActiveStep: (step: number) => void;
    completed: { [k: number]: boolean };
}

const SwaStepper: React.FC<SwaStepperProps> = ({
                                                   steps,
                                                   activeStep,
                                                   setActiveStep,
                                                   // completed,
                                                   // drawerOpen
}) => {
    const dispatch = useDispatch();

    function getStage (i: number) {
        switch (i) {
            case 0: return ProjectStage.BRAINSTORMING;
            case 1: return ProjectStage.STRUCTURE;
            case 2: return ProjectStage.REFINEMENT;
            case 3: return ProjectStage.COMPLETION;
            default: return ProjectStage.BRAINSTORMING;
        }
    }

    const handleStep = (step: number) => () => {
        dispatch(updateProjectStage(getStage(step)))
        setActiveStep(step);
    };

    return (
        <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
                <Step key={label} onClick={handleStep(index)}>
                    <StepButton onClick={handleStep(index)}>
                        {/*{(!drawerOpen || index === activeStep) && */}
                            <StepLabel>
                             {label}
                            </StepLabel>
                        {/*}*/}
                     </StepButton>
                </Step>
            ))}
        </Stepper>
    );
};

export default SwaStepper;
