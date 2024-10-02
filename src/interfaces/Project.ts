// interfaces/Project.ts

import {ProjectStage} from "../enum/ProjectStage.ts";
import {StoryBeat} from "./StoryBeat.ts";
import {Script} from "./Script.ts";

export interface Project {
    id: string;
    name: string;
    projectStage: ProjectStage;
    brainstorm: string;
    script: Script | undefined;
    storyBeats: StoryBeat[];
    storyBeatOfWhichTheQuestionsShouldBeDisplayed?: StoryBeat;
    suggestions?: string[];
    uploadedText?: string;
}