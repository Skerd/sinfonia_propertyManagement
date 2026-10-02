import {type ComponentType, useEffect, useMemo, useRef} from "react";
import {compose} from "redux";
import {Link, useParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {
    PUBLIC_BODY,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {PublicBlogSingleFormResponseType} from "armonia/src/modules/core/api/auxiliary/public/blog/blogSingle.form.response.type.ts";

type ArticleFilter = {slug: string};

type ArticlePageProps = WithAxiosType<PublicBlogSingleFormResponseType, ArticleFilter> & WithLanguageType;

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

function BlogArticlePageInner({
    data,
    loading,
    error,
    onFilterChange,
    resolveLanguageKey,
    languageCode,
}: ArticlePageProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const {slug = ""} = useParams();
    const requestedSlugRef = useRef("");

    useEffect(() => {
        if (!slug) {
            requestedSlugRef.current = "";
            return;
        }
        if (requestedSlugRef.current === slug) return;
        requestedSlugRef.current = slug;
        onFilterChange({slug});
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [slug]);

    const post = data?.post;
    const cover = resolveMarketingMediaUrl(post?.mainImage);
    const gallery = useMemo(
        () =>
            (post?.imageGallery ?? [])
                .map((url) => resolveMarketingMediaUrl(url))
                .filter((url): url is string => Boolean(url)),
        [post?.imageGallery],
    );
    const published = formatPublishedAt(post?.publishedAt, languageCode);

    return (
        <PublicPageShell nodeId="core:blog-article" nodeName="Blog article">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection>
                <Link
                    to="/blog"
                    className="font-aeonik-medium text-xs uppercase tracking-[0.2em] text-pronix-ink-muted transition hover:text-pronix-ink"
                >
                    {t("backToBlog")}
                </Link>

                {!slug ? (
                    <p className={`mt-10 ${PUBLIC_BODY}`}>{t("missingParam")}</p>
                ) : error ? (
                    <p className={`mt-10 ${PUBLIC_BODY}`}>{t("notFound")}</p>
                ) : loading && !post ? (
                    <div className="mt-20 flex justify-center">
                        <Loader />
                    </div>
                ) : !post ? (
                    <p className={`mt-10 ${PUBLIC_BODY}`}>{t("notFound")}</p>
                ) : (
                    <article className="mt-10 max-w-4xl">
                        {post.category?.name ? (
                            <p className="font-aeonik-medium text-xs uppercase tracking-[0.24em] text-pronix-ink-muted">
                                {post.category.name}
                            </p>
                        ) : null}
                        <h1 className={`mt-4 ${PUBLIC_TITLE}`}>{post.title}</h1>
                        <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 ${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>
                            {published ? <time dateTime={post.publishedAt}>{published}</time> : null}
                            {post.authorName ? <span>{post.authorName}</span> : null}
                        </div>
                        {cover ? (
                            <img src={cover} alt="" className="mt-10 w-full rounded-[5px] object-cover" />
                        ) : null}
                        {post.excerpt ? (
                            <p className={`mt-8 ${PUBLIC_SUBTITLE}`}>{post.excerpt}</p>
                        ) : null}
                        <p className={`mt-8 whitespace-pre-wrap ${PUBLIC_BODY}`}>{post.content}</p>
                        {gallery.length > 0 ? (
                            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
                                {gallery.map((url) => (
                                    <img key={url} src={url} alt="" className="w-full rounded-[5px] object-cover" />
                                ))}
                            </div>
                        ) : null}
                    </article>
                )}
            </PublicSection>
            <PublicSection flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withAxios<PublicBlogSingleFormResponseType, ArticleFilter>(
        {method: "post", url: "/api/auxiliary/public/blog/single", data: {}},
        true,
    ),
    withLanguage("src/modules/propertyManagement/clients/client/public/blog/article.tsx"),
    withDebug(true, true),
)(BlogArticlePageInner) as unknown as ComponentType;
