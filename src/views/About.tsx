import React from 'react';
import {Container, Typography, Link, Grid, Box, Divider} from '@mui/material';

const About: React.FC = () => {
    return (
        <Container maxWidth="md" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <Link href="https://kilab.hff-muc.de" target="_blank" rel="noopener noreferrer">
                        {/*<img src="/ki_logo.png" alt="KI Lab Logo" style={{maxWidth: 80}}/>*/}
                        <img src="/screenwriting-assistant/ki_logo.png" alt="KI Lab Logo" style={{maxWidth: 80}}/>
                    </Link>
                </Grid>
                <Grid item xs={6}>
                    <Link href="https://www.hff-muenchen.de" target="_blank" rel="noopener noreferrer">
                        {/*<img src="/hff_logo.png" alt="HFF Logo" style={{maxWidth: 80}}/>*/}
                        <img src="/screenwriting-assistant/hff_logo.png" alt="HFF Logo" style={{maxWidth: 80}}/>
                    </Link>
                </Grid>
            </Grid>

            <Box mt={0} mb={0}>
                <Typography variant="h4" align="center" sx={{mb: 2}}>
                    wr-AI-ter
                </Typography>
                <Typography variant="subtitle1" align="center" gutterBottom>
                    developed within a project for the KI Lab of HFF Munich
                </Typography>
            </Box>

            <Box>
                <Typography variant="body1" align="center">
                    <b>Developer (Website): </b>
                    <Link href="https://github.com/ardit-mz/screenwriting-assistant" target="_blank"
                          rel="noopener noreferrer" underline="hover">
                        Ardit Mazreku
                    </Link>
                </Typography>
                <Typography variant="body1" align="center">
                    <b>Prototype Developer (iOS): </b>
                    <Link href="https://github.com/Think-42/wr-AI-ter" target="_blank" rel="noopener noreferrer"
                          underline="hover">
                        Sebastian Burkhard
                    </Link>
                </Typography>
                <Typography variant="body1" align="center">
                    <b>Study Design: </b>
                    <Link href="https://dl.acm.org/doi/10.1145/3639701.3656325" target="_blank"
                          rel="noopener noreferrer" underline="hover">
                        Christoph Weber
                    </Link>
                </Typography>
            </Box>

            <Box>
                <Divider/>

                <Box mb={2} display="flex" justifyContent="center">
                    <Link href="https://www.hff-muc.de/de_DE/imprint" target="_blank" rel="noopener noreferrer"
                          underline="hover" style={{marginRight: 16}}>
                        Impressum
                    </Link>
                    <Link href="https://www.hff-muenchen.de/de_DE/datenschutzerklaerung" target="_blank"
                          rel="noopener noreferrer" underline="hover">
                        Datenschutz
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default About;
