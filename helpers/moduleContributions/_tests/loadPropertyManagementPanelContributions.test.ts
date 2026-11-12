import {describe, expect, it} from "vitest";
import {createPropertyManagementPanelContributions} from "@propertyManagementModule/helpers/moduleContributions/loadPropertyManagementPanelContributions.ts";
import {anyModelRead} from "@propertyManagementModule/helpers/access/useAnyModelRead.ts";
import {type AccessContextValue, type AccessObject, emptyAccessObject} from "@coreModule/helpers/context/accessContext.tsx";

const path = (pkg: string) => `/src/modules/${pkg}/clients/panel/propertyManagementPanelContribution.ts`;

const snags = {url: "/api/a/groupDashboard", accessModels: ["snags"]};
const label = (key: string, languageCode: string) => `${languageCode}:${key}`;
const erp = {
    url: "/api/a/erpExport",
    datasets: [{value: "permits", responseKey: "permits"}],
    accessModels: ["permits"],
    datasetLabel: label,
    columnLabel: label,
};

describe("createPropertyManagementPanelContributions", () => {
    it("takes each screen's source from the first contribution that has one", () => {
        const {getGroupDashboardOpenSnagsSource, getErpExportSource} = createPropertyManagementPanelContributions({
            [path("b")]: {default: {id: "b", order: 20, groupDashboardOpenSnags: {url: "/api/b/groupDashboard", accessModels: []}}},
            [path("a")]: {default: {id: "a", order: 10, erpExport: erp}},
            [path("c")]: {default: {id: "c", order: 30, groupDashboardOpenSnags: snags, erpExport: {...erp, url: "/api/c/erpExport"}}},
        });
        expect(getGroupDashboardOpenSnagsSource()?.url).toBe("/api/b/groupDashboard");
        expect(getErpExportSource()).toEqual(erp);
    });

    it("lists every contributed dashboard edifice card in contribution order", () => {
        const card = (widget: string) => ({widget, accessModels: ["snags"]});
        const {getDashboardEdificeCardSources} = createPropertyManagementPanelContributions({
            [path("b")]: {default: {id: "b", order: 20, dashboardEdificeCard: card("#B")}},
            [path("a")]: {default: {id: "a", order: 10, dashboardEdificeCard: card("#A")}},
            [path("c")]: {default: {id: "c", order: 30, erpExport: erp}},
        });
        expect(getDashboardEdificeCardSources()).toEqual([card("#A"), card("#B")]);
    });

    it("lists every contributed project sheet section in contribution order", () => {
        const section = (widget: string) => ({widget, accessModels: ["budgets"]});
        const {getProjectSheetSectionSources} = createPropertyManagementPanelContributions({
            [path("b")]: {default: {id: "b", order: 20, projectSheetSections: [section("#B1"), section("#B2")]}},
            [path("a")]: {default: {id: "a", order: 10, projectSheetSections: [section("#A")]}},
            [path("c")]: {default: {id: "c", order: 30, erpExport: erp}},
        });
        expect(getProjectSheetSectionSources()).toEqual([section("#A"), section("#B1"), section("#B2")]);
    });

    it("has no source when nothing contributes", () => {
        const {getGroupDashboardOpenSnagsSource, getErpExportSource, getDashboardEdificeCardSources, getProjectSheetSectionSources} =
            createPropertyManagementPanelContributions({});
        expect(getGroupDashboardOpenSnagsSource()).toBeUndefined();
        expect(getErpExportSource()).toBeUndefined();
        expect(getDashboardEdificeCardSources()).toEqual([]);
        expect(getProjectSheetSectionSources()).toEqual([]);
    });

    it("rejects a malformed source", () => {
        const {list} = createPropertyManagementPanelContributions({
            [path("bad")]: {default: {id: "bad", erpExport: {url: "/api/x", datasets: "permits", accessModels: []}}},
        });
        expect(() => list()).toThrow(`Invalid default export in ${path("bad")}`);
        const {list: unlabelledList} = createPropertyManagementPanelContributions({
            [path("bad")]: {default: {id: "bad", erpExport: {...erp, datasets: ["permits"], datasetLabel: undefined}}},
        });
        expect(() => unlabelledList()).toThrow(`Invalid default export in ${path("bad")}`);
        const {list: cardList} = createPropertyManagementPanelContributions({
            [path("bad")]: {default: {id: "bad", dashboardEdificeCard: {widget: 1, accessModels: []}}},
        });
        expect(() => cardList()).toThrow(`Invalid default export in ${path("bad")}`);
        const {list: sectionList} = createPropertyManagementPanelContributions({
            [path("bad")]: {default: {id: "bad", projectSheetSections: {widget: "#A", accessModels: []}}},
        });
        expect(() => sectionList()).toThrow(`Invalid default export in ${path("bad")}`);
    });
});

describe("anyModelRead", () => {
    const access = (read: AccessObject["read"]) => ({self: {...emptyAccessObject("x"), read}});
    const map: AccessContextValue = {snags: access(true), permits: access({}), boqitems: access(false)};

    it("is true when one model has a read grant, by any letter case", () => {
        expect(anyModelRead(map, ["BoqItems", "Snags"])).toBe(true);
    });

    it("is false for denials, empty field maps and unknown models", () => {
        expect(anyModelRead(map, ["permits", "boqitems", "unknown"])).toBe(false);
        expect(anyModelRead(map, [])).toBe(false);
    });

    it("applies debug overrides like useAccess", () => {
        expect(anyModelRead(map, ["snags"], {snags: {self: {read: false}}})).toBe(false);
    });
});
