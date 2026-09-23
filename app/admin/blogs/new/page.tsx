import { BlogBuilderForm } from "@/components/admin/blog-builder-form";
import { db } from "@/lib/db";

type SearchParams = Promise<{ edit?: string }>;

export const dynamic = "force-dynamic";

export default async function NewOrEditBlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const editId = params.edit;

  const initialBlog = editId
    ? await db.blogPost.findUnique({
        where: { id: editId },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      })
    : null;

  const initialData = initialBlog
    ? {
        id: initialBlog.id,
        title: initialBlog.title,
        slug: initialBlog.slug,
        excerpt: initialBlog.excerpt ?? "",
        isPublished: initialBlog.isPublished,
        sections: initialBlog.sections.map((section) => {
          const content =
            typeof section.content === "object" && section.content ? section.content : {};
          return {
            type: section.type,
            title: String((content as Record<string, unknown>).title ?? ""),
            text: String((content as Record<string, unknown>).text ?? ""),
            imageUrl: String((content as Record<string, unknown>).imageUrl ?? ""),
          };
        }),
      }
    : null;

  return <BlogBuilderForm initialData={initialData} />;
}
