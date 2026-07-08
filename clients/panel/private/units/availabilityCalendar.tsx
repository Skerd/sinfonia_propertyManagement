import {compose} from "redux";
import {useState, useCallback} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {UnitAvailabilityResponse, UnitAvailabilityWindow} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unitAvailability.response.type.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

function windowBadge(w: UnitAvailabilityWindow) {
    if (w.type === "sold")     return <Badge variant="destructive">Sold</Badge>;
    if (w.status === "active")    return <Badge variant="default">Reserved</Badge>;
    if (w.status === "expired")   return <Badge variant="secondary">Expired</Badge>;
    if (w.status === "cancelled") return <Badge variant="outline">Cancelled</Badge>;
    if (w.status === "converted") return <Badge variant="default">Converted</Badge>;
    return <Badge variant="secondary">{w.status}</Badge>;
}

function statusBadge(status: string) {
    switch (status) {
        case "available_unit":   return <Badge variant="default" className="bg-green-600">Available</Badge>;
        case "reserved_unit":    return <Badge variant="default" className="bg-yellow-500">Reserved</Badge>;
        case "sold_unit":        return <Badge variant="destructive">Sold</Badge>;
        case "unavailable_unit": return <Badge variant="secondary">Unavailable</Badge>;
        default:                 return <Badge variant="secondary">{status}</Badge>;
    }
}

function fmtDate(iso: string | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"});
}

function UnitAvailabilityCalendar({}: WithLanguageType) {
    const defaultFrom = new Date(Date.now() - 30  * 24 * 3600 * 1000).toISOString().split("T")[0];
    const defaultTo   = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split("T")[0];

    const [projectId, setProjectId] = useState("");
    const [dateFrom,  setDateFrom]  = useState(defaultFrom);
    const [dateTo,    setDateTo]    = useState(defaultTo);
    const [loading,   setLoading]   = useState(false);
    const [data,      setData]      = useState<UnitAvailabilityResponse | null>(null);
    const [error,     setError]     = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post("/api/realEstate/unit/availability", {
                ...(projectId ? {projectId} : {}),
                dateFrom,
                dateTo,
            });
            setData(res.data?.data ?? null);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load availability data");
        } finally {
            setLoading(false);
        }
    }, [projectId, dateFrom, dateTo]);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Unit Availability Calendar</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View reservation and sale windows across units.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end border rounded-lg p-4 bg-muted/30">
                <div className="space-y-1">
                    <Label className="text-xs">Project ID (optional)</Label>
                    <Input
                        className="w-60 h-8 text-sm"
                        placeholder="Paste project ObjectId…"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input type="date" className="w-38 h-8 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input type="date" className="w-38 h-8 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <Button size="sm" onClick={load} disabled={loading}>
                    {loading ? "Loading…" : "Load"}
                </Button>
            </div>

            {error && (
                <div className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded p-3">
                    {error}
                </div>
            )}

            {data && (
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        Showing {data.entries.length} unit{data.entries.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                        {fmtDate(data.dateFrom)} – {fmtDate(data.dateTo)}
                    </p>

                    {data.entries.length === 0 && (
                        <p className="text-sm text-muted-foreground">No units found for the selected filters.</p>
                    )}

                    {data.entries.map((entry) => (
                        <div key={entry.unit._id} className="border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-muted/40">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {entry.unit.name ?? `Unit #${entry.unit.unitNumber}`}
                                    </span>
                                    {entry.unit.floor?.name && (
                                        <span className="text-xs text-muted-foreground">· {entry.unit.floor.name}</span>
                                    )}
                                </div>
                                {statusBadge(entry.unit.status)}
                            </div>

                            {entry.windows.length === 0 ? (
                                <p className="px-4 py-3 text-xs text-muted-foreground">No bookings in this period.</p>
                            ) : (
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="px-4 py-2 text-left font-medium">Type</th>
                                            <th className="px-4 py-2 text-left font-medium">Start</th>
                                            <th className="px-4 py-2 text-left font-medium">End</th>
                                            <th className="px-4 py-2 text-left font-medium">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.windows.map((w, wi) => (
                                            <tr key={wi} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="px-4 py-2">{windowBadge(w)}</td>
                                                <td className="px-4 py-2">{fmtDate(w.start)}</td>
                                                <td className="px-4 py-2">{w.end ? fmtDate(w.end) : "Ongoing"}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{w.reference ?? "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
    withDebug(true, true),
)(UnitAvailabilityCalendar);
