import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {Currency} from "armonia/src/modules/core/api/finance/private/currency/currency.dto.ts";
import {minorToNumber, percentOfMoney} from "armonia/src/modules/core/helpers/money.ts";
import {computeSalePricing} from "armonia/src/modules/propertyManagement/helpers/salePricing.ts";

export type SalePricingPreview = {
    /** The unit is priced in another currency than the sale and its rate is not set yet. */
    missingSaleExchangeRate: boolean;
    /** The deposit was paid in another currency than the sale and its rate is not set yet. */
    missingReservationExchangeRate: boolean;
    /** The discount, in the unit currency. */
    discount: number;
    /** The deposit deducted, in the sale currency; null until it can be converted. */
    depositDeduction: number | null;
    /** In the sale currency; null until the unit, the sale currency and every needed rate are known. */
    finalPrice: number | null;
    negative: boolean;
};

/** A rate typed into the form, when it is a positive number. */
function positiveRate(value: unknown): string | undefined {
    const text = value == null ? "" : String(value).trim();
    return text !== "" && Number(text) > 0 ? text : undefined;
}

/**
 * The sale forms' live price, by the rule the server stores (armonia `computeSalePricing`): the discounted list price
 * in the sale currency, less the reservation deposit converted from its own currency.
 */
export function salePricingPreview(input: {
    unit: Unit | null;
    reservation: Reservation | null;
    saleCurrency: Currency | null;
    localDiscount: unknown;
    saleExchangeRate: unknown;
    reservationExchangeRate: unknown;
}): SalePricingPreview {
    const {unit, reservation, saleCurrency} = input;
    const saleCurrencyId = saleCurrency?._id?.toString();
    const needsSaleRate = !!unit && !!saleCurrencyId && unit.priceCurrency?._id?.toString() !== saleCurrencyId;
    const needsReservationRate = !!reservation && !!saleCurrencyId && reservation.depositCurrency?._id?.toString() !== saleCurrencyId;
    const saleExchangeRate = needsSaleRate ? positiveRate(input.saleExchangeRate) : undefined;
    const reservationExchangeRate = needsReservationRate ? positiveRate(input.reservationExchangeRate) : undefined;
    const typedDiscount = Number(input.localDiscount);
    const discountPercent = Number.isFinite(typedDiscount) ? typedDiscount : 0;
    const unitDecimals = unit?.priceCurrency?.decimalPlaces;

    const preview: SalePricingPreview = {
        missingSaleExchangeRate: needsSaleRate && !saleExchangeRate,
        missingReservationExchangeRate: needsReservationRate && !reservationExchangeRate,
        discount: unit ? percentOfMoney(unit.price, discountPercent, unitDecimals) : 0,
        depositDeduction: null,
        finalPrice: null,
        negative: false,
    };
    if (!unit || !saleCurrency || preview.missingSaleExchangeRate || preview.missingReservationExchangeRate) return preview;

    const pricing = computeSalePricing({
        unitPrice: unit.price,
        unitDecimals,
        discountPercent,
        saleExchangeRate,
        saleDecimals: saleCurrency.decimalPlaces,
        depositAmount: reservation?.depositAmount,
        depositDecimals: reservation?.depositCurrency?.decimalPlaces,
        reservationExchangeRate,
    });
    if (!pricing.ok) return {...preview, negative: true};
    return {
        ...preview,
        depositDeduction: minorToNumber(pricing.depositInSaleCurrencyMinor, saleCurrency.decimalPlaces),
        finalPrice: minorToNumber(pricing.finalPriceMinor, saleCurrency.decimalPlaces),
    };
}
