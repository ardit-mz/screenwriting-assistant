import {Questions} from "./Question";
import {Emotion} from "./Emotion";
import {Critique} from "./Critique";
import {Analysis} from "./Analysis";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export type StoryBeatVersion = {
    id: string;
    text: string;
    questions: Questions | undefined;
    emotion: Emotion | undefined;
    critique: Critique | undefined;
    analysis: Analysis | undefined;
    questionStage: MenuCardStage;
    emotionStage: MenuCardStage;
    critiqueStage: MenuCardStage;
    analysisStage: MenuCardStage;
}

export type StoryBeat = {
    id: string;
    text: string;
    locked: boolean;
    index: number;
    versions: StoryBeatVersion[];
    selectedVersionId: number;
    impulses: string[];
    impulseStage: MenuCardStage;
    projectId?: string;
    textUpdated?: boolean;
}