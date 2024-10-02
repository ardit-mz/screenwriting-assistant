// components/BrainstormingCard.tsx

import {Button, Card, CardContent} from "@mui/material";
import Typography from "@mui/material/Typography";
import ReplayIcon from "@mui/icons-material/Replay";
import {getRandomQuestion} from "../../data/BrainstormingQuestions.ts";
import {useEffect, useState} from "react";

const BrainstormingCard = () => {
    const [question, setQuestion] = useState<string>()

    useEffect(() => {
        handleNextQuestion()
    }, []);

    const handleNextQuestion = () => {
        setQuestion(getRandomQuestion())
    }

    return (
        <Card variant="outlined" style={{width: '100%', maxWidth: 240, backgroundColor: '#dedede', minHeight: 300, marginBottom: 20}}>
            <CardContent  style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: "space-between",
                height: '100%'
            }}>
                <Typography variant="h6" component="div" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                    Questions that could help you come up with ideas
                </Typography>
                <Typography sx={{ mb: 1.5 , minHeight: 50}} style={{ wordWrap: 'break-word', whiteSpace: 'normal' }} color="text.secondary">
                    {question}
                </Typography>

                <Button onClick={handleNextQuestion} size="small" startIcon={<ReplayIcon/>}>Next question</Button>
            </CardContent>
        </Card>
    );
}

export default BrainstormingCard;