import {StepButton, Tooltip} from "@mui/material";
import React, {type MouseEvent, type TouchEvent} from "react";
import {SwaColor} from "../../enum/SwaColor.ts";

interface SwaStepperButtonProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    trigger?: {
        'aria-controls'?: string
        'aria-describedby'?: string
        'aria-haspopup'?: true
    } & {
        onClick: (event: MouseEvent) => void
        onTouchStart: (event: TouchEvent) => void
    } ;
}

const SwaStepButton: React.FC<SwaStepperButtonProps> = ({title, icon, onClick, disabled, style, trigger}) => {
    return (<Tooltip title={title}
                     placement={"top"}
                     arrow
                     slotProps={{
                         popper: {
                             modifiers: [
                                 {
                                     name: 'offset',
                                     options: {
                                         offset: [0, -7],
                                     },
                                 },
                             ],
                         },
                     }}
                     enterDelay={500}>
            <StepButton icon={icon}
                        onClick={onClick}
                        disabled={disabled}
                        style={{
                            width: 24,
                            height: 24,
                            padding: 0,
                            margin: "0px 0px 0px 10px",
                            color: SwaColor.primaryLighter,
                            ...style
                        }}
                        {...trigger}
            />

        </Tooltip>
    )
}

export default SwaStepButton;