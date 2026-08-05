import {useState, type ChangeEvent, type FormEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";

type ContactFormState = {
    name: string;
    surname: string;
    email: string;
    phone: string;
    message: string;
};

function ContactPage() {
    const [form, setForm] = useState<ContactFormState>({
        name: "",
        surname: "",
        email: "",
        phone: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const onChange = (key: keyof ContactFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({...prev, [key]: event.target.value}));
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post("/api/realEstate/marketingContact", {
                name: form.name,
                surname: form.surname,
                email: form.email,
                phone: form.phone,
                message: form.message,
                interest: "reservation",
            });
            toast.success("Thank you — we will be in touch shortly.");
            setForm({name: "", surname: "", email: "", phone: "", message: ""});
        } catch {
            toast.error("Unable to send your enquiry. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DyeusPageShell nodeId="44:contact" nodeName="Contact">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36 lg:grid-cols-2">
                    <div>
                        <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Contact</p>
                        <h1 className="mt-4 font-dyeus-serif text-5xl md:text-7xl">Begin the conversation</h1>
                        <p className="mt-6 max-w-md font-dyeus-sans text-base leading-relaxed text-dyeus-ink-muted">
                            Share a few details and our team will arrange a private introduction to Dyeus Residence.
                        </p>
                    </div>
                    <form onSubmit={onSubmit} className="flex flex-col gap-5 bg-dyeus-white p-6 md:p-8">
                        {(
                            [
                                ["name", "First name", "text"],
                                ["surname", "Surname", "text"],
                                ["email", "Email", "email"],
                                ["phone", "Phone", "tel"],
                            ] as const
                        ).map(([key, label, type]) => (
                            <label key={key} className="flex flex-col gap-2">
                                <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                                    {label}
                                </span>
                                <input
                                    required
                                    type={type}
                                    value={form[key]}
                                    onChange={onChange(key)}
                                    className="border-b border-dyeus-border bg-transparent py-2 font-dyeus-sans text-base outline-none focus:border-dyeus-bronze"
                                />
                            </label>
                        ))}
                        <label className="flex flex-col gap-2">
                            <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                                Message
                            </span>
                            <textarea
                                required
                                rows={5}
                                value={form.message}
                                onChange={onChange("message")}
                                className="resize-none border border-dyeus-border bg-transparent p-3 font-dyeus-sans text-base outline-none focus:border-dyeus-bronze"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 bg-dyeus-ink px-6 py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-cream transition hover:bg-dyeus-bronze-deep disabled:opacity-60"
                        >
                            {submitting ? "Sending…" : "Send enquiry"}
                        </button>
                    </form>
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/contact/index.tsx"),
    withDebug(true, true),
)(ContactPage);
