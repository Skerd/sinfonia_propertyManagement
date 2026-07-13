import type {RentalType} from "@propertyManagementModule/clients/client/public/shared/roi/calculateRoi.ts";

type RoiRentalTypeSelectProps = {
    value: RentalType;
    onChange: (value: RentalType) => void;
    longTermLabel: string;
    shortTermLabel: string;
    label: string;
};

function RoiRentalTypeSelect({value, onChange, longTermLabel, shortTermLabel, label}: RoiRentalTypeSelectProps) {
    return (
        <div>
            <p className="font-aeonik-medium text-lg text-pronix-ink not-italic md:text-2xl">{label}</p>
            <div className="mt-2 flex rounded-[5px] border border-pronix-border p-1">
                <button
                    type="button"
                    onClick={() => onChange("long-term")}
                    className={`flex-1 rounded-[3px] px-3 py-2 font-aeonik-light text-base text-pronix-ink not-italic transition md:text-xl ${
                        value === "long-term" ? "bg-pronix-blue text-white" : "hover:bg-pronix-ink/5"
                    }`}
                >
                    {longTermLabel}
                </button>
                <button
                    type="button"
                    onClick={() => onChange("short-term")}
                    className={`flex-1 rounded-[3px] px-3 py-2 font-aeonik-light text-base text-pronix-ink not-italic transition md:text-xl ${
                        value === "short-term" ? "bg-pronix-blue text-white" : "hover:bg-pronix-ink/5"
                    }`}
                >
                    {shortTermLabel}
                </button>
            </div>
        </div>
    );
}

export default RoiRentalTypeSelect;
