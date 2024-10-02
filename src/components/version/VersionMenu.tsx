import SwaStepButton from "../stepper/SwaStepButton.tsx";
import HistoryIcon from "@mui/icons-material/History";
import React, {useState} from "react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";
import {StepButton, Tooltip} from "@mui/material";

interface VersionMenuProps {
    versions: number
    onClick: (index: number) => void;
}

const VersionMenu: React.FC<VersionMenuProps> = ({versions, onClick}) => {
    // const [activeVersions, setActiveVersions] = useState<{ [k: number]: boolean }>({});
    const [activeVersion, setActiveVersion] = useState<number | null>(null); // Track the active version

    const handleClick = (index: number) => {
        setActiveVersion(index);

        onClick(index);
    }

    const iconStyle = {width: 18, height: 18, color: '#bbb' }

    return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: "flex-end"}}>
            {
                Array.from({length: versions}, (_, index: number) =>
                    <Tooltip title={"title"}
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
                        <StepButton icon={activeVersion === index
                                            ? <FiberManualRecordIcon style={iconStyle}/>
                                            : <FiberManualRecordOutlinedIcon style={iconStyle}/>}
                                    onClick={() => handleClick(index)}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        padding: 0,
                                        margin: "0px 0px 0px 0px",
                                        color: '#333'
                                    }}
                        />
                    </Tooltip>
                )
            }

            <SwaStepButton icon={<HistoryIcon/>}
                           title={"History of created story beats"}
                           onClick={() => onClick}
                           style={{margin: 0}}
            />
        </div>
    )
}

export default VersionMenu;