import {CardContent, TextField, Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import React, {useState} from "react";
import {SwaColor} from "../../enum/SwaColor.ts";

interface AddSuggestionButtonProps {
    onClick: () => void;
}

const AddSuggestionButton: React.FC<AddSuggestionButtonProps> = ({onClick}) => {
    return(
        <Tooltip title="Add suggestion" placement="right">
            <IconButton onClick={onClick} sx={{padding:0, margin: 0}}>
                <AddBoxOutlinedIcon sx={{ '&:hover': {color: SwaColor.primary } }} />
            </IconButton>
        </Tooltip>
    )
}

interface RightDrawerSuggestionCardProps {
    text: string;
    onChange: (text:string) => void;
    onClick: () => void;
}

const RightDrawerSuggestionCard: React.FC<RightDrawerSuggestionCardProps> = ({text, onChange, onClick}) => {
    const [focused, setFocused] = useState(false);

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
        setFocused(false);
        onChange(event.target.value);
    }

    return (
        <CardContent sx={{ padding: '14px 0px 0px 0px' }}>
            <TextField id="outlined-basic"
                       label={<AddSuggestionButton onClick={onClick}/>}
                       defaultValue={text}
                       multiline
                       // onChange={onChange}
                       onFocus={() => setFocused(true)}
                       onBlur={e => handleOnBlur(e)}
                       style={{ backgroundColor: focused ? 'white' : '#f5f5f5',
                                width: '100%',
                                margin: 0
                       }}
            />
        </CardContent>
    )
}

export default RightDrawerSuggestionCard;