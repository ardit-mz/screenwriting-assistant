import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import {Skeleton} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import RewriteTreatmentButton from "../button/RewriteTreatmentButton.tsx";
import {SwaColor} from "../../enum/SwaColor.ts";
import ShareTreatmentButton from "../button/ShareTreatmentButton.tsx";

interface TreatmentDialogProps {
    open: boolean;
    treatment: string | undefined;
    onRewrite: () => void;
    onClose: () => void;
}

const TreatmentDialog: React.FC<TreatmentDialogProps> = ({open, treatment, onRewrite, onClose}) => {
    const title = "Treatment";
    const descriptionElementRef = useRef<HTMLElement>(null);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    useEffect(() => {
        if (treatment) {
            setLoading(false);
        }
    }, [treatment]);

    const handleRewrite = () => {
        setLoading(true);
        onRewrite()
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle id="scroll-dialog-title" sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems:"center"}}>
                {(treatment && !loading) ? title : <Skeleton key={title} variant="text" width={184} sx={{ fontSize: '36px', mr:10 }} />}
                {(treatment && !loading)
                    ? <DialogActions>
                        <RewriteTreatmentButton onClick={handleRewrite}/>
                        {/*<Button variant="outlined" onClick={onExport}>Export</Button>*/}

                        <ShareTreatmentButton text={treatment}/>

                    </DialogActions>
                    : <DialogActions>
                        <Skeleton key={"btn1"} variant="rectangular" width={192} height={36}/>
                        <Skeleton key={"btn2"} variant="rectangular" width={92} height={36}/>
                    </DialogActions>
                }
            </DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText
                    id="scroll-dialog-description"
                    ref={descriptionElementRef}
                    tabIndex={-1}
                    color={SwaColor.primary}
                >
                    {(treatment && !loading)
                        ? treatment.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))
                        : [...new Array(20)]
                        .map((index) => <Skeleton key={index} variant="text" sx={{ fontSize: '20px' }} />)}
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default TreatmentDialog;