/* https://mui.com/x/react-date-pickers/lifecycle/#server-interaction */
export function debounce<T extends (...args: unknown[]) => void>(func: T, wait = 500) {
    let timeout: ReturnType<typeof setTimeout>;

    function debounced(...args: Parameters<T>) {
        const later = () => {
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }

    debounced.clear = () => {
        clearTimeout(timeout);
    };

    return debounced;
}
