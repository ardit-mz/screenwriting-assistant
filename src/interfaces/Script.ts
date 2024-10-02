export interface Script {
    screenplay: string;
    treatment: string | undefined;
    versions: { id: string; text: string}[];
}