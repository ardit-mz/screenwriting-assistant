import React from "react";
import PopupState, {bindMenu, bindTrigger} from "material-ui-popup-state";
import {Button, Card, CardActions, Popover, Tooltip} from "@mui/material";
import Typography from "@mui/material/Typography";

interface RewriteAllButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

const RewriteAllButton: React.FC<RewriteAllButtonProps> = ({onClick, disabled}) => {
    const buttonText = "Are you sure you want to rewrite all story beats?";
    const buttonTitle = "Rewrite all";
    const rewriteTooltipTitle = "Rewrite all story beats";

    return (
        <PopupState variant="popover" popupId="demoPopover" disableAutoFocus={null} parentPopupState={null}>
            {(popupState) => (
                <React.Fragment>
                    <Tooltip title={rewriteTooltipTitle} placement={'bottom'} arrow>
                        <Button variant="outlined"
                                style={{marginLeft: 10}}
                                color={'primary'}
                                disabled={disabled}
                                {...bindTrigger(popupState)}>
                            { buttonTitle }
                        </Button>
                    </Tooltip>
                    <Popover {...bindMenu(popupState)}
                             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                             transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                             sx={{ marginLeft: 1 }}
                    >
                        <Card sx={{
                            backgroundColor: 'white',
                            width: 300,
                            display:"flex",
                            flexDirection:"column",
                            justifyContent: 'space-between'
                        }}>
                            <Typography sx={{margin: '16px 16px 0px 16px'}}>{ buttonText }</Typography>

                            <CardActions sx={{justifyContent: 'flex-start'}}>
                                <Button onClick={() => { onClick(); popupState.setOpen(false); }} variant={"outlined"}>Yes</Button>
                                <Button onClick={() => popupState.setOpen(false)}>No</Button>
                            </CardActions>
                        </Card>
                    </Popover>
                </React.Fragment>
            )}
        </PopupState>
    )
}

export default RewriteAllButton;