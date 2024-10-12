import {Critique} from "./Critique";
import {Analysis} from "./Analysis";
import {Consistency} from "./Consistency";
import {ScriptChangesAuthors} from "./ScriptChanges";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export type Script = {
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