import {compose} from "redux";
import {useId, useState, type FormEvent} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Field, FieldLabel} from "@coreModule/components/ui/field.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import FormField from "@coreModule/clients/portal/shared/formField.tsx";
import FormStatus from "@coreModule/clients/portal/shared/formStatus.tsx";
import {usePortalSession} from "@coreModule/clients/portal/shared/portalSession.tsx";
import type {MarketingContactFormType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.validator.ts";

type PropertyInquiryFormProps = WithLanguageType & {
    projectId: string;
    unitId?: string;
};

const FIELDS = [
    {key: "name", type: "text", autoComplete: "given-name"},
    {key: "surname", type: "text", autoComplete: "family-name"},
    {key: "email", type: "email", autoComplete: "email"},
    {key: "phone", type: "tel", autoComplete: "tel"},
] as const;

type Contact = Record<(typeof FIELDS)[number]["key"] | "message", string>;

function todayStamp() {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

/** Ask the developer about a project or a unit; the company gets it as a lead. */
function PropertyInquiryForm({projectId, unitId, resolveLanguageKey}: PropertyInquiryFormProps) {
    const {user} = usePortalSession();
    const messageId = useId();
    const [contact, setContact] = useState<Contact>({name: user.name, surname: user.surname, email: user.email, phone: user.phoneNumber ?? "", message: ""});
    const [viewingDate, setViewingDate] = useState("");
    const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const message = viewingDate
            ? `${resolveLanguageKey("viewingLine").replace("{date}", viewingDate)}\n\n${contact.message}`
            : contact.message;
        const body: MarketingContactFormType = {
            ...contact,
            message,
            interest: viewingDate ? "reservation" : "price_enquiry",
            projectInterest: projectId,
            unitInterest: unitId,
        };
        setState("sending");
        apiClient.post("/api/realEstate/marketingContact", body)
            .then(() => setState("sent"))
            .catch(() => setState("failed"));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold">{resolveLanguageKey(unitId ? "titleUnit" : "titleProject")}</h2>
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("subtitle")}</p>
            </div>
            {state === "sent" ? (
                <FormStatus tone="success">{resolveLanguageKey("sent")}</FormStatus>
            ) : (
                <form className="flex flex-col gap-4" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {FIELDS.map(({key, type, autoComplete}) => (
                            <FormField
                                key={key}
                                required
                                type={type}
                                autoComplete={autoComplete}
                                label={resolveLanguageKey(`fields.${key}`)}
                                value={contact[key]}
                                onChange={(event) => setContact((current) => ({...current, [key]: event.target.value}))}
                            />
                        ))}
                    </div>
                    <FormField
                        type="date"
                        min={todayStamp()}
                        label={resolveLanguageKey("fields.viewingDate")}
                        value={viewingDate}
                        onChange={(event) => setViewingDate(event.target.value)}
                    />
                    <Field>
                        <FieldLabel htmlFor={messageId}>{resolveLanguageKey("fields.message")}</FieldLabel>
                        <Textarea
                            id={messageId}
                            required
                            rows={4}
                            maxLength={2000}
                            value={contact.message}
                            placeholder={resolveLanguageKey("messagePlaceholder")}
                            onChange={(event) => setContact((current) => ({...current, message: event.target.value}))}
                        />
                    </Field>
                    {state === "failed" ? <FormStatus tone="error">{resolveLanguageKey("failed")}</FormStatus> : null}
                    <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>{resolveLanguageKey("send")}</Button>
                </form>
            )}
        </div>
    );
}

export default compose(withLanguage("src/modules/propertyManagement/clients/portal/propertyInquiryForm.tsx"))(PropertyInquiryForm);
