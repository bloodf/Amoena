import { useEffect, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-toml";
import { useTheme } from "@/hooks/use-theme";
import { getEditorLanguage } from "./utils";

export function HighlightedCode({ content, fileName }: { content: string; fileName: string }) {
  const { theme } = useTheme();
  const language = getEditorLanguage(fileName);

  useEffect(() => {
    const prismThemeId = "prism-theme";
    let link = document.getElementById(prismThemeId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = prismThemeId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href =
      theme === "dark"
        ? "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css"
        : "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism.min.css";
  }, [theme]);

  const html = useMemo(() => {
    const grammar = Prism.languages[language];
    if (!grammar) return Prism.util.encode(content) as string;
    return Prism.highlight(content, grammar, language);
  }, [content, language]);

  const lines = content.split("\n");

  return (
    <div className="flex">
      <div className="flex-shrink-0 select-none py-4 pl-4 pr-2">
        {lines.map((_, index) => (
          <div key={index} className="min-w-[2ch] text-right font-mono text-[12px] leading-relaxed text-muted-foreground/40">
            {index + 1}
          </div>
        ))}
      </div>
      <pre className="flex-1 whitespace-pre-wrap bg-transparent p-4 pl-2 font-mono text-[12px] leading-relaxed">
        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
