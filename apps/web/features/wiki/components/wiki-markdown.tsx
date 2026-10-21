import Link from "next/link";
import Markdown from "react-markdown";

export function WikiMarkdown({ body }: { body: string }) {
  return (
    <div className="min-w-0 break-words text-base leading-8 text-muted [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-phosphor [&_blockquote]:pl-5 [&_code]:font-mono [&_code]:text-paper [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-paper [&_h2:first-child]:mt-0 [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:text-paper [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:overflow-x-auto [&_strong]:font-medium [&_strong]:text-paper [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
      <Markdown
        allowedElements={["h2", "h3", "p", "a", "strong", "em", "ul", "ol", "li", "blockquote", "code", "pre", "br", "hr"]}
        components={{
          a: ({ href, children }) => href ? (
            href.startsWith("/") && !href.startsWith("//") ? (
              <Link className="text-link text-phosphor underline underline-offset-4" href={href}>{children}</Link>
            ) : (
              <a className="text-link text-phosphor underline underline-offset-4" href={href} rel="noopener noreferrer">{children}</a>
            )
          ) : <span>{children}</span>,
        }}
        skipHtml
      >
        {body}
      </Markdown>
    </div>
  );
}
