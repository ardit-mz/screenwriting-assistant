import {Critique} from "./Critique";
import {Analysis} from "./Analysis";
import {Consistency} from "./Consistency";
import {ScriptChangesAuthors} from "./ScriptChanges";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export type ScriptVersion = {
    id: string;
    screenplay: string;
    treatment: string | undefined;
    critique: Critique | undefined;
    analysis: Analysis | undefined;
    consistency: Consistency[] | undefined;
    whoWroteWhat: ScriptChangesAuthors | undefined;
    critiqueStage: MenuCardStage;
    analysisStage: MenuCardStage;
    consistencyStage: MenuCardStage;
    whoWroteWhatStage: MenuCardStage;
}

export type Script = {
    screenplay: string;
    treatment: string | undefined;
    versions: ScriptVersion[];
    selectedVersion: number;
    needsUpdate?: boolean;
}