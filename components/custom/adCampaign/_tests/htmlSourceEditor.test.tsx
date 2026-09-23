import type {ReactNode} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {FormProvider, useForm} from "react-hook-form";

// The editor and its preview are both wrapped in the language HOC, which reaches
// for the redux store; the harness fake stands in for it.
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    default: (await import("@coreModule/components/viewEngine/_tests/harness.tsx")).fakeWithLanguage,
}));

const HtmlSourceEditor = (
    await import("@propertyManagementModule/components/custom/adCampaign/htmlSourceEditor.tsx")
).default;

function FormHost({values = {}, children}: {values?: Record<string, unknown>; children: ReactNode}) {
    const form = useForm({defaultValues: values});
    return <FormProvider {...form}>{children}</FormProvider>;
}

function renderEditor(props: Record<string, unknown> = {}, values: Record<string, unknown> = {}) {
    render(
        <FormHost values={{bodyHtml: "", campaignType: "offer", locale: "en-US", ...values}}>
            {/* No `previewApiUrl`: the preview posts to the server, which this test has no business doing. */}
            <HtmlSourceEditor name="bodyHtml" label="Email body" placeholders={["firstName", "projectName"]} {...props} />
        </FormHost>,
    );
    return screen.getByRole("textbox") as HTMLTextAreaElement;
}

describe("HtmlSourceEditor", () => {
    it("inserts a token at the caret rather than appending it", async () => {
        const textarea = renderEditor({}, {bodyHtml: "<p>Dear , welcome.</p>"});

        // Caret between "Dear " and ","
        textarea.setSelectionRange(8, 8);
        fireEvent.click(screen.getByRole("button", {name: "{firstName}"}));

        await waitFor(() =>
            expect(textarea).toHaveValue("<p>Dear {firstName}, welcome.</p>"),
        );
    });

    it("replaces the selection when one exists", async () => {
        const textarea = renderEditor({}, {bodyHtml: "<p>Hello NAME</p>"});

        // Select "NAME"
        textarea.setSelectionRange(9, 13);
        fireEvent.click(screen.getByRole("button", {name: "{projectName}"}));

        await waitFor(() => expect(textarea).toHaveValue("<p>Hello {projectName}</p>"));
    });

    it("leaves the caret after the inserted token, so a second insert does not jump to the end", async () => {
        const textarea = renderEditor({}, {bodyHtml: "AB"});

        textarea.setSelectionRange(1, 1);
        fireEvent.click(screen.getByRole("button", {name: "{firstName}"}));
        await waitFor(() => expect(textarea).toHaveValue("A{firstName}B"));

        // Without caret restoration this second click would land at the end.
        fireEvent.click(screen.getByRole("button", {name: "{projectName}"}));
        await waitFor(() => expect(textarea).toHaveValue("A{firstName}{projectName}B"));
    });

    it("never inserts past maxLength", async () => {
        const textarea = renderEditor({maxLength: 14}, {bodyHtml: "AB"});

        textarea.setSelectionRange(2, 2);
        fireEvent.click(screen.getByRole("button", {name: "{firstName}"}));

        await waitFor(() => expect(textarea).toHaveValue("AB{firstName}"));
        expect((textarea.value as string).length).toBeLessThanOrEqual(14);
    });

    it("hides the palette and snippets while the form is loading", () => {
        renderEditor({loading: true});
        expect(screen.queryByRole("button", {name: "{firstName}"})).not.toBeInTheDocument();
    });
});
