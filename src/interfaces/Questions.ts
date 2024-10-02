import {StoryBeat} from "../types/StoryBeat";

export interface Question {
  id: string;
  question: string
  question_storybeat: number
  answer: string
  answer_storybeat: number
  storybeat?: StoryBeat
}