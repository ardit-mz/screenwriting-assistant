import {ButtonBase, Card, CardContent, CardHeader, Collapse} from "@mui/material";
import React, {useState} from "react";
import {SwaColor} from "../../enum/SwaColor.ts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

interface ConsistencyCardProps {
    onClick: () => void;
    index: number;
    text: string;
}

interface ConsistencyCardPartProps {
    title: string;
    text: string;
}

const ConsistencyCardPart: React.FC<ConsistencyCardPartProps> = ({title, text}) => {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return(<>
        <Card variant="outlined" sx={{mt:2, backgroundColor: 'white', border:'#F9FCD7'}}>
            <CardHeader
                title="Collapsible Card Title"
                action={
                    <IconButton onClick={handleExpandClick}>
                        {/*<ExpandMoreIcon style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />*/}
                        {expanded ? <ExpandLess/> : <ExpandMore/>}
                    </IconButton>
                }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <List sx={{ listStyleType: 'disc' }}>
                        <ListItem sx={{ display: 'list-item', pl:0, ml:2 }}>
                            <ListItemText >Flickering Lights: As Elliot gets the invitation, the lights
                                in his apartment flicker, and a cold draft sends the invitation
                                skittering across the floor, heightening his unease.</ListItemText>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', pl:0, ml:2 }}>
                            <ListItemText>Ghostly Glimpses: Through the keyhole, Elliot briefly sees
                                ghostly faces or shadows that disappear when he tries to look directly
                                at them, intensifying his fear.</ListItemText>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', pl:0, ml:2 }}>
                            <ListItemText>Eerie Sounds: As Elliot approaches the door, he hears
                                unsettling laughter and scratching noises from within, creating a sense
                                of foreboding.</ListItemText>
                        </ListItem>
                    </List>
                </CardContent>
            </Collapse>
        </Card>
    </>)
}


const ConsistencyCard: React.FC<ConsistencyCardProps> = ({onClick, index, text}) => {
    return (
        <Box sx={{mt: 2, marginLeft: 4}}>

            <ConsistencyCardPart title={"Strengths"}
                              text={"The mysterious invitation effectively drives Elliot into the story’s core conflict.\n" +
                                  "                        It reveals Elliot's loneliness and desire for something more, aligning with his character arc.\n" +
                                  "                        The description of the vacant apartment creates a fitting sense of foreboding."} />

            <ConsistencyCardPart title={"Areas for Improvement"}
                              text={"Invitation’s Purpose: Clarify the invitation’s connection to Charlie’s backstory or the story’s themes for deeper intrigue.\n" +
                                  "                        Pace and Timing: Ensure Elliot’s reaction to the invitation feels natural and maintains narrative tension.\n" +
                                  "                        Tone Consistency: Balance Elliot’s sarcasm with the growing sense of unease to maintain the story’s tone.\n" +
                                  "                        Foreshadowing: Incorporate subtle hints or symbols in the invitation that foreshadow Charlie’s background or the haunting."} />

            <ConsistencyCardPart title={"Summary for Improvement"}
                              text={"Overall, this beat effectively sets up the supernatural conflict but could benefit from clearer purpose, smoother pacing, balanced tone, and foreshadowing."} />
        </Box>
    )
}

export default ConsistencyCard;