import {useEffect, useRef, useState, type FormEvent} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import type {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingUnitResponse = {unit: MarketingUnitSingle};
type PropertyPageProps = WithAxiosType<MarketingUnitResponse, {projectId: string; unitId: string}>;

function PropertyPage({data, loading, error, onFilterChange}: PropertyPageProps) {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const unit = data?.unit;
    const requestedKeyRef = useRef("");
    const [contactOpen, setContactOpen] = useState(false);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const requestedKey = `${projectId}:${unitId}`;
        if (!projectId || !unitId) {
            requestedKeyRef.current = "";
            return;
        }
        if (requestedKeyRef.current === requestedKey) return;
        requestedKeyRef.current = requestedKey;
        onFilterChange({projectId, unitId});
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId, unitId]);

    const gallery = unit?.imageGallery?.length
        ? unit.imageGallery
        : [unit?.floorPlanImage, dyeusAssets.interior, dyeusAssets.terrace].filter(Boolean) as string[];

    const submitEnquiry = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post("/api/realEstate/marketingContact", {
                name,
                surname,
                email,
                phone,
                message: message || `Enquiry for unit ${unit?.name ?? unitId}`,
                interest: "reservation",
                projectInterest: projectId || undefined,
                unitInterest: unitId || undefined,
            });
            toast.success("Enquiry sent.");
            setContactOpen(false);
            setName("");
            setSurname("");
            setEmail("");
            setPhone("");
            setMessage("");
        } catch {
            toast.error("Could not send enquiry.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DyeusPageShell nodeId="44:property" nodeName="Property">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pt-36">
                    <Link
                        to={`/residences${projectId ? `?projectId=${projectId}` : ""}`}
                        className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
                    >
                        ← Residences
                    </Link>

                    {!projectId || !unitId ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">Missing project or unit parameters.</p>
                    ) : error ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">Unable to load this residence.</p>
                    ) : loading && !unit ? (
                        <div className="mt-20 flex justify-center">
                            <Loader />
                        </div>
                    ) : unit ? (
                        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
                            <div>
                                <div className="relative aspect-[16/11] overflow-hidden bg-dyeus-sand">
                                    <img
                                        src={gallery[0] || dyeusAssets.interior}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </div>
                                {gallery.length > 1 && (
                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        {gallery.slice(1, 4).map((src) => (
                                            <div key={src} className="relative aspect-[4/3] overflow-hidden">
                                                <img src={src} alt="" className="size-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <aside className="bg-dyeus-white p-6 md:p-8">
                                <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                    {unit.status}
                                </p>
                                <h1 className="mt-3 font-dyeus-serif text-4xl md:text-5xl">{unit.name}</h1>
                                <dl className="mt-8 space-y-4 border-t border-dyeus-border pt-6 font-dyeus-sans text-sm">
                                    {unit.areaSqm != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">Area</dt>
                                            <dd>{unit.areaSqm} m²</dd>
                                        </div>
                                    )}
                                    {unit.bedrooms != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">Bedrooms</dt>
                                            <dd>{unit.bedrooms}</dd>
                                        </div>
                                    )}
                                    {unit.bathrooms != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">Bathrooms</dt>
                                            <dd>{unit.bathrooms}</dd>
                                        </div>
                                    )}
                                    {unit.price != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">Price</dt>
                                            <dd>{unit.price.toLocaleString()}</dd>
                                        </div>
                                    )}
                                </dl>
                                {unit.description && (
                                    <p className="mt-6 font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">
                                        {unit.description}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setContactOpen(true)}
                                    className="mt-8 w-full bg-dyeus-ink px-6 py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-cream transition hover:bg-dyeus-bronze-deep"
                                >
                                    Request information
                                </button>
                            </aside>
                        </div>
                    ) : null}
                </div>
            </div>

            {contactOpen && (
                <div className="fixed inset-0 z-[180] flex items-center justify-center bg-dyeus-ink/40 p-4">
                    <form
                        onSubmit={submitEnquiry}
                        className="w-full max-w-md bg-dyeus-cream p-6 shadow-lg md:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="font-dyeus-serif text-3xl">Request information</h2>
                            <button
                                type="button"
                                onClick={() => setContactOpen(false)}
                                className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-muted"
                            >
                                Close
                            </button>
                        </div>
                        <div className="mt-6 flex flex-col gap-4">
                            <input
                                required
                                placeholder="First name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-b border-dyeus-border bg-transparent py-2 font-dyeus-sans outline-none"
                            />
                            <input
                                required
                                placeholder="Surname"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="border-b border-dyeus-border bg-transparent py-2 font-dyeus-sans outline-none"
                            />
                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-b border-dyeus-border bg-transparent py-2 font-dyeus-sans outline-none"
                            />
                            <input
                                required
                                type="tel"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="border-b border-dyeus-border bg-transparent py-2 font-dyeus-sans outline-none"
                            />
                            <textarea
                                required
                                rows={4}
                                placeholder="Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="border border-dyeus-border bg-transparent p-3 font-dyeus-sans outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-6 w-full bg-dyeus-ink py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-cream disabled:opacity-60"
                        >
                            {submitting ? "Sending…" : "Send"}
                        </button>
                    </form>
                </div>
            )}

            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/property/index.tsx"),
    withAxios<MarketingUnitResponse, {projectId: string; unitId: string}>(
        {method: "post", url: "/api/realEstate/marketingUnit/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(PropertyPage);
