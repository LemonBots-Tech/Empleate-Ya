"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type OfferKind = "coaching" | "entrepreneurs" | "business";

const copy = {
  es: {
    coaching: {
      eyebrow: "Acompañamiento personalizado",
      title: "Coaching 1o1",
      description: "Sesiones individuales para clarificar objetivo profesional, revisar estrategia, fortalecer confianza y convertir avances en acciones concretas.",
      points: ["Diagnóstico de momento profesional", "Plan de avance entre sesiones", "Revisión de CV, LinkedIn o entrevista según necesidad"],
      cta: "Solicitar información",
    },
    entrepreneurs: {
      eyebrow: "Ruta para construir independencia",
      title: "Emprendedores",
      description: "Herramientas para transformar experiencia profesional en una propuesta de valor, validar ideas, ordenar servicios y preparar mensajes comerciales.",
      points: ["Definición de oferta y cliente ideal", "Narrativa profesional para vender con claridad", "Plan de primeros experimentos comerciales"],
      cta: "Explorar ruta",
    },
    business: {
      eyebrow: "Soluciones para organizaciones",
      title: "Servicios para empresas",
      description: "Programas para recolocación, empleabilidad interna, preparación de talento, marca empleadora y acompañamiento en transición profesional.",
      points: ["Workshops y rutas grupales", "Reportes de avance y entregables", "Programas adaptables por población y objetivo"],
      cta: "Contactar equipo",
    },
  },
  en: {
    coaching: {
      eyebrow: "Personalized support",
      title: "1:1 Coaching",
      description: "Individual sessions to clarify professional goals, review strategy, strengthen confidence, and turn progress into concrete action.",
      points: ["Professional moment diagnosis", "Action plan between sessions", "Resume, LinkedIn, or interview review as needed"],
      cta: "Request information",
    },
    entrepreneurs: {
      eyebrow: "Path to build independence",
      title: "Entrepreneurs",
      description: "Tools to turn professional experience into a value proposition, validate ideas, organize services, and prepare commercial messages.",
      points: ["Offer and ideal customer definition", "Professional narrative to sell clearly", "First commercial experiment plan"],
      cta: "Explore path",
    },
    business: {
      eyebrow: "Solutions for organizations",
      title: "Business services",
      description: "Programs for outplacement, internal employability, talent preparation, employer branding, and professional transition support.",
      points: ["Workshops and group paths", "Progress reports and deliverables", "Programs adaptable by population and goal"],
      cta: "Contact team",
    },
  },
} as const;

export function OfferPlaceholder({ kind }: { kind: OfferKind }) {
  const { language } = useLanguage();
  const t = copy[language][kind];

  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.eyebrow}</p>
      <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] text-slate-950">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{t.description}</p>
      <div className="mt-8 grid gap-3">
        {t.points.map((point) => (
          <div key={point} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-500" />
            {point}
          </div>
        ))}
      </div>
      <Button className="mt-8 gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-3 text-white hover:bg-[var(--brand-primary-strong)]">
        {t.cta} <ArrowRight size={18} />
      </Button>
    </section>
  );
}
