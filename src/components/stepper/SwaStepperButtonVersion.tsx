import SwaStepButton from "./SwaStepButton.tsx";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import React, {useState} from "react";


interface SwaStepperButtonVersionProps {
    active: boolean
    onClick: () => void;
}

const SwaStepperButtonVersion: React.FC<SwaStepperButtonVersionProps> = ({active, onClick}) => {
    const [isActive, setIsActive] = useState<boolean>(active);

    const handleClick = () => {
        setIsActive(!isActive)
        onClick();
    }

    return (
        <SwaStepButton icon={isActive ? <FiberManualRecordIcon/> : <FiberManualRecordOutlinedIcon/>}
                       title={"Select this version"}
                       onClick={() => handleClick()}
                       iconStyle={{height: 16, width: 16, color: '#d7d7d7', margin: 0, padding: 0}}
        />
    )
}

export default SwaStepperButtonVersion;