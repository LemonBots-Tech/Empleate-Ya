"use client";

import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const gatewayCopy = {
  es: {
    title: "Gateway orquestador",
    description: "Cuéntanos qué necesitas una sola vez. El Gateway detecta tu intención, valida insumos y créditos, y combina uno o más asistentes para construir el plan adecuado.",
  },
  en: {
    title: "Orchestrator Gateway",
    description: "Tell us what you need once. The Gateway detects your intent, validates inputs and credits, and combines one or more assistants to build the right plan.",
  },
} as const;

export function GatewayPageClient({ selectedModule }: { selectedModule?: string }) {
  const { language } = useLanguage();
  const t = gatewayCopy[language];

  return (
    <>
      <h1 className="text-4xl font-black tracking-tight text-slate-950">{t.title}</h1>
      <p className="mt-3 max-w-3xl text-slate-600">{t.description}</p>
      <div className="mt-8"><PromptGatewayClient selectedModule={selectedModule} /></div>
    </>
  );
}
