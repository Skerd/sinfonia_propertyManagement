import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {usePublicIsMobile} from "@propertyManagementModule/clients/client/public/shared/hooks/usePublicIsMobile.ts";
import {roiThumbCenterCss} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";

const HOME_THUMB_PX = 41;
const HOME_THUMB_MOBILE_PX = 22;
const PROPERTY_THUMB_PX = 28;
const TRACK_HEIGHT_PX = 10;
const TRACK_HEIGHT_MOBILE_PX = 7;

type RoiFigmaSliderProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    formatValue: (value: number) => string;
    variant?: "home" | "property";
    valueAlign?: "left" | "center" | "right";
    logoCentered?: boolean;
    dataNodeId?: string;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function thumbRatio(value: number, min: number, max: number) {
    if (max <= min) {
        return 0;
    }

    return (clamp(value, min, max) - min) / (max - min);
}

function RoiFigmaSlider({
    label,
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    variant = "home",
    valueAlign = "right",
    logoCentered = false,
    dataNodeId,
}: RoiFigmaSliderProps) {
    const isMobile = usePublicIsMobile();
    const clampedValue = clamp(value, min, max);
    const ratio = thumbRatio(clampedValue, min, max);
    const isHome = variant === "home";
    const thumbSizePx = isHome ? (isMobile ? HOME_THUMB_MOBILE_PX : HOME_THUMB_PX) : PROPERTY_THUMB_PX;
    const thumbCenter = roiThumbCenterCss(ratio, thumbSizePx);
    const trackHeightPx = isHome && isMobile ? TRACK_HEIGHT_MOBILE_PX : TRACK_HEIGHT_PX;

    const labelClass = isHome
        ? "font-aeonik-medium font-medium tracking-normal text-pronix-ink not-italic text-[16.66px] md:text-2xl leading-[1.1]"
        : "font-aeonik-medium text-lg text-pronix-ink not-italic md:text-2xl";
    const valueClass = isHome
        ? "font-aeonik-light text-pronix-ink not-italic whitespace-nowrap text-lg md:text-2xl leading-[1.1] shrink-0"
        : "font-aeonik-light text-lg text-pronix-ink not-italic md:text-2xl";

    function handleRangeChange(nextValue: number) {
        onChange(nextValue);
    }

    return (
        <div className="relative w-full shrink-0 cursor-default" data-node-id={dataNodeId}>
            <div className="mb-2 flex cursor-default items-start justify-between gap-4">
                <p className={`cursor-default ${labelClass}`}>{label}</p>
                <p
                    className={`cursor-default ${valueClass}`}
                    style={{
                        textAlign: valueAlign === "center" ? "center" : valueAlign,
                    }}
                >
                    {formatValue(clampedValue)}
                </p>
            </div>
            <div className="relative w-full" style={{height: thumbSizePx}}>
                <div
                    className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(24,24,24,0.1)]"
                    style={{height: trackHeightPx}}
                />
                <div
                    className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-pronix-blue"
                    style={{height: trackHeightPx, width: thumbCenter}}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={clampedValue}
                    onInput={(event) => handleRangeChange(Number(event.currentTarget.value))}
                    onChange={(event) => handleRangeChange(Number(event.target.value))}
                    aria-label={label}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={clampedValue}
                    className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0"
                />
                <div
                    className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{left: thumbCenter, width: thumbSizePx, height: thumbSizePx}}
                >
                    <img alt="" aria-hidden className="block size-full max-w-none" src={figmaAssets.roiThumb} />
                    {isHome && (
                        <div
                            className={`absolute overflow-hidden ${
                                isMobile
                                    ? "inset-[4px]"
                                    : logoCentered
                                      ? "left-1/2 top-1/2 h-[15px] w-[25px] -translate-x-1/2 -translate-y-1/2"
                                      : "left-[8px] top-1/2 h-[18.909px] w-[26px] -translate-y-1/2"
                            }`}
                        >
                            <img
                                alt=""
                                aria-hidden
                                className="absolute max-w-none"
                                src={figmaAssets.roiLogo}
                                style={
                                    logoCentered
                                        ? {height: "290.47%", left: "-63.3%", top: "-95.49%", width: "534.73%"}
                                        : {height: "230.42%", left: "-65.4%", top: "-62.88%", width: "514.16%"}
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoiFigmaSlider;
