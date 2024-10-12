import {Question} from "./Questions.ts";
import {Project} from "./Project.ts";
import {Emotion} from "./Emotion.ts";
import {Critique} from "../types/Critique";
import {Analysis} from "../types/Analysis";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export interface StoryBeat {
    id: string;
    text: string;
    locked: boolean;
    index: number;
    versions: { id: string; text: string}[];
    impulses: string[];
    impulseStage: MenuCardStage;
    questions: Question[];
    questionStage: MenuCardStage;
    emotion: Emotion | undefined;
    emotionStage: MenuCardStage;
    critique: Critique | undefined;
    critiqueStage: MenuCardStage;
    analysis: Analysis | undefined;
    analysisStage: MenuCardStage;
    project?: Project;
    textUpdated?: boolean;
}