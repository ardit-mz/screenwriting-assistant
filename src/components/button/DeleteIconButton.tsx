import React from "react";
import SwaStepButton from "../stepper/SwaStepButton.tsx";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PopupState, {bindMenu, bindTrigger} from "material-ui-popup-state";
import {Button, Card, CardActions, Popover} from "@mui/material";
import Typography from "@mui/material/Typography";

interface DeleteIconButtonProps {
    onClick: () => void;
    disabled: boolean;
}

const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({onClick, disabled}) => {
    const buttonText = "Are you sure you want to delete this story beat?";

    return (
        <PopupState variant="popover" popupId="demoPopover" disableAutoFocus={null} parentPopupState={null}>
            {(popupState) => (
                <React.Fragment>
                    <SwaStepButton icon={<DeleteOutlinedIcon/>}
                                   title={"Delete story beat"}
                                   onClick={onClick}
                                   style={{justifyContent: 'end'}}
                                   trigger={bindTrigger(popupState)}
                                   disabled={disabled}/>
                    <Popover {...bindMenu(popupState)}
                             anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
                            <Typography sx={{margin: '16px 16px 0px 16px'}}>{ buttonText }</Typography>

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

export default DeleteIconButton;