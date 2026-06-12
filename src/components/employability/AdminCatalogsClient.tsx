"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Pencil, Plus, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type CatalogItem = {
  id: string;
  catalogCode: string;
  code: string;
  labelEs: string;
  labelEn?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  sortOrder: number;
  status: "active" | "inactive" | "archived";
};

type Catalog = {
  code: string;
  name: string;
  description?: string;
  locked: boolean;
  items: CatalogItem[];
};

type CatalogFormState = {
  id?: string;
  catalogCode: string;
  code: string;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
  sortOrder: number;
  status: "active" | "inactive" | "archived";
};

const copy = {
  es: {
    title: "Administración de catálogos",
    description: "Alta, edición y archivo de valores maestros usados por perfiles, empresas, emprendedores, campañas y permisos.",
    denied: "Necesitas iniciar sesión como super admin para administrar catálogos.",
    devLogin: "Activar demo admin",
    loading: "Cargando catálogos...",
    catalog: "Catálogo",
    add: "Agregar valor",
    edit: "Editar",
    archive: "Archivar",
    save: "Guardar",
    reset: "Limpiar",
    code: "Código técnico",
    labelEs: "Etiqueta en español",
    labelEn: "Etiqueta en inglés",
    descriptionEs: "Descripción en español",
    descriptionEn: "Descripción en inglés",
    sortOrder: "Orden",
    status: "Estado",
    active: "Activo",
    inactive: "Inactivo",
    archived: "Archivado",
    items: "valores",
    empty: "No hay valores en este catálogo.",
    saved: "Catálogo actualizado.",
  },
  en: {
    title: "Catalog administration",
    description: "Create, edit, and archive master values used by profiles, companies, entrepreneurs, campaigns, and permissions.",
    denied: "You need to sign in as super admin to manage catalogs.",
    devLogin: "Activate admin demo",
    loading: "Loading catalogs...",
    catalog: "Catalog",
    add: "Add value",
    edit: "Edit",
    archive: "Archive",
    save: "Save",
    reset: "Reset",
    code: "Technical code",
    labelEs: "Spanish label",
    labelEn: "English label",
    descriptionEs: "Spanish description",
    descriptionEn: "English description",
    sortOrder: "Order",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    archived: "Archived",
    items: "values",
    empty: "There are no values in this catalog.",
    saved: "Catalog updated.",
  },
} as const;

function emptyForm(catalogCode: string): CatalogFormState {
  return {
    catalogCode,
    code: "",
    labelEs: "",
    labelEn: "",
    descriptionEs: "",
    descriptionEn: "",
    sortOrder: 100,
    status: "active",
  };
}

