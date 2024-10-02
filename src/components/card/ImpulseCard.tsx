import {TextField, Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import React from "react";
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import {SwaColor} from "../../enum/SwaColor.ts";
import ImpulseSkeleton from "../skeleton/ImpulseSkeleton.tsx";

interface ImpulseCardProps {
    impulse: string;
    index: number;
    handleAdd: () => void;
    handleRewrite: () => void;
    handleDelete: () => void;
    loading?: boolean;
    style?: React.CSSProperties;
}

const ImpulseCard: React.FC<ImpulseCardProps> = ({impulse, index, handleAdd, handleRewrite, handleDelete, loading, style}) => {
    const impulseBgc = [SwaColor.lightBlue, SwaColor.lighterBlue, SwaColor.lightestBlue]

    return (<>{
        loading ? <ImpulseSkeleton/>
            : <div style={{display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                <TextField fullWidth
                           multiline
                           margin={"normal"}
                           defaultValue={impulse}
                           onChange={() => console.log("on change haskdj")}
                           style={{
                               backgroundColor: index >2 ? SwaColor.lightestBlue : impulseBgc[index],
                               marginTop: 10,
                               marginBottom: 0,
                               minWidth: 300,
                               ...style,
                           }}>
                    {impulse}
                </TextField>

                <div style={{display: "flex", flexDirection: "column", marginTop: 10 }}>
                    <Tooltip title="Rewrite impulse" placement="right" arrow>
                        <IconButton onClick={handleRewrite} size={"small"}><RefreshOutlinedIcon/></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete impulse" placement="right" arrow>
                        <IconButton onClick={handleDelete} size={"small"}><ClearIcon/></IconButton>
                    </Tooltip>
                    <Tooltip title="Use impulse" placement="right" arrow>
                        <IconButton onClick={handleAdd} size={"small"}><DoneIcon/></IconButton>
                    </Tooltip>
                </div>
            </div>
    }</>
    )
}

export default ImpulseCard;