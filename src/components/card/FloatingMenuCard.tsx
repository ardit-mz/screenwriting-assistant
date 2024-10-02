import React from "react";
import {SwaColor} from "../../enum/SwaColor.ts";
import {Card, CardContent, Skeleton} from "@mui/material";
import Typography from "@mui/material/Typography";

interface FloatingMenuAddCardProps {
    text?: string;
    loading: boolean
}

const FloatingMenuAddCard: React.FC<FloatingMenuAddCardProps> = ({text, loading}) => {
    return (
        <Card sx={{
            backgroundColor: 'white',
            mt: 2, ml: 4, mb: 1,
            border: 'solid ' + SwaColor.lightBlue,
            boxShadow: 'none'
        }}>
            <CardContent sx={{display: 'flex', alignItems: 'center'}}>
                {loading
                    ? <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        marginLeft: 8,
                        marginRight: 8
                    }}>
                        {[...new Array(3)].map(() => <Skeleton variant="text" sx={{fontSize: '16px'}}/>)}
                    </div>
                    : <Typography style={{textAlign: 'left'}}>{text}</Typography>
                }
            </CardContent>
        </Card>
    )
}

export default FloatingMenuAddCard;