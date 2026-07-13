export function parseFloorLevel(levelNumber: string | number | undefined): number {
    if (levelNumber == null || levelNumber === "") {
        return 0;
    }
    if (typeof levelNumber === "number") {
        return Number.isFinite(levelNumber) ? levelNumber : 0;
    }
    const lower = levelNumber.toLowerCase();
    if (lower.includes("basement") || lower === "b" || lower === "-1") {
        return -1;
    }
    if (lower.includes("ground") || lower === "g" || lower === "0") {
        return 0;
    }
    const num = parseInt(levelNumber, 10);
    return Number.isNaN(num) ? 0 : num;
}
