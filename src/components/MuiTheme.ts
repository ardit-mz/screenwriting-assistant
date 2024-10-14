import {createTheme} from "@mui/material";
import {SwaColor} from "../enum/SwaColor.ts";

const palette = {
    primary: {
        main: '#1e1e1e',
        light: '#5e5e5e',
        dark: '#0a0a0a',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#5e5e5e',
        light: '#a1a1a1',
        dark: '#333333',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f5f5f5',
        paper: '#f5f5f5',
    },
    text: {
        primary: '#1e1e1e',
        secondary: '#5e5e5e',
        disabled: '#a1a1a1'
    },
}

const stepper = {
    MuiStepper: {
        styleOverrides: {
            root: {
                // marginLeft: 80,
                //marginRight: 80,
                width: '100%',
                padding: '24px'
            }
        }
    },
    MuiStepIcon: {
        styleOverrides: {
            root: {
                //minWidth: 400,
                marginRight: 10,
                '&.Mui-active': {
                    // color: 'black',
                    outline: 'none'
                }
            }
        }
    },
    MuiStepButton: {
        styleOverrides: {
            root: {
                // width: 40,
                borderRadius: 20,
                '&:focus': {
                    outline: 'none',
                    borderColor: 'none'
                },
                '&.Mui-disabled .MuiSvgIcon-root': {
                    color: SwaColor.darkGrey,
                },
            }
        }
    },
    MuiStep: {
        styleOverrides: {
            root: {
                // minWidth: 300,
            },
        }
    },
    MuiStepLabel: {
        styleOverrides: {
            iconContainer: {
                padding: 0,
                //paddingRight: 10
            }
        }
    },
};

const button = {
    MuiButtonBase: {
        styleOverrides: {
            root: {
                '&:focus': {
                    outline: 'none',
                    borderColor: 'none'
                },
            },
        }
    },
    MuiButton: {
        styleOverrides: {
            root: {
                // backgroundColor: '#1e1e1e',
                // color: '#f5f5f5',
                outline: 'none',
                '&:hover': {
                    // backgroundColor: '#4d4d4d', //'#D5D5D5'
                    outline: 'none'
                },
                '&.Mui-focused': {
                    // backgroundColor: '#4d4d4d', //'#D5D5D5'
                    outline: 'none'
                },
                '&:active': {
                    // backgroundColor: '#4d4d4d', //'#D5D5D5'
                    outline: 'none'
                },
                '&.Mui-disabled': {
                    // backgroundColor: '#ff0000',
                    // color: SwaColor.primary,
                },
                '&:focus-visible': {
                    outline: 'none'
                },
                '&:focus': {
                    outline: 'none',
                },
            },
            startIcon: {
                // padding: 0,
                // margin: 0
            }
        }
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                color: '#a1a1a1',
                '&:focus': {
                    outline: 'none',
                }
            }
        }
    },
}

const input = {
    MuiInputBase: {
        styleOverrides: {
            root: {
                fontSize: 'large',
            }
        }
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                backgroundColor: 'white',
                marginBottom: 20,
                fontSize: 'larger',
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        // borderColor: 'black',
                    },
                    '&:hover fieldset': {
                        // borderColor: 'black',
                    },
                    '&.Mui-focused fieldset': {
                        // borderColor: 'black',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: '#F0F0F0'
                    }
                },

            }
        },
    },
    MuiFormLabel: {
        styleOverrides: {
            root: {
                '&.Mui-focused': {
                    color: 'grey',
                },
            }
        }
    },
}

const list = {
    MuiList: {
        styleOverrides: {
            root: {
                padding: 0
            }
        }
    },
}

const popover = {
    MuiPopover: {
        styleOverrides: {
            // root: {
            //     boxShadow: "",
            //     outline: "#1E1E1E solid 4px"
            // },
            paper: {
                boxShadow: "none",
                outline: `${SwaColor.grayBorder} solid 1px`
            }

        }
    },
}

export const theme = createTheme({
    palette: palette,
    components: {
        ...stepper,
        ...button,
        ...input,
        ...list,
        ...popover,
    },
});