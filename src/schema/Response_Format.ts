import {z} from "zod";

/* Brainstorming */

export const SUGGESTIONS_SCHEMA = z.object({
    index: z.number().describe("the suggestion index"),
    suggestions: z.array(z.string())
        .describe("an array of 3 one sentence suggestions for the brainstorming text")
}).describe("an object containing the index and suggestions for the brainstorming text")


/* Structure */

export const STORY_BEATS_SCHEMA = z.object({
    story_beats: z.array(z.string())
        .describe("an array of 5 story beats for a five-act structure")
}).describe("an object containing an array of 5 story beats for a five-act structure");

export const REWRITE_STORY_BEATS_SCHEMA = z.object({
    story_beats: z.array(z.string())
        .describe("an array of story beats for a five-act story structure")
}).describe("an object containing an array of story beats for a five-act story structure");

export const IMPULSES_SCHEMA = z.object({
    index: z.number().describe("the story beat index"),
    impulses: z.array(z.string())
        .describe("an array of 3 impulses for idea generation")
}).describe("an object containing the index and impulses for a story beat")


/* Refinement */

export const UNIVERSAL_EMOTION_SCHEMA = z.object({
    coreEmotion: z.string().describe("the story beat core emotion"),
    reason: z.string().describe("the reason why this is the story beat core emotion"),
    suggestions: z
        .array(z.string())
        .describe("an array of 5 enhanced emotions for a story beat")
}).describe("an object used to analyse the core emotion and present creative, emotional impulses for the provided story beat")

const question = z.object({
    question: z.string().describe("The question that the story beat raises"),
    question_story_beat_number: z.number().describe("The index / number of the current story beat"),
    answer: z.string().describe("The answer that a later story beat gives to the question."),
    answer_story_beat_number: z.number().describe("The story beat number of the later story beat that provides an answer for the question that the current story beat raises"),
}).describe("Question raised or answered by the story beat")

export const UNIVERSAL_QUESTION_SCHEMA = z.object({
    questions_raised: z.array(question).describe("Array of questions that are raised by the story beat"),
    questions_answered: z.array(question).describe("Array of questions that are answered by the story beat"),
}).describe("An object that contains questions raised/answered by the current and/or later story beats")

export const QUESTIONS_SCHEMA = z.object({
    questions_raised: z.array(
        z.object({
            question: z.string().describe("The question that the current story beat raises"),
            current_index: z.number().describe("The index / number of the current story beat"),
            answer: z.string().describe("The answer that another story beat gives to the raised question."),
            other_index: z.number().describe("The story beat index / number of the other story beat"),
        }).describe("An object that contains questions raised by the current story beat and the respective answers from the other story beats")
    ).describe("Array of questions that are raised by the story beat"),
    questions_answered: z.array(
        z.object({
            question: z.string().describe("The question that another story beat raises"),
            other_index: z.number().describe("The index / number of the story beat that raises the question"),
            answer: z.string().describe("The answer that the current story beat gives to the question."),
            current_index: z.number().describe("The story beat index / number of the other story beat"),
        }).describe("An object that contains questions raised by other story beats that are answered by the current story beat")
    ).describe("Array of questions that are answered by the story beat"),
    questions_unanswered: z.array(
        z.object({
            question: z.string().describe("The question that the story beat raises but are not answered in any other story beat"),
            current_index: z.number().describe("The index / number of the current story beat"),
        }).describe("An object that contains questions raised by the current story beat but not answered in any other story beat")
    ).describe("Array of questions that are raised by the story beat but not answered in the whole story"),
})

export const CRITIQUE_SCHEMA = (part: string) => z.object({
    strength: z.string().describe(`a short description of the strengths of the ${part}`),
    improvementArea: z.string().describe(`a short description of the areas for improvement of the ${part}`),
    improvementSummary: z.string().describe(`a very short summary for improvement of the ${part}`),
}).describe(`an object used to critique the provided ${part} and find its strengths and areas for improvement`)

export const ANALYSIS_SCHEMA = (part: string) => z.object({
    incitingIncident: z.string().describe(`a short description of the inciting incident for the provided ${part}`),
    characterDevelopment: z.string().describe(`a short description of the character development for the provided ${part}`),
    thematicImplications: z.string().describe(`a short description of the thematic implications for the provided ${part}`),
    narrativeForeshadowing: z.string().describe(`a short description of the narrative foreshadowing for the provided ${part}`),
}).describe(`an object used to analyse the provided ${part} and its inciting incident, character development, thematic implications, and narrative foreshadowing`)


/* Completion */

export const CONSISTENCY_SCHEMA = z.object({
    inconsistencies: z.array(
        z.object({
            text: z.string().describe('sentence or paragraph that is inconsistent in the context of the screenplay'),
            issue: z.string().describe('The issue with the sentence or paragraph, so why it is inconsistent in the context of the screenplay'),
            suggestion: z.string().describe('A very short suggestion on how the sentence or paragraph can be made more consistent in the context of the screenplay'),
            revisedText: z.string().describe('a revised or corrected version of the sentence or paragraph'),
        }).describe(`an object used to check the consistency of a sentence or paragraph in the screenplay draft, with the goal of finding out the issue with the sentence or paragraph, suggestions on how it can be solved, and a revised and corrected version of the sentence or paragraph`)
    ).describe('An array of objects describing sentences or paragraphs that are inconsistent in the screenplay draft, and how they can be corrected')
}).describe('An object containing an array of objects describing sentences or paragraphs that are inconsistent in the screenplay draft, and how they can be corrected')
