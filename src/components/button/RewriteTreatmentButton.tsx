import React from "react";
import PopupState, {bindMenu, bindTrigger} from "material-ui-popup-state";
import {Button, Card, CardActions, Popover} from "@mui/material";
import Typography from "@mui/material/Typography";

interface RewriteTreatmentButtonProps {
    onClick: () => void;
}

const RewriteTreatmentButton: React.FC<RewriteTreatmentButtonProps> = ({onClick}) => {
    const buttonTitle = "Rewrite Treatment";
    const popoverText = "Are you sure you want to rewrite the treatment?";

    return (
        <PopupState variant="popover" popupId="demoPopover" disableAutoFocus={null} parentPopupState={null}>
            {(popupState) => (
                <React.Fragment>
                    <Button variant="outlined" {...bindTrigger(popupState)}>{buttonTitle}</Button>
                    <Popover {...bindMenu(popupState)}
                             anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                             transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                             sx={{ marginTop: -2 }}
                    >
                        <Card sx={{
                            backgroundColor: 'white',
                            width: 300,
                            display:"flex",
                            flexDirection:"column",
                            justifyContent: 'space-between'
                        }}>
                            <Typography sx={{margin: '16px 16px 0px 16px'}}>{ popoverText }</Typography>

                            <CardActions sx={{justifyContent: 'flex-end'}}>
                                <Button onClick={() => popupState.setOpen(false)}>No</Button>
                                <Button onClick={() => onClick()} variant={"outlined"}>Yes</Button>
                            </CardActions>
                        </Card>
                    </Popover>
                </React.Fragment>
            )}
        </PopupState>
    )
}

export default RewriteTreatmentButton;