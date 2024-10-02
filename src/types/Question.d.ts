export type Question = {
    id: string;
    question: string;
    current_index: number;
    answer?: string;
    other_index?: number;
    story_beat_id?: string;
}

export type Questions = {
    id: string;
    questions_raised: Question[];
    questions_answered: Question[];
    questions_unanswered:  Question[];
    story_beat_id?: string;
}
