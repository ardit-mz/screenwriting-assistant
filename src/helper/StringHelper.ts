import {StoryBeat} from "../types/StoryBeat";

export const storyBeatSToString = (storyBeats: StoryBeat[]) => {
    return storyBeats.map((s, i) => `${i + 1}: ${s.versions[s.selectedVersionId].text}`).join('\n');
}