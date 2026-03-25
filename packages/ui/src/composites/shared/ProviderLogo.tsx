import amoenaLogo from "@/assets/logos/amoena-ai.png";
import claudeLogo from "@/assets/logos/claude-code.png";
import opencodeLightLogo from "@/assets/logos/opencode-light.svg";
import opencodeDarkLogo from "@/assets/logos/opencode-dark.svg";
import codexLogo from "@/assets/logos/codex-cli.png";
import geminiLogo from "@/assets/logos/gemini-cli.png";
import ollamaLogo from "@/assets/logos/ollama.png";

export const providerLogos: Record<string, string> = {
  amoena: amoenaLogo,
  claude: claudeLogo,
  opencode: opencodeLightLogo,
  codex: codexLogo,
  gemini: geminiLogo,
  ollama: ollamaLogo,
};

const providerLogosDark: Record<string, string> = {
  opencode: opencodeDarkLogo,
};

interface ProviderLogoProps {
  provider: string;
  size?: number;
  className?: string;
  variant?: "light" | "dark" | "auto";
}

export function ProviderLogo({ provider, size = 24, className, variant = "auto" }: ProviderLogoProps) {
  const darkSrc = providerLogosDark[provider];
  const lightSrc = providerLogos[provider];
  if (!lightSrc) return null;

  if (variant === "auto" && darkSrc) {
    return (
      <>
        <img
          src={lightSrc}
          alt={`${provider} logo`}
          width={size}
          height={size}
          className={`dark:hidden ${className || ""}`}
          style={{ width: size, height: size, objectFit: "contain" }}
        />
        <img
          src={darkSrc}
          alt={`${provider} logo`}
          width={size}
          height={size}
          className={`hidden dark:block ${className || ""}`}
          style={{ width: size, height: size, objectFit: "contain" }}
        />
      </>
    );
  }

  const src = variant === "dark" && darkSrc ? darkSrc : lightSrc;
  return (
    <img
      src={src}
      alt={`${provider} logo`}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}