import React from "react";
import {SwaColor} from "../../enum/SwaColor.ts";
import IconButton from "@mui/material/IconButton";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import {Card, CardContent, Skeleton, Tooltip} from "@mui/material";
import Typography from "@mui/material/Typography";

interface FloatingMenuAddCardProps {
    text?: string;
    onClick?: () => void;
    loading: boolean;
}

const FloatingMenuAddCard: React.FC<FloatingMenuAddCardProps> = ({text, onClick, loading}) => {
    return (
        <Card sx={{
            backgroundColor: 'white',
            mt: 2, ml: 4, mb: 1,
            border: 'solid ' + SwaColor.lightBlue,
            boxShadow: 'none'
        }}>
            <CardContent sx={{display: 'flex', alignItems: 'center', pl: 1}}>

                {loading ? <Skeleton variant="circular" width={24} height={24} sx={{mr: 1, ml: 1}}/>
                    : <Tooltip title={`Add to story beat`} placement="left" arrow>
                        <IconButton sx={{'&:hover': {color: SwaColor.primary}, mr: 1}}
                                    onClick={onClick} aria-valuetext={"new story beat"}>
                            <AddBoxOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                }

                {loading
                    ? <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        marginLeft: 8,
                        marginRight: 8
                    }}>
                        {[...new Array(3)].map((index) => <Skeleton key={index} variant="text" sx={{fontSize: '16px'}}/>)}
                    </div>
                    : <Typography style={{textAlign: 'left'}}>{text}</Typography>
                }
            </CardContent>
        </Card>
    )
}

export default FloatingMenuAddCard;