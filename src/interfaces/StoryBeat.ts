import {Emotion} from "./Emotion.ts";
import {Critique} from "../types/Critique";
import {Analysis} from "../types/Analysis";
import {MenuCardStage} from "../enum/MenuCardStage.ts";
import {Questions} from "../types/Question";

export interface StoryBeatVersion {
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

export interface StoryBeat {
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