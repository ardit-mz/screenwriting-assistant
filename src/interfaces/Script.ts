import {Critique} from "../types/Critique";
import {Analysis} from "../types/Analysis";
import {Consistency} from "../types/Consistency";
import {ScriptChangesAuthors} from "../types/ScriptChanges";
import {MenuCardStage} from "../enum/MenuCardStage.ts";

export interface ScriptVersion {
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

export interface Script {
    screenplay: string;
    treatment: string | undefined;
    versions: ScriptVersion[];
    selectedVersion: number;
    needsUpdate?: boolean;
}