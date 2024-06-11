export type RecordInput = {
    top_id: number;
    sub1_id: number | undefined;
    sub2_id: number | undefined;
    sub3_id: number | undefined;
    sub4_id: number | undefined;
    start: number;
    end: number;
    pause_starts: number[];
    pause_ends: number[];
}