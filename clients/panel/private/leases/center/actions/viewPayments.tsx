import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Banknote} from "lucide-react";
import {useNavigate} from "react-router-dom";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

type ViewLeasePaymentsProps = WithLanguageType & {
    lease?: Lease;
};

function ViewLeasePayments({lease, resolveLanguageKey}: ViewLeasePaymentsProps) {
    const navigate = useNavigate();
    if (!lease?._id || lease.deletedAt) return null;

    const params = new URLSearchParams();
    params.set("leaseId", lease._id);
    if (lease.name) params.set("leaseName", lease.name);

    return (
        <DropdownMenuItem onClick={() => navigate(`/realEstate/rentalPayments?${params.toString()}`)}>
            <Banknote className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/actions/viewPayments.tsx"),
    withDebug(true, true),
)(ViewLeasePayments);