export function AdminCatalogsClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState("user_types");
  const [form, setForm] = useState<CatalogFormState>(emptyForm("user_types"));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCatalog = useMemo(
    () => catalogs.find((catalog) => catalog.code === selectedCatalogCode) ?? catalogs[0],
    [catalogs, selectedCatalogCode],
  );

  async function loadCatalogs() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/catalogs");
    const data = await response.json();
    if (!response.ok) {
      setError(t.denied);
      setLoading(false);
      return;
    }
    setCatalogs(data.catalogs);
    const firstCode = data.catalogs[0]?.code ?? "user_types";
    setSelectedCatalogCode((current) => data.catalogs.some((catalog: Catalog) => catalog.code === current) ? current : firstCode);
    setLoading(false);
  }

  async function activateDevAdmin() {
    const response = await fetch("/api/auth/dev-admin-login", { method: "POST" });
    if (!response.ok) {
      setError(t.denied);
      return;
    }
    await loadCatalogs();
  }

  useEffect(() => {
    void loadCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateForm<K extends keyof CatalogFormState>(key: K, value: CatalogFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm(catalogCode = selectedCatalogCode) {
    setForm(emptyForm(catalogCode));
    setMessage(null);
    setError(null);
  }

  function editItem(item: CatalogItem) {
    setForm({
      id: item.id,
      catalogCode: item.catalogCode,
      code: item.code,
      labelEs: item.labelEs,
      labelEn: item.labelEn ?? "",
      descriptionEs: item.descriptionEs ?? "",
      descriptionEn: item.descriptionEn ?? "",
      sortOrder: item.sortOrder,
      status: item.status,
    });
  }

  async function saveItem() {
    setError(null);
    setMessage(null);
    const payload = {
      ...form,
      labelEn: form.labelEn || undefined,
      descriptionEs: form.descriptionEs || undefined,
      descriptionEn: form.descriptionEn || undefined,
    };
    const response = await fetch("/api/admin/catalogs", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "ERROR");
      return;
    }
    setMessage(t.saved);
    resetForm(form.catalogCode);
    await loadCatalogs();
  }

  async function archiveItem(item: CatalogItem) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin/catalogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "ERROR");
      return;
    }
    setMessage(t.saved);
    await loadCatalogs();
  }

  if (loading) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">{t.loading}</div>;
  }

  if (error && !catalogs.length) {
    return (
      <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6">
        <p className="font-bold text-red-700">{error}</p>
        <Button type="button" onClick={activateDevAdmin} className="mt-4 bg-slate-950 text-white">{t.devLogin}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">Super admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{t.description}</p>
        </div>
        <div className="min-w-72">
          <Label>{t.catalog}</Label>
          <Select
            value={selectedCatalogCode}
            onChange={(event) => {
              setSelectedCatalogCode(event.target.value);
              resetForm(event.target.value);
            }}
          >
            {catalogs.map((catalog) => <option key={catalog.code} value={catalog.code}>{catalog.name}</option>)}
          </Select>
        </div>
      </header>

      {message ? <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">{selectedCatalog?.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedCatalog?.description}</p>
            </div>
            <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--brand-primary)]">{selectedCatalog?.items.length ?? 0} {t.items}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">ES</th>
                  <th className="px-4 py-3">EN</th>
                  <th className="px-4 py-3">{t.status}</th>
                  <th className="px-4 py-3">{t.sortOrder}</th>
                  <th className="px-4 py-3 text-right">{t.edit}</th>
                </tr>
              </thead>
              <tbody>
                {selectedCatalog?.items.length ? selectedCatalog.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">{item.code}</td>
                    <td className="px-4 py-3 font-bold text-slate-950">{item.labelEs}</td>
                    <td className="px-4 py-3 text-slate-600">{item.labelEn}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{t[item.status]}</span></td>
                    <td className="px-4 py-3 text-slate-500">{item.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" onClick={() => editItem(item)} className="bg-slate-950 px-3 py-2 text-xs text-white"><Pencil size={14} /> {t.edit}</Button>
                        {item.status !== "archived" ? (
                          <Button type="button" onClick={() => archiveItem(item)} className="bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"><Archive size={14} /> {t.archive}</Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">{t.empty}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950"><Plus className="text-[var(--brand-primary)]" /> {form.id ? t.edit : t.add}</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <Label>{t.code}</Label>
              <Input value={form.code} onChange={(event) => updateForm("code", event.target.value)} placeholder="company_admin" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>{t.labelEs}</Label><Input value={form.labelEs} onChange={(event) => updateForm("labelEs", event.target.value)} /></div>
              <div><Label>{t.labelEn}</Label><Input value={form.labelEn} onChange={(event) => updateForm("labelEn", event.target.value)} /></div>
            </div>
            <div><Label>{t.descriptionEs}</Label><Textarea value={form.descriptionEs} onChange={(event) => updateForm("descriptionEs", event.target.value)} /></div>
            <div><Label>{t.descriptionEn}</Label><Textarea value={form.descriptionEn} onChange={(event) => updateForm("descriptionEn", event.target.value)} /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>{t.sortOrder}</Label><Input type="number" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", Number(event.target.value))} /></div>
              <div>
                <Label>{t.status}</Label>
                <Select value={form.status} onChange={(event) => updateForm("status", event.target.value as CatalogFormState["status"])}>
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                  <option value="archived">{t.archived}</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" onClick={saveItem} className="bg-[var(--brand-primary)] text-white"><Save size={16} /> {t.save}</Button>
              <Button type="button" onClick={() => resetForm()} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"><RotateCcw size={16} /> {t.reset}</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
