// useContextMenu.tsx
/*
    Sources:
        - https://javascript.plainenglish.io/medium-like-text-highlighting-in-react-afa35a29a81a
        -
*/

import { useState, useCallback } from 'react';

export const useContextMenu = () => {
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedText, setSelectedText] = useState<string | null>(null);

    const handleMouseUp = useCallback((event: MouseEvent, textFieldRef: HTMLElement | null) => {
        const selection = window.getSelection();
        const selected = selection?.toString();

        // console.log("Selection:", selection);
        // console.log("Selected text:", selected);

        if (selected && selected.length > 0 && !!selection && textFieldRef?.contains(selection.anchorNode)) {
            setSelectedText(selected);
            setAnchorPosition({
                top: event.clientY + window.scrollY + 20,
                left: event.clientX //+ (window.scrollX/2)
            });
        } else {
            // console.log("No valid selection or outside of TextField");
            setAnchorPosition(null);
            setSelectedText(null);
        }
    }, []);

    const handleClose = () => {
        setAnchorPosition(null);
        setSelectedText(null);
    };

    return {
        handleMouseUp,
        handleClose,
        anchorPosition,
        selectedText,
    };
};
