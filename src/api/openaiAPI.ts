import {zodResponseFormat} from "openai/helpers/zod";
import {
    ANALYSIS,
    CRITIQUE, CRITIQUE_SENTENCE, EXTEND,
    IMPULSE, REPHRASE,
    REWRITE_STORYBEAT,
    REWRITE_STORYBEAT_IMPULSE,
    STORY_BEATS,
    STORYBEATS_SCREENPLAY,
    STORYBEATS_TREATMENT,
    SUGGESTIONS,
    UNIVERSAL_EMOTION,
    UNIVERSAL_QUESTION
} from "../constants/SystemMessage.ts";
import {getOpenAIRes} from "../services/openaiService.ts";
import {
    ANALYSIS_SCHEMA,
    CRITIQUE_SCHEMA,
    IMPULSES_SCHEMA,
    QUESTIONS_SCHEMA,
    STORY_BEATS_SCHEMA,
    SUGGESTIONS_SCHEMA,
    UNIVERSAL_EMOTION_SCHEMA,
    // UNIVERSAL_QUESTION_SCHEMA
} from "../schema/Response_Format.ts";

/* Brainstorming */

export function getSuggestions(prompt: string, apiKey: string) {
    const res_format = zodResponseFormat(SUGGESTIONS_SCHEMA, "suggestions")
    const res = getOpenAIRes(prompt, SUGGESTIONS, res_format, apiKey)
    console.log("openaiService getSuggestions", res);
    return res;
}


/* Structure */

export function getStoryBeatsFromBrainstorming(prompt: string, apiKey: string) {
    const res_format = zodResponseFormat(STORY_BEATS_SCHEMA, "story_beats")
    const res = getOpenAIRes(prompt, STORY_BEATS, res_format, apiKey)
    console.log("openaiService getStoryBeatsFromBrainstorming", res);
    return res;
}

export function regenerateStoryBeats(prompt: string, apiKey: string) {
    const res_format = zodResponseFormat(STORY_BEATS_SCHEMA, "story_beats")
    const res = getOpenAIRes(prompt, STORY_BEATS, res_format, apiKey)
    console.log("openaiService regenerateStoryBeats", res);
    return res;
}

export function getStoryBeatImpulse(prompt: string, apiKey: string) {
    const res_format = zodResponseFormat(IMPULSES_SCHEMA, "impulses")
    const res = getOpenAIRes(prompt, IMPULSE, res_format, apiKey)
    console.log("openaiService getStoryBeatImpulse", res);
    return res;
}

export function rewriteStoryBeat(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, REWRITE_STORYBEAT, undefined, apiKey)
    console.log("openaiService rewriteStoryBeat", res);
    return res;
}

export function rewriteStoryBeatImpulse(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, REWRITE_STORYBEAT_IMPULSE, undefined, apiKey)
    console.log("openaiService rewriteStoryBeatImpulse", res);
    return res;
}


/* Refinement */

export function getStoryBeatUniversalEmotion(prompt: string, apiKey: string) {
    const res_format = zodResponseFormat(UNIVERSAL_EMOTION_SCHEMA, "universalEmotions")
    const res = getOpenAIRes(prompt, UNIVERSAL_EMOTION, res_format, apiKey)
    console.log("openaiService getStoryBeatUniversalEmotion", res);
    return res;
}

export function getStoryBeatUniversalQuestion(prompt: string, apiKey: string) {
    const res_format = zodResponseFormat(QUESTIONS_SCHEMA, "universalQuestion")
    const res = getOpenAIRes(prompt, UNIVERSAL_QUESTION, res_format, apiKey)
    console.log("openaiService getStoryBeatUniversalQuestion", res);
    return res;
}

export function runCritique(prompt: string, apiKey: string, part: 'storyBeat' | 'script' = 'storyBeat') {
    const res_format = zodResponseFormat(CRITIQUE_SCHEMA(part), "critique")
    const res = getOpenAIRes(prompt, CRITIQUE, res_format, apiKey)
    console.log("openaiService getStoryBeatUniversalEmotion", res);
    return res;
}

export function runAnalysis(prompt: string, apiKey: string, part: 'storyBeat' | 'script' = 'storyBeat') {
    const res_format = zodResponseFormat(ANALYSIS_SCHEMA(part), "analysis")
    const res = getOpenAIRes(prompt, ANALYSIS, res_format, apiKey)
    console.log("openaiService getStoryBeatUniversalEmotion", res);
    return res;
}

export function rephraseSentence(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, REPHRASE,undefined, apiKey)
    console.log("openaiService rephraseSentence", res);
    return res;
}

export function extendSentence(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, EXTEND,undefined, apiKey)
    console.log("openaiService extendSentence", res);
    return res;
}

export function critiqueSentence(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, CRITIQUE_SENTENCE,undefined, apiKey)
    console.log("openaiService critiqueSentence", res);
    return res;
}


/* Export */
export function storyBeatsToScreenplay(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, STORYBEATS_SCREENPLAY, undefined, apiKey)
    console.log("openaiService storyBeatsToScreenplay", res);
    return res;
}

export function storyBeatsToTreatment(prompt: string, apiKey: string) {
    const res = getOpenAIRes(prompt, STORYBEATS_TREATMENT, undefined, apiKey)
    console.log("openaiService storyBeatsToTreatment", res);
    return res;
}