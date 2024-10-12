import React, {useState} from "react";
import {ButtonBase, Card, CardContent, Collapse} from "@mui/material";
import Typography from "@mui/material/Typography";
import {ExpandLess, ExpandMore} from "@mui/icons-material";

interface CollapsableCardProps {
    title: string;
    text: string;
    color?: string;
}

const CollapsableCard: React.FC<CollapsableCardProps> = ({title, text, color}) => {
    const [expanded, setExpanded] = useState(true);

    return (<>
        <ButtonBase onClick={() => setExpanded(!expanded)}
                    sx={{ pr:1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}
        >
            <Typography align={"left"} fontWeight={"bold"} component='div' sx={{mt:2}}>{title}</Typography>
            {expanded ? <ExpandLess/> : <ExpandMore/>}
        </ButtonBase>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + color, boxShadow: 'none'}}>
                <CardContent style={{paddingTop: 8, paddingBottom: 8}}>
                    <Typography style={{textAlign: 'left'}}>{text}</Typography>
                </CardContent>
            </Card>
        </Collapse>
    </>)
}

export default CollapsableCard;