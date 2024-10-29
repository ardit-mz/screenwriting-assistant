import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {Button} from "@mui/material";
import React from "react";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

interface FeedbackDialog {
    open: boolean;
    onClose: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialog> = ({open, onClose}) => {

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            maxWidth="xl" fullWidth
        >
            <DialogTitle id="scroll-dialog-title" sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems:"center"}}>
                wr-AI-ter: Improving the Sense of Ownership of AI-Generated Content (2024)
                <DialogActions>
                    <Button title='Close' onClick={onClose}><CloseOutlinedIcon/></Button>
                </DialogActions>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                <iframe
                    src="https://kilab-hff.limesurvey.net/555355"
                    width="100%"
                    height="100%"
                    style={{border: "none"}}
                    title="Wr-AI-ter Survey"
                />
            </DialogContent>

        </Dialog>
    )
}

export default FeedbackDialog;