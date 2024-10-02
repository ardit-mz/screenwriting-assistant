import { Button } from "@mui/material";
import {SwaColor} from "../../enum/SwaColor.ts";
import React from "react";

interface FillingButtonProps {
    brainstormingText: string;
    onClick: () => void;
}

const FillingButton: React.FC<FillingButtonProps> = ({ brainstormingText, onClick }) => {
    const MAX_LENGTH = 100;
    const TITLE = "Go to the next step";
    // const TITLE = "I am happy with the ideas so far";
    const percentageFilled = brainstormingText.length > 0
        ? Math.min((brainstormingText.length / MAX_LENGTH) * 100, 100)
        : 0

    return (
        <Button
            onClick={onClick}
            variant="contained"
            sx={{
                background: brainstormingText.length === 0
                    ? SwaColor.primaryLighter
                    : `linear-gradient(to right, ${SwaColor.primary} 0%, ${SwaColor.primary} ${percentageFilled - 10}%, ${SwaColor.primaryLighter} ${percentageFilled + 10}%, ${SwaColor.primaryLighter} 100%)`,
                color: SwaColor.white,
                ":hover": {
                    background: brainstormingText.length === 0
                        ? SwaColor.primaryLighter
                        : `linear-gradient(to right, ${SwaColor.primaryLight2} 0%, ${SwaColor.primaryLight} ${percentageFilled - 10}%, ${SwaColor.primaryLighter2} ${percentageFilled + 10}%, ${SwaColor.primaryLighter} 100%)`,
                },
                transition: "background 0.3s ease",
            }}
        >
            {TITLE}
        </Button>
    );
};

export default FillingButton;
