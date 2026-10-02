import {type ComponentType, useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {
    PUBLIC_BODY,
    PUBLIC_GRID_PROJECTS_GALLERY,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {
    PublicBlogFormResponseType,
} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";

type BlogFilter = {
    categorySlug?: string;
};

type BlogPageProps = WithAxiosType<PublicBlogFormResponseType, BlogFilter> & WithLanguageType;

function formatPublishedAt(value: string | undefined, languageCode: string) {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString(languageCode.replace("_", "-"), {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function BlogPageInner({
    data,
    loading,
    error,
    onFilterChange,
    resolveLanguageKey,
    languageCode,
}: BlogPageProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const [categorySlug, setCategorySlug] = useState("");

    useEffect(() => {
        const next: BlogFilter = {};
        if (categorySlug) next.categorySlug = categorySlug;
        onFilterChange(next);
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [categorySlug]);

    const posts = useMemo(() => data?.posts ?? [], [data?.posts]);
    const categories = useMemo(() => data?.categories ?? [], [data?.categories]);
    const showLoader = loading && posts.length === 0 && !error;

    return (
        <PublicPageShell nodeId="core:blog" nodeName="Blog">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection>
                <p className="font-aeonik-medium text-xs uppercase tracking-[0.24em] text-pronix-ink-muted">{t("eyebrow")}</p>
                <h1 className={`mt-4 ${PUBLIC_TITLE}`}>{t("title")}</h1>
                <p className={`mt-4 max-w-2xl ${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>{t("lead")}</p>

                {categories.length > 0 ? (
                    <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
                        <span className={`${PUBLIC_BODY}`}>{t("filterBy")}</span>
                        <button
                            type="button"
                            onClick={() => setCategorySlug("")}
                            className={cn(
                                "rounded-[5px] border px-4 py-2 font-aeonik-medium text-sm transition-colors",
                                !categorySlug
                                    ? "border-pronix-ink bg-pronix-ink text-white"
                                    : "border-pronix-border text-pronix-ink hover:border-pronix-ink",
                            )}
                        >
                            {t("allCategories")}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category._id}
                                type="button"
                                onClick={() => setCategorySlug(category.slug)}
                                className={cn(
                                    "rounded-[5px] border px-4 py-2 font-aeonik-medium text-sm transition-colors",
                                    categorySlug === category.slug
                                        ? "border-pronix-ink bg-pronix-ink text-white"
                                        : "border-pronix-border text-pronix-ink hover:border-pronix-ink",
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                ) : null}

                {showLoader ? (
                    <div className="mt-20 flex justify-center">
                        <Loader />
                    </div>
                ) : error ? (
                    <p className={`mt-12 ${PUBLIC_BODY}`}>{t("loadError")}</p>
                ) : posts.length === 0 ? (
                    <p className={`mt-12 ${PUBLIC_BODY}`}>{t("empty")}</p>
                ) : (
                    <div className={`mt-12 ${PUBLIC_GRID_PROJECTS_GALLERY}`}>
                        {posts.map((post) => {
                            const cover = resolveMarketingMediaUrl(post.mainImage);
                            const published = formatPublishedAt(post.publishedAt, languageCode);
                            return (
                                <Link
                                    key={post._id}
                                    to={`/blog/${post.slug}`}
                                    className="group flex min-w-0 flex-col overflow-hidden rounded-[5px] border border-pronix-border bg-white transition-colors hover:border-pronix-ink"
                                >
                                    {cover ? (
                                        <img
                                            src={cover}
                                            alt=""
                                            className="aspect-[16/10] w-full object-cover"
                                        />
                                    ) : null}
                                    <div className="flex flex-1 flex-col gap-3 p-5">
                                        {post.category?.name ? (
                                            <p className="font-aeonik-medium text-xs uppercase tracking-[0.2em] text-pronix-ink-muted">
                                                {post.category.name}
                                            </p>
                                        ) : null}
                                        <h2 className={PUBLIC_HEADING}>
                                            {post.title}
                                        </h2>
                                        {published ? (
                                            <time dateTime={post.publishedAt} className="text-sm text-pronix-ink-muted">
                                                {published}
                                            </time>
                                        ) : null}
                                        {post.excerpt ? (
                                            <p className={`${PUBLIC_BODY} line-clamp-3`}>{post.excerpt}</p>
                                        ) : null}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </PublicSection>
            <PublicSection flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withAxios<PublicBlogFormResponseType, BlogFilter>(
        {method: "post", url: "/api/auxiliary/public/blog", data: {}},
        false,
    ),
    withLanguage("src/modules/propertyManagement/clients/client/public/blog/index.tsx"),
    withDebug(true, true),
)(BlogPageInner) as unknown as ComponentType;
