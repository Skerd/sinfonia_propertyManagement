export const OPEN_PROJECT_FIGMA_VIEWS = ["3d", "gallery", "finance", "grid"] as const;

export type OpenProjectFigmaView = (typeof OPEN_PROJECT_FIGMA_VIEWS)[number];

export function openProjectFigmaPath(view: OpenProjectFigmaView, projectId: string): string {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    return `/open-project/${view}${query}`;
}

export function isOpenProjectFigmaView(value: string | undefined): value is OpenProjectFigmaView {
    return OPEN_PROJECT_FIGMA_VIEWS.includes(value as OpenProjectFigmaView);
}
