import {type MouseEvent} from "react";
import {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PropertyListingCardUnit} from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {resolveProjectCardImages} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import {usePublicFavorites} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoriteHeartIcon from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartIcon.tsx";
import type {PublicFavoriteProject} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesTypes.ts";

const heartButtonClassName =
    "pointer-events-auto relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(24,24,24,0.1)] bg-white";

type PublicFavoriteHeartButtonProps =
    | {
          kind: "project";
          project: PublicFavoriteProject | MarketingProject;
          addLabel: string;
          removeLabel: string;
          nodeId?: string;
      }
    | {
          kind: "unit";
          projectId: string;
          projectName?: string;
          unit: PropertyListingCardUnit;
          addLabel: string;
          removeLabel: string;
          nodeId?: string;
      };

function PublicFavoriteHeartButton(props: PublicFavoriteHeartButtonProps) {
    const {isProjectFavorite, isUnitFavorite, toggleProjectFavorite, toggleUnitFavorite} = usePublicFavorites();

    const active =
        props.kind === "project"
            ? isProjectFavorite(props.project._id)
            : isUnitFavorite(props.projectId, props.unit._id);

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (props.kind === "project") {
            const project = props.project;
            const mainImage =
                "imageGallery" in project
                    ? resolveProjectCardImages(project as MarketingProject)[0]
                    : project.mainImage;
            toggleProjectFavorite({
                _id: project._id,
                name: project.name,
                location: project.location,
                mainImage,
                minSharePrice: project.minSharePrice,
            });
            return;
        }

        toggleUnitFavorite({
            projectId: props.projectId,
            unitId: props.unit._id,
            name: props.unit.name,
            projectName: props.projectName,
            imageUrl: props.unit.imageUrl,
            price: props.unit.price,
            floorLabel: props.unit.floorLabel,
        });
    }

    return (
        <button
            type="button"
            className={heartButtonClassName}
            data-node-id={props.nodeId}
            aria-pressed={active}
            aria-label={active ? props.removeLabel : props.addLabel}
            onClick={handleClick}
        >
            <PublicFavoriteHeartIcon active={active} />
        </button>
    );
}

export default PublicFavoriteHeartButton;
