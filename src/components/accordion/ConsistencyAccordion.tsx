import React from "react";
import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Button,
    TextField,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ConsistencyAccordionProps {
    index: number;
    text: string;
    issue: string;
    suggestion: string;
    revisedText: string;
    menuWidth?: string | number;
}



const ConsistencyAccordion: React.FC<ConsistencyAccordionProps> = ({index, text, issue, suggestion, revisedText, menuWidth}) => {

    return (
        <Box sx={{width: menuWidth, ml:4, mt: 2}}>
            <Accordion key={index} sx={{backgroundColor:'white'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography align={"left"}>"{text}"</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography align={"left"} sx={{mb:2}}><Box fontWeight='bold' display='inline'>Issue: </Box>{issue}</Typography>
                    <Typography align={"left"}><Box fontWeight='bold' display='inline'>Suggestion: </Box>{suggestion}</Typography>
                </AccordionDetails>

                <AccordionActions sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <TextField sx={{m:0}} style={{marginLeft:0}} multiline fullWidth value={revisedText} inputProps={{style: {fontSize: 16}}}></TextField>
                    <Button  size="small"
                             onClick={() => {}}>
                        Replace inconsistent sentence with revised sentence
                    </Button>
                </AccordionActions>
            </Accordion>
        </Box>
    )
}

export default ConsistencyAccordion;