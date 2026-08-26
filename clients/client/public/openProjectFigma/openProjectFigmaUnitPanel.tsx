import {useEffect, useState} from "react";
import {compose} from "redux";
import {X} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import PropertyGallerySection from "@propertyManagementModule/clients/client/public/property/sections/propertyGallerySection.tsx";
import PropertyDetailsSection from "@propertyManagementModule/clients/client/public/property/sections/propertyDetailsSection.tsx";
import PropertySidebarSection from "@propertyManagementModule/clients/client/public/property/sections/propertySidebarSection.tsx";
import PropertyContactFormModal from "@propertyManagementModule/clients/client/public/property/sections/propertyContactFormModal.tsx";
import type {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/property/index.tsx";

type OpenProjectFigmaUnitPanelProps = WithLanguageType & {
    projectId: string;
    unitId: string;
    unitLabel?: string;
    onClose: () => void;
};

type MarketingUnitResponse = {unit: MarketingUnitSingle};

function OpenProjectFigmaUnitPanel({
    projectId,
    unitId,
    unitLabel,
    onClose,
    resolveLanguageKey,
    currentLanguage,
    languageCode,
}: OpenProjectFigmaUnitPanelProps) {
    const [unit, setUnit] = useState<MarketingUnitSingle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [contactTitle, setContactTitle] = useState<string | undefined>(undefined);
    const [contactMode, setContactMode] = useState<"requestInfo" | "reserve">("requestInfo");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setUnit(null);

        apiClient
            .post<MarketingUnitResponse>("/api/realEstate/marketingUnit/single", {projectId, unitId})
            .then((response) => {
                if (cancelled) {
                    return;
                }
                const nextUnit = response.data?.unit;
                if (!nextUnit) {
                    setError(true);
                    return;
                }
                setUnit(nextUnit);
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [projectId, unitId]);

    const openContactForm = (titleKey: "requestInfo" | "reserveOnline") => {
        setContactMode(titleKey === "reserveOnline" ? "reserve" : "requestInfo");
        setContactTitle(String(resolveLanguageKey(titleKey)));
        setContactOpen(true);
    };

    return (
        <aside
            className="flex h-full min-h-0 w-full max-h-full flex-col overflow-hidden rounded-[5px] border border-pronix-border bg-white text-pronix-ink shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
            data-node-id="open-project-unit-panel"
        >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 md:px-6 md:pt-6">
                <h2 className="min-w-0 flex-1 wrap-break-word font-aeonik-medium text-base leading-[1.15] text-pronix-ink md:text-lg">
                    {unit?.name || unitLabel || resolveLanguageKey("formUnitLabel")}
                </h2>
                <div className="flex shrink-0 items-center gap-1">
                    {unit ? (
                        <PublicFavoriteHeartButton
                            kind="unit"
                            projectId={unit.projectId || projectId}
                            projectName={unit.projectName}
                            unit={{
                                _id: unit._id,
                                name: unit.name,
                                status: unit.status,
                                floorLabel: unit.floorLabel,
                                price: unit.price,
                                imageUrl: unit.mainImage ?? unit.imageGallery?.[0],
                                edificeName: unit.edificeName,
                            }}
                            addLabel={String(resolveLanguageKey("favoritesAdd"))}
                            removeLabel={String(resolveLanguageKey("favoritesRemove"))}
                        />
                    ) : null}
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mr-1 -mt-0.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-pronix-ink transition hover:bg-[rgba(24,24,24,0.06)]"
                        aria-label={String(resolveLanguageKey("back"))}
                    >
                        <X className="size-5" strokeWidth={1.75} aria-hidden />
                    </button>
                </div>
            </div>

            <div className="mt-4 h-0 min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-6 md:pb-6">
                {loading ? (
                    <div className="flex min-h-[240px] items-center justify-center">
                        <Loader />
                    </div>
                ) : error || !unit ? (
                    <p className="font-aeonik-light text-sm text-pronix-ink-muted md:text-base">
                        {resolveLanguageKey("loadError")}
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <PropertyGallerySection unit={unit} compact />
                        <div className="grid w-full grid-cols-1 gap-4 min-[48rem]:grid-cols-12 min-[48rem]:gap-4">
                            <PropertyDetailsSection
                                resolveLanguageKey={resolveLanguageKey}
                                currentLanguage={currentLanguage}
                                languageCode={languageCode}
                                unit={unit}
                                breakoutSecondary
                                compact
                                onRequestInfo={() => openContactForm("requestInfo")}
                            />
                            <div className="min-w-0 min-[48rem]:order-2 min-[48rem]:col-span-5">
                                <PropertySidebarSection
                                    resolveLanguageKey={resolveLanguageKey}
                                    currentLanguage={currentLanguage}
                                    languageCode={languageCode}
                                    unit={unit}
                                    sticky
                                    compact
                                    onReserve={() => openContactForm("reserveOnline")}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {unit ? (
                <PropertyContactFormModal
                    open={contactOpen}
                    onClose={() => setContactOpen(false)}
                    projectId={unit.projectId || projectId}
                    unitId={unit._id}
                    unitName={unit.name}
                    mode={contactMode}
                    title={contactTitle}
                    resolveLanguageKey={resolveLanguageKey}
                    currentLanguage={currentLanguage}
                    languageCode={languageCode}
                />
            ) : null}
        </aside>
    );
}

export default compose(withLanguage(LANGUAGE_PATH))(OpenProjectFigmaUnitPanel);
