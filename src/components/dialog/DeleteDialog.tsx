// components/dialog/DeleteDialog.tsx

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectName: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onConfirm, projectName }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={"sm"}>
            <DialogTitle>{"Delete Project"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to remove the project "{projectName}"?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} >
                    No
                </Button>
                <Button onClick={onConfirm} autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;
