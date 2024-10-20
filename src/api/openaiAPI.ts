import {zodResponseFormat} from "openai/helpers/zod";
import {getOpenAIRes} from "../services/openaiService.ts";
import {
    ANALYSIS_SCHEMA,
    CONSISTENCY_SCHEMA,
    CRITIQUE_SCHEMA,
    IMPULSES_SCHEMA,
    QUESTIONS_SCHEMA,
    REWRITE_STORY_BEATS_SCHEMA,
    STORY_BEATS_SCHEMA,
    SUGGESTIONS_SCHEMA,
    UNIVERSAL_EMOTION_SCHEMA,
} from "../schema/Response_Format.ts";
import {SYS_SUGGESTIONS, USR_SUGGESTIONS} from "../prompts/PromptsBrainstorming.ts";
import {
    SYS_BRAINSTORM_TO_STORY_BEATS,
    SYS_IMPULSES,
    SYS_REPHRASE_IMPULSE,
    SYS_REWRITE_STORY_BEAT,
    SYS_REWRITE_STORY_BEATS,
    USR_BRAINSTORM_TO_STORY_BEATS,
    USR_IMPULSES,
    USR_REWRITE_STORY_BEATS
} from "../prompts/PromptsStructure.ts";
import {StoryBeat} from "../types/StoryBeat";
import {
    SYS_STORY_BEAT_ANALYSIS,
    SYS_STORY_BEAT_CRITIQUE,
    SYS_STORY_BEAT_EMOTION,
    SYS_STORY_BEAT_QUESTION
} from "../prompts/PromptsRefinement.ts";
import {
    SCREENPLAY_TREATMENT,
    STORY_BEATS_SCREENPLAY,
    SYS_SCREENPLAY_ANALYSIS,
    SYS_SCREENPLAY_CONSISTENCY_CHECK,
    SYS_SCREENPLAY_CRITIQUE, UPDATE_SCREENPLAY
} from "../prompts/PromptsCompletion.ts";
import {SYS_CRITIQUE_SENTENCE, SYS_EXTEND, SYS_REPHRASE} from "../prompts/PromptsHighlightedText.ts";

/* Brainstorming */

export function getSuggestions(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        SUGGESTIONS_SCHEMA,
        "suggestions"
    )
    const res = getOpenAIRes(
        USR_SUGGESTIONS(prompt),
        SYS_SUGGESTIONS,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService getSuggestions", res);
    return res;
}


/* Structure */

export function getStoryBeatsFromBrainstorming(prompt: string, apiKey: string, model: string, uploadedText: string = '') {
    const res_format = zodResponseFormat(
        STORY_BEATS_SCHEMA,
        "story_beats"
    )
    const res = getOpenAIRes(
        USR_BRAINSTORM_TO_STORY_BEATS(prompt, uploadedText),
        SYS_BRAINSTORM_TO_STORY_BEATS,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService getStoryBeatsFromBrainstorming", res);
    return res;
}

export function regenerateStoryBeats(brainstorming: string, storyBeats: StoryBeat[], lockedStoryBeats: string, apiKey: string, model: string, uploadedText: string = '') {
    const res_format = zodResponseFormat(
        REWRITE_STORY_BEATS_SCHEMA,
        "story_beats"
    )
    const res = getOpenAIRes(
        USR_REWRITE_STORY_BEATS(brainstorming, uploadedText, storyBeats, lockedStoryBeats),
        SYS_REWRITE_STORY_BEATS,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService regenerateStoryBeats", res);
    return res;
}

export function getStoryBeatImpulse(storyBeats: StoryBeat[], prevIndex: number | undefined, nextIndex: number | undefined, currentIndex: number | undefined, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        IMPULSES_SCHEMA,
        "impulses"
    )
    const res = getOpenAIRes(
        USR_IMPULSES(storyBeats, prevIndex, nextIndex, currentIndex),
        SYS_IMPULSES,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService getStoryBeatImpulse", res);
    return res;
}

export function rewriteStoryBeat(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        SYS_REWRITE_STORY_BEAT,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService rewriteStoryBeat", res);
    return res;
}

export function rewriteStoryBeatImpulse(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        SYS_REPHRASE_IMPULSE,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService rewriteStoryBeatImpulse", res);
    return res;
}


/* Refinement */

export function storyBeatEmotion(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        UNIVERSAL_EMOTION_SCHEMA,
        "universalEmotions"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_STORY_BEAT_EMOTION,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService storyBeatEmotion", res);
    return res;
}

export function storyBeatQuestion(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        QUESTIONS_SCHEMA,
        "universalQuestion"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_STORY_BEAT_QUESTION,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService storyBeatQuestion", res);
    return res;
}

export function storyBeatCritique(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        CRITIQUE_SCHEMA('story beat'),
        "critique"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_STORY_BEAT_CRITIQUE,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService storyBeatCritique", res);
    return res;
}

export function storyBeatAnalysis(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        ANALYSIS_SCHEMA('story beat'),
        "analysis"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_STORY_BEAT_ANALYSIS,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService storyBeatAnalysis", res);
    return res;
}


/* Highlighted Text*/

export function rephraseSentence(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        SYS_REPHRASE,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService rephraseSentence", res);
    return res;
}

export function extendSentence(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        SYS_EXTEND,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService extendSentence", res);
    return res;
}

export function critiqueSentence(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        SYS_CRITIQUE_SENTENCE,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService critiqueSentence", res);
    return res;
}


/* Completion */

export function storyBeatsToScreenplay(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        STORY_BEATS_SCREENPLAY,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService storyBeatsToScreenplay", res);
    return res;
}

export function updateScreenplay(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        UPDATE_SCREENPLAY,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService updateScreenplay", res);
    return res;
}

export function screenplayToTreatment(prompt: string, apiKey: string, model: string) {
    const res = getOpenAIRes(
        prompt,
        SCREENPLAY_TREATMENT,
        undefined,
        apiKey,
        model
    )
    console.log("openaiService storyBeatsToTreatment", res);
    return res;
}

export function screenplayCritique(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        CRITIQUE_SCHEMA('screenplay'),
        "critique"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_SCREENPLAY_CRITIQUE,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService screenplayCritique", res);
    return res;
}

export function screenplayAnalysis(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        ANALYSIS_SCHEMA('screenplay'),
        "analysis"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_SCREENPLAY_ANALYSIS,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService screenplayAnalysis", res);
    return res;
}

export function checkScriptConsistency(prompt: string, apiKey: string, model: string) {
    const res_format = zodResponseFormat(
        CONSISTENCY_SCHEMA,
        "consistency"
    )
    const res = getOpenAIRes(
        prompt,
        SYS_SCREENPLAY_CONSISTENCY_CHECK,
        res_format,
        apiKey,
        model
    )
    console.log("openaiService checkScriptConsistency", res);
    return res;
}