import {ButtonBase, Card, CardContent, Collapse, StepLabel, Tooltip} from "@mui/material";
import SwaStepIcon from "../../icons/SwaStepIcon.tsx";
import React, {useState} from "react";
import {SwaColor} from "../../enum/SwaColor.ts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {Questions} from "../../types/Question";

interface HeaderProps {
    onClick: () => void;
    title: string;
}

const Header: React.FC<HeaderProps> = ({onClick, title}) => {
    const [expand, setExpand] = useState(false);

    const handleExpand = () => {
        setExpand(!expand);
        onClick();
    };

    return (
        <ButtonBase onClick={handleExpand}
                    sx={{
                        pr: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'flex-end'
                    }}>

            <Typography align={"left"} fontWeight={"bold"} component='div' sx={{mt: 2}}>{title}</Typography>
            {expand ? <ExpandLess/> : <ExpandMore/>}
        </ButtonBase>
    )
}

interface RaisedQuestionCardProps {
    onClick: () => void;
    index: number;
    question: string;
    answer: string;
}

const RaisedQuestionCard: React.FC<RaisedQuestionCardProps> = ({onClick, index, question, answer}) => {
    const [hover, setHover] = useState<boolean>(false);

    return (<Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + SwaColor.orangeLight, boxShadow: 'none'}}>
        <CardContent>
            <Typography style={{textAlign: 'left'}}>{question}</Typography>
            <Box sx={{display: 'flex', mt: 1, alignItems: 'flex-start'}}>
                <Tooltip title={`Go to story beat ${index + 1}`} placement="left" arrow>
                    <StepLabel onClick={onClick}
                               onMouseEnter={() => setHover(true)}
                               onMouseLeave={() => setHover(false)}
                               sx={{mt: '4px', mr: 2, cursor: 'pointer'}}
                               icon={<SwaStepIcon index={index} active={hover}/>}/>
                </Tooltip>
                <Typography style={{textAlign: 'left'}}>{answer}</Typography>
            </Box>
        </CardContent>
    </Card>)
}

interface AnsweredQuestionCardProps {
    onClick: () => void;
    index: number;
    question: string;
    answer: string;
}

const AnsweredQuestionCard: React.FC<AnsweredQuestionCardProps> = ({onClick, index, question, answer}) => {
    const [hover, setHover] = useState<boolean>(false);

    return (<Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + SwaColor.orangeLight, boxShadow: 'none'}}>
        <CardContent>
            <Box sx={{display: 'flex', mb: 1, alignItems: 'flex-start'}} style={{cursor: "pointer"}}>
                <Tooltip title={`Go to story beat ${index + 1}`} placement="left" arrow>
                    <StepLabel onClick={onClick}
                               onMouseEnter={() => setHover(true)}
                               onMouseLeave={() => setHover(false)}
                               sx={{mt: '4px', mr: 2, cursor: 'pointer'}}
                               icon={<SwaStepIcon index={index} active={hover}/>}></StepLabel>
                </Tooltip>
                <Typography style={{textAlign: 'left'}}>{question}</Typography>
            </Box>
            <Typography style={{textAlign: 'left'}}>{answer}</Typography>
        </CardContent>
    </Card>)
}


interface UnansweredQuestionCardProps {
    question: string;
}

const UnansweredQuestionCard: React.FC<UnansweredQuestionCardProps> = ({question}) => {
    return (<Card sx={{backgroundColor: 'white', mb: 1, border: 'solid ' + SwaColor.orangeLight, boxShadow: 'none'}}>
        <CardContent>
            <Typography style={{textAlign: 'left'}}>{question}</Typography>
        </CardContent>
    </Card>)
}

interface QuestionCardProps {
    questions: Questions;
    onClick?: (index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({questions, onClick}) => {
    const [expandedQuestionsRaised, setExpandedQuestionsRaised] = useState(true);
    const [expandedAnsweredQuestions, setExpandedAnsweredQuestions] = useState(true);
    const [expandedUnansweredQuestions, setExpandedUnansweredQuestions] = useState(true);

    const questionsRaisedTitle = "Questions raised by this story beat";
    const answeredQuestionsTitle = "Questions answered by this story beat";
    const unansweredQuestionsTitle = "Unanswered questions raised by this story beat";

    const handleClick = (index: number) => {
        if (onClick) onClick(index);
    }

    return (
        <Box sx={{mt: 2, marginLeft: 4}}>
            {questions.questions_raised && questions.questions_raised.length > 0
                ? <>
                    <Header onClick={() => setExpandedQuestionsRaised(!expandedQuestionsRaised)}
                            title={questionsRaisedTitle}/>
                    <Collapse in={expandedQuestionsRaised} timeout="auto" unmountOnExit>
                        {questions.questions_raised.map((raised, idx) => {
                                const index = raised.other_index ? raised.other_index - 1 : 0;
                                return (
                                    <RaisedQuestionCard key={`raised-${raised.id}-${idx}`}
                                                        onClick={() => handleClick(index)}
                                                        index={index}
                                                        question={raised.question}
                                                        answer={raised.answer ?? ""}/>)
                            }
                        )}
                    </Collapse>
                </>
                : <Card sx={{backgroundColor: '', mt: 2, p:1, border: 'solid ' + SwaColor.orangeLight, boxShadow: 'none'}}>
                    <Typography align={"left"} color={SwaColor.primaryLight} component='div'>
                        This story beat does not raise questions answered in other story beats
                    </Typography>
                </Card>
            }

            {questions.questions_answered && questions.questions_answered.length > 0
                ? <>
                    <Header onClick={() => setExpandedAnsweredQuestions(!expandedAnsweredQuestions)}
                            title={answeredQuestionsTitle}/>
                    <Collapse in={expandedAnsweredQuestions} timeout="auto" unmountOnExit>
                        {questions.questions_answered.map((answered, idx) => {
                                const index = answered.other_index ? answered.other_index - 1 : 0;
                                return (
                                    <AnsweredQuestionCard key={`answered-${answered.id}-${idx}`}
                                                          onClick={() => handleClick(index)}
                                                          index={index}
                                                          question={answered.question}
                                                          answer={answered.answer ?? ""}/>)
                            }
                        )}
                    </Collapse>
                </>
                : <Card sx={{backgroundColor: '', mt: 2, p:1, border: 'solid ' + SwaColor.orangeLight, boxShadow: 'none'}}>
                    <Typography align={"left"} color={SwaColor.primaryLight} component='div'>
                        This story beat does not answer questions raised in other story beats
                    </Typography>
                </Card>
            }

            {questions.questions_unanswered && questions.questions_unanswered.length > 0
                ? <>
                    <Header onClick={() => setExpandedUnansweredQuestions(!expandedUnansweredQuestions)}
                            title={unansweredQuestionsTitle}/>
                    <Collapse in={expandedUnansweredQuestions} timeout="auto" unmountOnExit>
                        {questions.questions_unanswered.map((unanswered, idx) =>
                            <UnansweredQuestionCard key={`unanswered-${unanswered.id}-${idx}`}
                                                    question={unanswered.question}/>
                        )}
                    </Collapse>
                </>
                : <Card sx={{backgroundColor: '', mt: 2, p:1, border: 'solid ' + SwaColor.orangeLight, boxShadow: 'none'}}>
                    <Typography align={"left"} color={SwaColor.primaryLight} component='div'>
                        There are no unanswered questions raised by this story beat
                    </Typography>
                </Card>
            }
        </Box>
    )
}

export default QuestionCard;