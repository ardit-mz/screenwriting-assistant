import {ImpulseStage} from "../enum/ImpulseStage.ts";
import {Question} from "./Questions.ts";
import {QuestionStage} from "../enum/QuestionStage.ts";
import {UniversalEmotionStage} from "../enum/UniversalEmotionStage.ts";
import {Project} from "./Project.ts";
import {Emotion} from "./Emotion.ts";
import {Critique} from "../types/Critique";
import {Analysis} from "../types/Analysis";

export interface StoryBeat {
    id: string;
    text: string;
    locked: boolean;
    index: number;
    impulses: string[];
    impulseStage: ImpulseStage;
    questions: Question[];
    questionStage: QuestionStage;
    universalEmotion: Emotion | undefined;
    universalEmotionStage: UniversalEmotionStage;
    versions: { id: string; text: string}[];
    critique: Critique | undefined;
    analysis: Analysis | undefined;
    project?: Project;
}