// components/dialog/AddDialogAddDialog.tsx

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {FormControl, InputLabel, Link, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {Model} from '../../enum/Models.ts'
import Typography from "@mui/material/Typography";
import {useSelector} from "react-redux";
import {selectApiKey} from "../../features/model/ModelSlice.ts";

interface ConfigurationDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (model: string, apiKey: string) => void;
}

const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({ open, onClose, onSave }) => {
    const aps = useSelector(selectApiKey);
    const [apiKey, setApiKey] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>("GPT_4o");

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSave();
        }
    };

    const handleSelectedModel = (event: SelectChangeEvent) => {
        setSelectedModel(event.target.value as string);
    };

    const handleSave = () => {
        if (selectedModel && apiKey){
            onSave(selectedModel, apiKey);
            onClose();
        }
        setApiKey('')
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={'sm'}>
            <DialogTitle>Configuration</DialogTitle>

            <DialogContent>
                <FormControl fullWidth sx={{marginTop:2}}>
                    <InputLabel id="demo-simple-select-label">Choose Model</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedModel}
                    label="Choose Model"
                    onChange={handleSelectedModel}

                >
                    {Object.keys(Model).map(key =>
                        key && <MenuItem key={key} value={key}>{key}</MenuItem>
                    )}
                </Select>
                </FormControl>
            </DialogContent>

            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="API Key"
                    fullWidth
                    variant="outlined"
                    // value={aps ?? apiKey}
                    defaultValue={aps ?? apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{margin:0}}
                />
                <Typography variant="body2" gutterBottom sx={{whiteSpace: 'normal', margin: '4px 0px 0px 4px'}}>
                    If you do not have an API key you can <Link href="https://platform.openai.com/docs/quickstart/create-and-export-an-api-key" color="inherit">create a key</Link>
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave} autoFocus>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigurationDialog;
