import {Critique} from "../types/Critique";
import {Analysis} from "../types/Analysis";
import {Consistency} from "../types/Consistency";
import {ScriptChangesAuthors} from "../types/ScriptChanges";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export interface Script {
    screenplay: string;
    treatment: string | undefined;
    versions: { id: string; text: string}[];
    critique: Critique | undefined;
    analysis: Analysis | undefined;
    consistency: Consistency[] | undefined;
    whoWroteWhat: ScriptChangesAuthors | undefined;
    critiqueStage: MenuCardStage;
    analysisStage: MenuCardStage;
    consistencyStage: MenuCardStage;
    whoWroteWhatStage: MenuCardStage;
}