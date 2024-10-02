// services/openaiService.ts

import OpenAI from "openai";

// const API_KEY = 'api key';
//const GPT_4_TURBO = 'gpt-4-turbo';
const GPT_4o = 'gpt-4o-2024-08-06';
//const GPT_4 = 'gpt-4';
//const GPT_3_5 = 'gpt-3.5-turbo-0125';
//const GPT_3_5 = 'gpt-3.5-turbo-1106';

const USER = 'user';
const SYSTEM = 'system';


// source https://www.npmjs.com/package/openai
const client = (apiKey: string) => new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // TODO only use for local testing
    // TODO find solution
});

export async function getOpenAIRes(prompt: string, sysmsg: string, res_format?:  OpenAI.ResponseFormatJSONSchema | OpenAI.ResponseFormatText | OpenAI.ResponseFormatJSONObject | undefined, apiKey?: string, model?: string ) {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [
            {
                role: SYSTEM,
                content: sysmsg
            },
            {
                role: USER,
                content: prompt
            },
        ],
        model: model ?? GPT_4o,
        response_format: res_format
    }

    const chatCompletion = await client(apiKey!).beta.chat.completions.parse(params);
    console.log("openaiService getOpenAIRes", chatCompletion);
    return chatCompletion;
}
