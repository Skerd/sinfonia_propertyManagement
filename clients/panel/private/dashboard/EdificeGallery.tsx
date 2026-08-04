import { useEffect, useState, useRef } from "react";
import { compose } from "redux";
import { DashboardEdificeCard } from "@propertyManagementModule/components/custom/dashboard/edificeCard.tsx";
import type { Edifice } from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";

const CARDS_PER_PAGE = 6;
const CARD_MIN_WIDTH = 280;

export interface EdificeGalleryProps extends WithLanguageType {
  selectedEdificeId: string | null;
  onSelectEdifice: (edifice: Edifice) => void;
  onEdificesLoaded?: (edifices: Edifice[]) => void;
}

function EdificeGalleryInner({
  resolveLanguageKey,
  selectedEdificeId,
  onSelectEdifice,
  onEdificesLoaded,
}: EdificeGalleryProps) {
  const [edifices, setEdifices] = useState<Edifice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(total / CARDS_PER_PAGE) || 1;
  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const offset = page * CARDS_PER_PAGE;
    apiClient
      .post<TableResponse<Edifice>>(
        "/api/realEstate/edifice",
        { offset, limit: CARDS_PER_PAGE }
      )
      .then((res) => {
        if (!cancelled && res.data?.data) {
          const data = res.data.data;
          setEdifices(data);
          setTotal(res.data.total ?? data.length);
          if (page === 0 && data.length > 0) {
            onEdificesLoaded?.(data);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setEdifices([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const goPrev = () => {
    if (canGoPrev) setPage((p) => p - 1);
  };

  const goNext = () => {
    if (canGoNext) setPage((p) => p + 1);
  };

  const scrollBy = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (loading && edifices.length === 0) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{resolveLanguageKey("edificesTitle") ?? "Edifices"}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              goPrev();
              scrollBy("left");
            }}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-16 text-center">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              goNext();
              scrollBy("right");
            }}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto overflow-y-hidden pb-2",
          "snap-x snap-mandatory touch-pan-x",
          "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        )}
        style={{ scrollbarWidth: "thin" }}
      >
        {edifices.map((edifice) => (
          <div
            key={edifice._id}
            className="shrink-0 snap-center"
            style={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MIN_WIDTH }}
          >
            <DashboardEdificeCard
              edifice={edifice}
              isSelected={selectedEdificeId === edifice._id}
              onClick={() => onSelectEdifice(edifice)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const EdificeGallery = compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/dashboard/EdificeGallery.tsx")
)(EdificeGalleryInner);
