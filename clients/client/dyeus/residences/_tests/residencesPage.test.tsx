import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import type {ComponentType, ReactNode} from "react";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));

vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));
vi.mock("sonner", () => ({toast: Object.assign(vi.fn(), {loading: vi.fn(), success: vi.fn(), error: vi.fn(), dismiss: vi.fn()})}));
vi.mock("@coreModule/helpers/hocs/withDebug.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) => Wrapped,
}));
// The page chrome and the project sections have their own reads; this test is about the project read.
vi.mock("@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx", () => ({default: ({children}: {children: ReactNode}) => <>{children}</>}));
vi.mock("@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx", () => ({default: () => null}));
vi.mock("@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx", () => ({default: () => null}));
vi.mock("@propertyManagementModule/clients/client/dyeus/residences/dyeusResidencesProjectInfo.tsx", () => ({default: () => <p>project info</p>}));
vi.mock("@propertyManagementModule/clients/client/dyeus/residences/dyeusResidencesPolygonViewer.tsx", () => ({default: () => null}));
vi.mock("@propertyManagementModule/clients/client/dyeus/residences/dyeusResidencesUnitsGrid.tsx", () => ({default: () => null}));

import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import ResidencesPage from "../index.tsx";

// What the API answers when the host resolves to a company without property management.
const MODULE_NOT_ENABLED = {
    response: {status: 403, data: {error: "Forbidden", error_code: "module_not_enabled", message: "This module is not enabled for the company."}},
};

describe("dyeus residences page", () => {
    beforeEach(() => {
        apiClientMock.mockReset();
    });

    it("shows a load error with a retry when the project read fails, and the project once a retry succeeds", async () => {
        apiClientMock
            .mockRejectedValueOnce(MODULE_NOT_ENABLED)
            .mockResolvedValueOnce({data: {project: {_id: "p1", name: "Dyeus Tirana"}}});

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={["/residences?projectId=p1"]}>
                    <ResidencesPage />
                </MemoryRouter>
            </Provider>,
        );

        expect(await screen.findByText("Unable to load this project.")).toBeInTheDocument();
        expect(screen.getByText("This module is not enabled for the company.")).toBeInTheDocument();
        expect(apiClientMock).toHaveBeenCalledWith(expect.objectContaining({
            url: "/api/realEstate/marketingProjectCatalog/single",
            data: {projectId: "p1"},
        }));

        fireEvent.click(screen.getByRole("button", {name: "Try again"}));

        expect(await screen.findByText("project info")).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "Dyeus Tirana"})).toBeInTheDocument();
        expect(screen.queryByText("Unable to load this project.")).not.toBeInTheDocument();
        expect(apiClientMock).toHaveBeenCalledTimes(2);
    });
});
