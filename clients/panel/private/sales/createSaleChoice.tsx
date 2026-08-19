import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import SimpleHeader from "@coreModule/components/custom/header.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Card, CardContent} from "@coreModule/components/ui/card.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {IconCash, IconCreditCard} from "@tabler/icons-react";

type CreateSaleChoiceProps = WithLanguageType & {
    unitId?: string;
    unitName?: string;
}

function CreateSaleChoice({
    resolveLanguageKey,
    unitId,
    unitName
}: CreateSaleChoiceProps) {
    const navigate = useNavigate();
    const {create} = useAccess("sales");

    const buildParams = () => {
        const params = new URLSearchParams();
        if (unitId) params.set("unitId", unitId);
        if (unitName) params.set("unitName", encodeURIComponent(unitName));
        return params.toString();
    };

    const goToCash = () => {
        navigate(`/realEstate/sales/create/cash?${buildParams()}`);
    };

    const goToPaymentPlan = () => {
        navigate(`/realEstate/sales/create/paymentPlan?${buildParams()}`);
    };

    if (!create) {
        return <HiddenElement />;
    }

    return (
        <div className="flex-full gap-4">
            <SimpleHeader
                title={resolveLanguageKey("title")}
                description={resolveLanguageKey("description")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-fit" onClick={goToCash}>
                    <CardContent>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-full border border-muted-foreground">
                                <IconCash className="h-10 w-10" />
                            </div>
                            <p className="font-semibold text-lg/[18px] ">{resolveLanguageKey("cashSale")}</p>
                            <p className="text-sm text-muted-foreground">{resolveLanguageKey("cashSaleDescription")}</p>
                            <Button type="button" variant="default" onClick={(e) => { e.stopPropagation(); goToCash(); }}>
                                {resolveLanguageKey("createCashSale")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-fit" onClick={goToPaymentPlan}>
                    <CardContent>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-full border border-muted-foreground">
                                <IconCreditCard className="h-10 w-10" />
                            </div>
                            <p className="font-semibold text-lg/[18px] ">{resolveLanguageKey("paymentPlanSale")}</p>
                            <p className="text-sm text-muted-foreground">{resolveLanguageKey("paymentPlanSaleDescription")}</p>
                            <Button type="button" variant="default" onClick={(e) => { e.stopPropagation(); goToPaymentPlan(); }}>
                                {resolveLanguageKey("createPaymentPlanSale")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/createSaleChoice.tsx"),
    withDebug(true, true, "sales")
)(CreateSaleChoice);
