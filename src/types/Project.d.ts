import {StoryBeat} from "./StoryBeat";
import {ProjectStage} from "../enum/ProjectStage.ts";
import {Script} from "./Script";

export type Project = {
    id: string;
    name: string;
    projectStage: ProjectStage;
    brainstorm: string;
    brainstormChanged: boolean;
    script: Script | undefined;
    storyBeats: StoryBeat[];
    storyBeatOfWhichTheQuestionsShouldBeDisplayed?: StoryBeat;
    suggestions?: string[];
    suggestionsLoaded?: boolean;
    uploadedText?: string;
}