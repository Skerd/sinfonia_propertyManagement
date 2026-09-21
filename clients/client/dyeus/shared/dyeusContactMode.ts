import {fillLanguageTemplate} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

/** Unit contact modal modes: generic info request, reservation, or price enquiry (price-on-request units). */
export type DyeusContactMode = "requestInfo" | "reserve" | "enquiry";

/** Language key used as the modal title for each mode. */
export const DYEUS_CONTACT_TITLE_KEY: Record<DyeusContactMode, string> = {
    requestInfo: "requestInfo",
    reserve: "reserveOnline",
    enquiry: "makeEnquiry",
};

/** Interest locked on the lead (select hidden) for each mode; `undefined` lets the visitor pick. */
export const DYEUS_CONTACT_LOCKED_INTEREST: Record<DyeusContactMode, "reservation" | "price_enquiry" | undefined> = {
    requestInfo: undefined,
    reserve: "reservation",
    enquiry: "price_enquiry",
};

/** Prefilled, editable message for the contact form. */
export function dyeusContactDefaultMessage(t: (key: string) => string, mode: DyeusContactMode, unitName: string): string {
    return mode === "enquiry"
        ? fillLanguageTemplate(t("priceEnquiryMessage"), {unit: unitName})
        : fillLanguageTemplate(t("defaultMessage"), {name: unitName});
}
