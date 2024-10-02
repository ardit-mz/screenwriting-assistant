import {Card, CardContent} from "@mui/material";
import React from "react";
import {SwaColor} from "../../enum/SwaColor.ts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

interface EmotionCardProps {
    coreEmotion: string;
    reason: string;
    suggestions: string[];
}

const EmotionCard: React.FC<EmotionCardProps> = ({coreEmotion, reason, suggestions}) => {
    return (
        <Box sx={{mt: 2, marginLeft: 4}}>
            <Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + SwaColor.greenLight, boxShadow: 'none'}}>
                <CardContent sx={{display: "flex", flexDirection: "row", alignItems: "center"}} style={{paddingBottom:8, paddingTop: 8}}>
                    <Typography component='div'>Core Emotion: <Box fontWeight='bold' display='inline'>{coreEmotion}</Box></Typography>
                </CardContent>
            </Card>
            <Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + SwaColor.greenLight, boxShadow: 'none'}}>
                <CardContent>
                    <Typography style={{textAlign: 'left'}}>{reason}</Typography>
                </CardContent>
            </Card>
            <Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + SwaColor.greenLight, boxShadow: 'none'}}>
                <CardContent>
                    <Typography style={{textAlign: 'left'}}>
                        Suggestions for enhancing the emotion:
                    </Typography>
                    <List sx={{ listStyleType: 'disc' }}>
                        { suggestions.map(suggestion =>
                            <ListItem key={suggestion} sx={{display: 'list-item', pl: 0, ml: 2}}>
                                <ListItemText>{suggestion}</ListItemText>
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>
        </Box>
    )
}

export default EmotionCard;