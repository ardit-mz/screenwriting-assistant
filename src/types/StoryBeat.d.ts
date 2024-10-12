import {Project} from "./Project";
import {Questions} from "./Question";
import {Emotion} from "./Emotion";
import {Critique} from "./Critique";
import {Analysis} from "./Analysis";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export type StoryBeat = {
    id: string;
    text: string;
    locked: boolean;
    index: number;
    versions: { id: string; text: string}[];
    impulses: string[];
    impulseStage: MenuCardStage;
    questions: Questions | undefined;
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