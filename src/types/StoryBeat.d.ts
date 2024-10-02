import {QuestionStage} from "../enum/QuestionStage.ts";
import {ImpulseStage} from "../enum/ImpulseStage.ts";
import {UniversalEmotionStage} from "../enum/UniversalEmotionStage.ts";
import {Project} from "./Project";
import {Questions} from "./Question";
import {Emotion} from "./Emotion";
import {Critique} from "./Critique";
import {Analysis} from "./Analysis";

export type StoryBeat = {
    id: string;
    text: string;
    locked: boolean;
    index: number;
    impulses: string[];
    impulseStage: ImpulseStage;
    questions: Questions | undefined;
    questionStage: QuestionStage;
    universalEmotion: Emotion | undefined;
    universalEmotionStage: UniversalEmotionStage;
    versions: { id: string; text: string}[];
    critique: Critique | undefined;
    analysis: Analysis | undefined;
    project?: Project;
}