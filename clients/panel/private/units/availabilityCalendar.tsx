import {compose} from "redux";
import {useState} from "react";
import withLanguage, {WithLanguageType, type ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {UnitAvailabilityResponse, UnitAvailabilityWindow} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unitAvailability.response.type.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {Table} from "@coreModule/components/ui/table/table.tsx";

const AVAILABILITY_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/unit/availability"};

function windowBadge(w: UnitAvailabilityWindow, t: ResolveLanguageKey) {
    if (w.type === "sold")     return <Badge variant="destructive">{t("windows.sold")}</Badge>;
    if (w.status === "active")    return <Badge variant="default">{t("windows.reserved")}</Badge>;
    if (w.status === "expired")   return <Badge variant="secondary">{t("windows.expired")}</Badge>;
    if (w.status === "cancelled") return <Badge variant="outline">{t("windows.cancelled")}</Badge>;
    if (w.status === "converted") return <Badge variant="default">{t("windows.converted")}</Badge>;
    return <Badge variant="secondary">{w.status}</Badge>;
}

function statusBadge(status: string, t: ResolveLanguageKey) {
    switch (status) {
        case "available_unit":   return <Badge variant="default" className="bg-success">{t("unitStatus.available_unit")}</Badge>;
        case "reserved_unit":    return <Badge variant="default" className="bg-warning">{t("unitStatus.reserved_unit")}</Badge>;
        case "sold_unit":        return <Badge variant="destructive">{t("unitStatus.sold_unit")}</Badge>;
        case "unavailable_unit": return <Badge variant="secondary">{t("unitStatus.unavailable_unit")}</Badge>;
        default:                 return <Badge variant="secondary">{status}</Badge>;
    }
}

const CALENDAR_DATE_FORMAT: Intl.DateTimeFormatOptions = {day: "2-digit", month: "short", year: "numeric"};

function fmtDate(iso: string | undefined) {
    return formatDate(iso, {timeZone: "UTC", format: CALENDAR_DATE_FORMAT}) || "—";
}

function UnitAvailabilityCalendar({resolveLanguageKey: t}: WithLanguageType) {
    const defaultFrom = new Date(Date.now() - 30  * 24 * 3600 * 1000).toISOString().split("T")[0];
    const defaultTo   = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split("T")[0];

    const [projectId, setProjectId] = useState("");
    const [dateFrom,  setDateFrom]  = useState(defaultFrom);
    const [dateTo,    setDateTo]    = useState(defaultTo);
    // Loads on the Load button with the filters as they are at that moment.
    const [query, setQuery] = useState<Record<string, string>>({});
    const [loadCount, setLoadCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const request = useHttpRequest<UnitAvailabilityResponse>(AVAILABILITY_REQUEST, query, loadCount, true, {
        start: () => setError(null),
        error: (e) => setError(handleError(e, {context: "AvailabilityCalendar"})?.displayMessage ?? t("loadError")),
    });
    const loading = request.loading;
    const data = request.error ? null : request.data ?? null;

    const load = () => {
        setQuery({...(projectId ? {projectId} : {}), dateFrom, dateTo});
        setLoadCount((count) => count + 1);
    };

    return (
        <div className="flex flex-col p-6 gap-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {t("description")}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end border rounded-lg p-4 bg-muted/30">
                <div className="flex flex-col gap-y-1">
                    <Label className="text-xs">{t("projectIdLabel")}</Label>
                    <Input
                        className="w-60 h-8 text-sm"
                        placeholder={t("projectIdPlaceholder")}
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-y-1">
                    <Label className="text-xs">{t("fromLabel")}</Label>
                    <Input type="date" className="w-38 h-8 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="flex flex-col gap-y-1">
                    <Label className="text-xs">{t("toLabel")}</Label>
                    <Input type="date" className="w-38 h-8 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <Button size="sm" onClick={load} disabled={loading}>
                    {loading ? t("loading") : t("load")}
                </Button>
            </div>

            {error && (
                <div className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded p-3">
                    {error}
                </div>
            )}

            {data && (
                <div className="flex flex-col gap-y-3">
                    <p className="text-xs text-muted-foreground">
                        {data.entries.length === 1 ? t("showingOne") : t("showingMany").replace("{count}", String(data.entries.length))} &nbsp;·&nbsp;
                        {fmtDate(data.dateFrom)} – {fmtDate(data.dateTo)}
                    </p>

                    {data.entries.length === 0 && (
                        <p className="text-sm text-muted-foreground">{t("noUnits")}</p>
                    )}

                    {data.entries.map((entry) => (
                        <div key={entry.unit._id} className="border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-muted/40">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {entry.unit.name ?? t("unitFallback").replace("{number}", String(entry.unit.unitNumber))}
                                    </span>
                                    {entry.unit.floor?.name && (
                                        <span className="text-xs text-muted-foreground">· {entry.unit.floor.name}</span>
                                    )}
                                </div>
                                {statusBadge(entry.unit.status, t)}
                            </div>

                            {entry.windows.length === 0 ? (
                                <p className="px-4 py-3 text-xs text-muted-foreground">{t("noBookings")}</p>
                            ) : (
                                <Table bare className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="px-4 py-2 text-left font-medium">{t("columns.type")}</th>
                                            <th className="px-4 py-2 text-left font-medium">{t("columns.start")}</th>
                                            <th className="px-4 py-2 text-left font-medium">{t("columns.end")}</th>
                                            <th className="px-4 py-2 text-left font-medium">{t("columns.reference")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.windows.map((w, wi) => (
                                            <tr key={wi} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="px-4 py-2">{windowBadge(w, t)}</td>
                                                <td className="px-4 py-2">{fmtDate(w.start)}</td>
                                                <td className="px-4 py-2">{w.end ? fmtDate(w.end) : t("ongoing")}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{w.reference ?? "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/availabilityCalendar.tsx"),
    withDebug(true, true, "units"),
)(UnitAvailabilityCalendar);
