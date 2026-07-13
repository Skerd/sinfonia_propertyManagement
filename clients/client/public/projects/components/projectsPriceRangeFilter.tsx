import {useMemo, useState, type CSSProperties} from "react";
import {ProjectsPriceBounds} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";
import {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {computePriceHistogram} from "@propertyManagementModule/clients/client/public/projects/shared/computePriceHistogram.ts";
import {roiThumbCenterCss} from "@propertyManagementModule/clients/client/public/shared/roi/formatRoiValue.ts";
import {PUBLIC_SUBTITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import "./projectsFilterRange.css";

type ProjectsPriceRangeFilterProps = {
    priceMin: number;
    priceMax: number;
    bounds: ProjectsPriceBounds;
    priceSamples: number[];
    onChange: (next: {priceMin: number; priceMax: number}) => void;
    resolveLanguageKey: ResolveLanguageKey;
};

const THUMB_SIZE_PX = 41;
const TRACK_HEIGHT_PX = 10;
const HISTOGRAM_MAX_HEIGHT_PX = 56;
const BAR_WIDTH_PX = 7;

const rangeThumbStyle = {
    "--filter-range-thumb": `url(${projectsAssets.priceSliderThumb})`,
} as CSSProperties;

function clampPrice(value: number, bounds: ProjectsPriceBounds) {
    return Math.min(bounds.max, Math.max(bounds.min, value));
}

function thumbRatio(value: number, bounds: ProjectsPriceBounds) {
    if (bounds.max <= bounds.min) {
        return 0;
    }

    return (clampPrice(value, bounds) - bounds.min) / (bounds.max - bounds.min);
}

function ProjectsPriceRangeFilter({
    priceMin,
    priceMax,
    bounds,
    priceSamples,
    onChange,
    resolveLanguageKey,
}: ProjectsPriceRangeFilterProps) {
    const [minThumbOnTop, setMinThumbOnTop] = useState(false);
    const step = Math.max(1, Math.round((bounds.max - bounds.min) / 100));
    const minRatio = thumbRatio(priceMin, bounds);
    const maxRatio = thumbRatio(priceMax, bounds);
    const minThumbCenter = roiThumbCenterCss(minRatio, THUMB_SIZE_PX);
    const maxThumbCenter = roiThumbCenterCss(maxRatio, THUMB_SIZE_PX);

    const histogram = useMemo(
        () => computePriceHistogram(priceSamples, bounds),
        [priceSamples, bounds.min, bounds.max],
    );

    function handleMinChange(nextMin: number) {
        const clamped = clampPrice(nextMin, bounds);
        onChange({priceMin: clamped, priceMax: Math.max(clamped, priceMax)});
    }

    function handleMaxChange(nextMax: number) {
        const clamped = clampPrice(nextMax, bounds);
        onChange({priceMin: Math.min(priceMin, clamped), priceMax: clamped});
    }

    function handleMinInput(raw: string) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
            handleMinChange(parsed);
        }
    }

    function handleMaxInput(raw: string) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
            handleMaxChange(parsed);
        }
    }

    const sliderDisabled = bounds.max <= bounds.min;

    return (
        <div className="flex w-full flex-col gap-4" data-node-id="268:530">
            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>{resolveLanguageKey("filterPriceRange")}</p>

            <div className="relative w-full" style={{height: HISTOGRAM_MAX_HEIGHT_PX + THUMB_SIZE_PX + 8}}>
                <div
                    className="absolute left-0 right-0 flex items-end gap-[3px]"
                    style={{top: 0, height: HISTOGRAM_MAX_HEIGHT_PX}}
                    data-node-id="268:592"
                    aria-hidden
                >
                    {histogram.map((ratio, index) => {
                        const barHeight = Math.max(BAR_WIDTH_PX, Math.round(ratio * HISTOGRAM_MAX_HEIGHT_PX));
                        const bucketStart = bounds.min + (index / histogram.length) * (bounds.max - bounds.min);
                        const bucketEnd =
                            bounds.min + ((index + 1) / histogram.length) * (bounds.max - bounds.min);
                        const inRange = bucketEnd >= priceMin && bucketStart <= priceMax;

                        return (
                            <div key={index} className="flex min-w-0 flex-1 items-end justify-center">
                                <div
                                    className={`rounded-t-[5px] ${inRange ? "bg-pronix-blue" : "bg-pronix-blue/30"}`}
                                    style={{width: BAR_WIDTH_PX, height: barHeight}}
                                />
                            </div>
                        );
                    })}
                </div>

                <div
                    className="absolute inset-x-0"
                    style={{top: HISTOGRAM_MAX_HEIGHT_PX + 8, height: THUMB_SIZE_PX}}
                    data-node-id="268:559"
                >
                    <div
                        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(24,24,24,0.1)]"
                        style={{height: TRACK_HEIGHT_PX}}
                    />
                    <div
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-pronix-blue"
                        style={{
                            height: TRACK_HEIGHT_PX,
                            left: minThumbCenter,
                            right: `calc(100% - ${maxThumbCenter})`,
                        }}
                    />
                    <div className="projects-filter-dual-range">
                        <input
                            type="range"
                            min={bounds.min}
                            max={bounds.max}
                            step={step}
                            value={priceMin}
                            disabled={sliderDisabled}
                            onPointerDown={() => setMinThumbOnTop(true)}
                            onInput={(event) => handleMinChange(Number(event.currentTarget.value))}
                            onChange={(event) => handleMinChange(Number(event.target.value))}
                            aria-label={resolveLanguageKey("filterPriceMin") as string}
                            aria-valuemin={bounds.min}
                            aria-valuemax={bounds.max}
                            aria-valuenow={priceMin}
                            className={`projects-filter-range projects-filter-range-min absolute inset-0 ${minThumbOnTop ? "z-[5]" : "z-[3]"}`}
                            style={rangeThumbStyle}
                        />
                        <input
                            type="range"
                            min={bounds.min}
                            max={bounds.max}
                            step={step}
                            value={priceMax}
                            disabled={sliderDisabled}
                            onPointerDown={() => setMinThumbOnTop(false)}
                            onInput={(event) => handleMaxChange(Number(event.currentTarget.value))}
                            onChange={(event) => handleMaxChange(Number(event.target.value))}
                            aria-label={resolveLanguageKey("filterPriceMax") as string}
                            aria-valuemin={bounds.min}
                            aria-valuemax={bounds.max}
                            aria-valuenow={priceMax}
                            className={`projects-filter-range projects-filter-range-max absolute inset-0 ${minThumbOnTop ? "z-[4]" : "z-[5]"}`}
                            style={rangeThumbStyle}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-start justify-between gap-4" data-node-id="268:612">
                <label className="flex w-20 shrink-0 flex-col items-center rounded-[5px] border border-pronix-border p-3">
                    <span className="sr-only">{resolveLanguageKey("filterPriceMin")}</span>
                    <input
                        type="number"
                        min={bounds.min}
                        max={bounds.max}
                        step={step}
                        value={priceMin}
                        disabled={sliderDisabled}
                        onChange={(event) => handleMinInput(event.target.value)}
                        className="w-full border-0 bg-transparent text-center font-aeonik-light text-lg text-pronix-ink not-italic outline-none md:text-2xl"
                    />
                </label>
                <label className="flex w-20 shrink-0 flex-col items-center rounded-[5px] border border-pronix-border p-3">
                    <span className="sr-only">{resolveLanguageKey("filterPriceMax")}</span>
                    <input
                        type="number"
                        min={bounds.min}
                        max={bounds.max}
                        step={step}
                        value={priceMax}
                        disabled={sliderDisabled}
                        onChange={(event) => handleMaxInput(event.target.value)}
                        className="w-full border-0 bg-transparent text-center font-aeonik-light text-lg text-pronix-blue not-italic outline-none md:text-2xl"
                    />
                </label>
            </div>
        </div>
    );
}

export default ProjectsPriceRangeFilter;
