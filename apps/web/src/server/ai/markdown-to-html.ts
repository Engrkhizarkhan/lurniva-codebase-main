import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

/**
 * Compiles an AI answer's markdown into the HTML string `AiDocument.content`
 * needs — TipTap's `useEditor` is seeded with HTML, not markdown. Every
 * plugin in this chain is synchronous, so `processSync` is safe here.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

export function markdownToHtml(markdown: string): string {
  return String(processor.processSync(markdown));
}
