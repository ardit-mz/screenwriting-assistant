type TextChange = {
    from: string;
    to: string;
    startIndex: number;
    endIndex: number;
    lengthDelta: number;
};

type AuthorChange = {
    author: string;
    changes: TextChange[];
};

export type ScriptChangesAuthors = {
    initialText: string;
    aiChanges: AuthorChange[];
    userChanges: AuthorChange[];
}