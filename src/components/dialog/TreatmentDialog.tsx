import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import {Button, Skeleton} from "@mui/material";
import React, {useRef} from "react";
import RewriteTreatmentButton from "../button/RewriteTreatmentButton.tsx";

interface TreatmentDialogProps {
    open: boolean;
    treatment: string | undefined;
    onRewrite: () => void;
    onExport: () => void;
    onClose: () => void;
}

const TreatmentDialog: React.FC<TreatmentDialogProps> = ({open, treatment, onRewrite, onExport, onClose}) => {
    const title = "Treatment";
    const descriptionElementRef = useRef<HTMLElement>(null);

    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle id="scroll-dialog-title" sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems:"center"}}>
                {treatment ? title : <Skeleton variant="text" width={184} sx={{ fontSize: '36px', mr:10 }} />}
                {treatment
                    ? <DialogActions>
                        <RewriteTreatmentButton onClick={onRewrite}/>
                        <Button variant="outlined" onClick={onExport}>Export</Button>
                    </DialogActions>
                    : <DialogActions>
                        <Skeleton variant="rectangular" width={192} height={36}/>
                        <Skeleton variant="rectangular" width={92} height={36}/>
                    </DialogActions>
                }
            </DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText
                    id="scroll-dialog-description"
                    ref={descriptionElementRef}
                    tabIndex={-1}
                >
                    {treatment ? treatment : [...new Array(20)]
                        .map(() => <Skeleton variant="text" sx={{ fontSize: '20px' }} />)}
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default TreatmentDialog;