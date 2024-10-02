// components/dialog/AddDialog.tsx

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface AddDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (projectName: string) => void;
}

const AddDialog: React.FC<AddDialogProps> = ({ open, onClose, onSave }) => {
    const [projectName, setProjectName] = useState('');

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSave();
        }
    };

    const handleSave = () => {
        if (projectName.trim()) {
            onSave(projectName.trim());
        }
        setProjectName('');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={'sm'}>
            <DialogTitle>Add Project</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for the new project.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Project Name"
                    fullWidth
                    variant="outlined"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{marginTop: 20}}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} >
                    Cancel
                </Button>
                <Button onClick={handleSave} autoFocus>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddDialog;
