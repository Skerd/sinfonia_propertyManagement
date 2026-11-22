import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";

const {onFilterChange, uploadFilesForSubmitMock} = vi.hoisted(() => ({
    onFilterChange: vi.fn(),
    uploadFilesForSubmitMock: vi.fn(),
}));

vi.mock("sonner", () => ({toast: Object.assign(vi.fn(), {loading: vi.fn(), success: vi.fn(), error: vi.fn(), dismiss: vi.fn()})}));
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Component: ComponentType<Record<string, unknown>>) => (props: Record<string, unknown>) => (
        <Component {...props} resolveLanguageKey={(key: string) => key} />
    ),
}));
vi.mock("@coreModule/helpers/hocs/withAxios.tsx", () => ({
    default: () => (Component: ComponentType<Record<string, unknown>>) => (props: Record<string, unknown>) => (
        <Component {...props} data={null} loading={false} error={null} onFilterChange={onFilterChange} innerRef={{current: null}} />
    ),
}));
vi.mock("@coreModule/helpers/hocs/withDebug.tsx", () => ({
    default: () => (Component: ComponentType<Record<string, unknown>>) => Component,
}));
vi.mock("@coreModule/components/viewEngine/widgets/media/singleFile.tsx", () => ({default: () => null}));
vi.mock("@coreModule/helpers/media/uploadFilesForSubmit.ts", () => ({uploadFilesForSubmit: uploadFilesForSubmitMock}));

import {toast} from "sonner";
import MarkPaidCommissionDialog from "../markPaidCommissionDialog.tsx";

type DialogProps = {open: boolean; onClose: () => void; commission: {_id: string}};
const Dialog = MarkPaidCommissionDialog as unknown as ComponentType<DialogProps>;

describe("MarkPaidCommissionDialog", () => {
    beforeEach(() => {
        onFilterChange.mockReset();
        uploadFilesForSubmitMock.mockReset();
        vi.mocked(toast.error).mockReset();
        URL.createObjectURL = vi.fn(() => "blob:receipt");
        // handleError logs the failure; the test only checks what the user sees.
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("says why a refused receipt was not uploaded and does not mark the commission paid", async () => {
        uploadFilesForSubmitMock.mockRejectedValueOnce({
            isAxiosError: true,
            response: {status: 400, data: {error_code: "file_type_blocked", message: "Program and script files can't be uploaded."}},
        });
        const {container} = render(<Dialog open onClose={() => undefined} commission={{_id: "c1"}} />);
        const input = (container.ownerDocument.querySelector("input[type=file]")) as HTMLInputElement;
        fireEvent.change(input, {target: {files: [new File(["MZ"], "setup.exe")]}});

        fireEvent.click(screen.getByText("confirmPaid"));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Program and script files can't be uploaded."));
        expect(onFilterChange).not.toHaveBeenCalled();
        expect(screen.getByText("confirmPaid").closest("button")).not.toBeDisabled();
    });
});
