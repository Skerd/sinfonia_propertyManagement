import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {BookOpen, Loader2} from "lucide-react";

type MarketingBookletPost = {unitId: string};

type MarketingBookletProps = WithLanguageType & WithAxiosType<Blob, MarketingBookletPost> & {
    unitId: string;
    unitName?: string;
};

function MarketingBooklet({unitId, unitName, resolveLanguageKey, innerRef, onFilterChange, loading}: MarketingBookletProps) {
    const {read} = useAccess("units");

    useImperativeHandle(innerRef, () => ({
        success: (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `marketing-booklet-${unitName ?? unitId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }));

    if (!read) return <></>;

    return (
        <DropdownMenuItem
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); if (!loading) onFilterChange({unitId});}}
            disabled={loading}
        >
            {loading ? <Loader2 size={16} className="animate-spin"/> : <BookOpen size={16}/>}
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘b</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/marketingBooklet.tsx"),
    withAxios<Blob, MarketingBookletPost>(
        {
            method: "post",
            url: "/api/realEstate/unit/generateMarketingBooklet",
            data: {},
            responseType: "blob",
        },
        true,
    ),
    withDebug(true, true, "units"),
)(MarketingBooklet);
