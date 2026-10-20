/**
 * propertyManagement's own public chat calls. The conversation transport itself
 * is core (`@coreModule/helpers/chat/publicChat/publicChatClient.ts`); these two
 * belong here because a lead is a propertyManagement concept.
 */

import {
    publicChatClient,
    publicChatHeaders,
} from "@coreModule/helpers/chat/publicChat/publicChatClient.ts";
import type {
    PublicChatIdentifyFormResponseType,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/publicChatIdentify/publicChatIdentify.form.response.type";
import type {
    PublicCurrenciesResponseType,
} from "armonia/src/modules/core/api/finance/public/currencies/publicCurrencies.response.type";
import type {CurrencySimple} from "armonia/src/modules/core/dto/currency.dto";

/** Lead capture lives in propertyManagement — core does not own `Lead`. */
const IDENTIFY_PATH = "/api/realEstate/publicChat";
const CURRENCIES_PATH = "/api/finance/public/currencies";

export type {CurrencySimple};

/**
 * Leave contact details. Note this hits the propertyManagement route, not the
 * core chat one — the details become a CRM lead, which is a PM concept.
 */
export async function identify(params: {
    name: string;
    email: string;
    phone: string;
    note?: string;
    budget?: number;
    budgetCurrency?: string;
    languageCode?: string;
}): Promise<PublicChatIdentifyFormResponseType> {
    const {languageCode, ...body} = params;
    const {data} = await publicChatClient.post<PublicChatIdentifyFormResponseType>(
        `${IDENTIFY_PATH}/identify`,
        body,
        {headers: publicChatHeaders(languageCode)},
    );
    return data;
}

/** Company currencies for the public identify / lead form budget select. */
export async function fetchPublicCurrencies(
    languageCode?: string,
): Promise<CurrencySimple[]> {
    const {data} = await publicChatClient.get<PublicCurrenciesResponseType>(
        CURRENCIES_PATH,
        {headers: publicChatHeaders(languageCode)},
    );
    return data.data ?? [];
}
