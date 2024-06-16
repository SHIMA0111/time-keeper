export type Record = {
    uid: string;
    category: string;
    subcategory: string;
    option1: string | undefined;
    option2: string | undefined;
    start: number;
    end: number;
    pauseStarts: number[];
    pauseEnds: number[];
};