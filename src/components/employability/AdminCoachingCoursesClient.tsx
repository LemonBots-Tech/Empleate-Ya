"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpenCheck, Edit3, Save, Search, Trash2, UserPlus } from "lucide-react";
import { skills, type SkillId } from "@/ai/skillRegistry";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type CourseStatus = "activo" | "pendiente" | "borrado_logico";
type CourseUse = "coach_partner_group" | "internal_1o1_group" | "outplacement_campaign";
type SearchMode = "capture" | "edit" | "delete";

type CourseRecord = {
  id: string;
  name: string;
  organization: string;
  organizationType: "Empleate YA" | "Coach Partner" | "Outplacement";
  createdBy: string;
  creatorRole: string;
  use: CourseUse;
  selectedAvatarIds: SkillId[];
  creditsPerParticipant: number;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

const storageKey = "empleate-ya-admin-coaching-courses-v1";

const copy = {
  es: {
    eyebrow: "Programas de capacitacion / outplacement",
    title: "Cursos de Coaching & Outplacement",
    description: "Define cursos reutilizables con los agentes permitidos para Empleate YA, Coach Partner u Outplacement. Despues podran asignarse a grupos o campanas y calcular sus creditos.",
    rule: "Regla: un curso solo puede usar agentes habilitados para la organizacion o para el usuario que lo crea. El selector temporal de perfil ayuda a validar esta logica hasta conectar login y Supabase.",
    create: "Crear",
    edit: "Buscar para editar",
    deleteSearch: "Buscar para borrar",
    save: "Guardar datos",
    confirmDelete: "Confirmar borrado logico",
    search: "Buscar",
    searchPlaceholder: "Curso, empresa, usuario, agente...",
    filters: "Filtros",
    status: "Estado",
    type: "Tipo organizacion",
    all: "Todos",
    found: "Cursos registrados",
    listHelp: "Selecciona un registro para editarlo o marcarlo con borrado logico. La tabla conserva scroll horizontal y vertical.",
    formTitle: "Captura y mantenimiento del curso",
    selected: "Seleccionado",
    noSelected: "Crea un curso nuevo o busca uno existente.",
    selectedForEdit: "Curso seleccionado. Ajusta los datos y guarda.",
    selectedForDelete: "Curso seleccionado. Confirma el borrado logico si corresponde.",
    saved: "Curso guardado para pruebas.",
    deleted: "Curso marcado como borrado logico. No se elimino definitivamente.",
    identity: "Datos del curso",
    name: "Nombre del curso",
    organization: "Empresa / organizacion",
    organizationType: "Tipo de organizacion",
    createdBy: "Usuario que lo crea",
    creatorRole: "Rol del usuario",
    use: "Uso del curso",
    avatars: "Agentes del curso",
    credits: "Creditos por participante",
    createdAt: "Fecha de creacion",
    updatedAt: "Ultimo cambio",
    notes: "Notas internas",
    statusActive: "activo",
    statusPending: "pendiente",
    statusDeleted: "borrado lógico",
    zeroAvatars: "Selecciona al menos un agente para sumar creditos.",
    allowedHelp: "Agentes disponibles segun el tipo de organizacion o permisos del usuario creador.",
    columns: ["Seleccion", "Curso", "Empresa", "Tipo", "Usuario creador", "Uso", "Agentes", "Creditos", "Estado", "Creacion", "Ultimo cambio"],
    uses: {
      coach_partner_group: "Grupo Coach Partner",
      internal_1o1_group: "Grupo Coaching 1o1",
      outplacement_campaign: "Campaña Outplacement",
    },
  },
  en: {
    eyebrow: "Training / outplacement programs",
    title: "Coaching & Outplacement Courses",
    description: "Define reusable courses with the agents allowed for Empleate YA, Coach Partner, or Outplacement. They can later be assigned to groups or campaigns and calculate credits.",
    rule: "Rule: a course can only use agents enabled for the organization or for the user creating it. The temporary profile selector helps validate this logic until login and Supabase are connected.",
    create: "Create",
    edit: "Find to edit",
    deleteSearch: "Find to delete",
    save: "Save data",
    confirmDelete: "Confirm logical delete",
    search: "Search",
    searchPlaceholder: "Course, company, user, agent...",
    filters: "Filters",
    status: "Status",
    type: "Organization type",
    all: "All",
    found: "Registered courses",
    listHelp: "Select a record to edit it or mark it with logical deletion. The table keeps horizontal and vertical scrolling.",
    formTitle: "Course capture and maintenance",
    selected: "Selected",
    noSelected: "Create a new course or search an existing one.",
    selectedForEdit: "Course selected. Adjust data and save.",
    selectedForDelete: "Course selected. Confirm logical deletion if appropriate.",
    saved: "Course saved for testing.",
    deleted: "Course marked as logical delete. It was not permanently removed.",
    identity: "Course data",
    name: "Course name",
    organization: "Company / organization",
    organizationType: "Organization type",
    createdBy: "Created by",
    creatorRole: "User role",
    use: "Course use",
    avatars: "Course agents",
    credits: "Credits per participant",
    createdAt: "Created at",
    updatedAt: "Last change",
    notes: "Internal notes",
    statusActive: "active",
    statusPending: "pending",
    statusDeleted: "logical delete",
    zeroAvatars: "Select at least one agent to add credits.",
    allowedHelp: "Available agents according to organization type or creator user permissions.",
    columns: ["Select", "Course", "Company", "Type", "Creator", "Use", "Agents", "Credits", "Status", "Created", "Last change"],
    uses: {
      coach_partner_group: "Coach Partner group",
      internal_1o1_group: "1:1 Coaching group",
      outplacement_campaign: "Outplacement campaign",
    },
  },
} as const;

const organizations = {
  "Empleate YA": ["Empleate YA"],
  "Coach Partner": ["Partner Ejecutivo Norte", "Partner Bajio", "Partner Carrera Global"],
  Outplacement: ["Empresa Demo Outplacement", "Grupo Industrial Norte", "Servicios Financieros Delta"],
} as const;

const roleOptions = [
  "Super Admin",
  "Apoyo coach partner",
  "Operativo outplacement",
  "Coach interno 1o1",
  "Coach partner principal",
  "Coach partner colaborador",
  "Administrador RH",
  "Apoyo administrativo RH",
] as const;

const allowedAvatarProfiles: Record<CourseRecord["organizationType"], SkillId[]> = {
  "Empleate YA": skills.map((skill) => skill.id),
  "Coach Partner": ["scorex", "optim", "mr_wow", "mr_boost_linked", "tommy_lee_picture", "lumo", "boost_me", "new_job_challenge", "miss_quest"],
  Outplacement: ["scorex", "optim", "scorex_360", "mr_wow", "mr_boost_linked", "new_job_challenge", "indiana_jobs", "miss_quest", "recharge"],
};

const initialCourses: CourseRecord[] = [
  {
    id: "course-cv-partner",
    name: "CV estrategico Coach Partner",
    organization: "Partner Ejecutivo Norte",
    organizationType: "Coach Partner",
    createdBy: "Mariana Soto",
    creatorRole: "Coach partner principal",
    use: "coach_partner_group",
    selectedAvatarIds: ["scorex", "optim", "mr_wow", "mr_boost_linked"],
    creditsPerParticipant: creditsFor(["scorex", "optim", "mr_wow", "mr_boost_linked"]),
    status: "activo",
    createdAt: "2026-06-15",
    updatedAt: "2026-06-15",
    notes: "Programa base para grupos de empleabilidad con CV y LinkedIn.",
  },
  {
    id: "course-outplacement-90",
    name: "Outplacement profesional 90",
    organization: "Empresa Demo Outplacement",
    organizationType: "Outplacement",
    createdBy: "Ana Torres",
    creatorRole: "Administrador RH",
    use: "outplacement_campaign",
    selectedAvatarIds: ["scorex", "optim", "new_job_challenge", "miss_quest", "mr_wow"],
    creditsPerParticipant: creditsFor(["scorex", "optim", "new_job_challenge", "miss_quest", "mr_wow"]),
    status: "activo",
    createdAt: "2026-06-12",
    updatedAt: "2026-06-12",
    notes: "Curso reusable para campanas de recolocacion profesional.",
  },
];

export function AdminCoachingCoursesClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [courses, setCourses] = useState<CourseRecord[]>(initialCourses);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchMode, setSearchMode] = useState<SearchMode>("capture");
  const [notice, setNotice] = useState("");
  const [organizationType, setOrganizationType] = useState<CourseRecord["organizationType"]>("Empleate YA");
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<SkillId[]>(["scorex", "optim"]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CourseRecord[];
        setCourses(parsed);
      } catch {
        setCourses(initialCourses);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(courses));
  }, [courses]);

  const selectedCourse = courses.find((course) => course.id === selectedId);
  const allowedAvatarIds = allowedAvatarProfiles[organizationType];
  const selectedCredits = creditsFor(selectedAvatarIds);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      const avatarNames = course.selectedAvatarIds.map((id) => skillName(id)).join(" ");
      const matchesText = !normalized || `${Object.values(course).join(" ")} ${avatarNames}`.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      const matchesType = typeFilter === "all" || course.organizationType === typeFilter;
      return matchesText && matchesStatus && matchesType;
    });
  }, [courses, query, statusFilter, typeFilter]);

  function createNew() {
    setSelectedId("");
    setOrganizationType("Empleate YA");
    setSelectedAvatarIds(["scorex", "optim"]);
    setSearchMode("capture");
    setNotice("");
  }

  function selectForMaintenance(course: CourseRecord) {
    const nextMode = searchMode;
    setSelectedId(course.id);
    setOrganizationType(course.organizationType);
    setSelectedAvatarIds(course.selectedAvatarIds);
    setSearchMode("capture");
    setNotice(nextMode === "delete" ? t.selectedForDelete : t.selectedForEdit);
  }

  function saveCourse(formData: FormData) {
    const now = today();
    const id = selectedCourse?.id ?? `course-${Date.now()}`;
    const orgType = String(formData.get("organizationType") || "Empleate YA") as CourseRecord["organizationType"];
    const saved: CourseRecord = {
      id,
      name: String(formData.get("name") || "").trim() || "Curso sin nombre",
      organization: String(formData.get("organization") || organizations[orgType][0]),
      organizationType: orgType,
      createdBy: String(formData.get("createdBy") || "").trim() || "Usuario sin nombre",
      creatorRole: String(formData.get("creatorRole") || roleOptions[0]),
      use: String(formData.get("use") || "internal_1o1_group") as CourseUse,
      selectedAvatarIds,
      creditsPerParticipant: creditsFor(selectedAvatarIds),
      status: String(formData.get("status") || "activo") as CourseStatus,
      createdAt: selectedCourse?.createdAt ?? now,
      updatedAt: now,
      notes: String(formData.get("notes") || "").trim(),
    };

    setCourses((current) => current.some((course) => course.id === id) ? current.map((course) => course.id === id ? saved : course) : [saved, ...current]);
    setSelectedId(id);
    setOrganizationType(saved.organizationType);
    setSelectedAvatarIds(saved.selectedAvatarIds);
    setNotice(t.saved);
  }

  function logicalDelete() {
    if (!selectedCourse) return;
    setCourses((current) => current.map((course) => course.id === selectedCourse.id ? { ...course, status: "borrado_logico", updatedAt: today() } : course));
    setNotice(t.deleted);
  }

  function changeOrganizationType(nextType: CourseRecord["organizationType"]) {
    setOrganizationType(nextType);
    setSelectedAvatarIds((current) => {
      const allowed = allowedAvatarProfiles[nextType];
      const kept = current.filter((id) => allowed.includes(id));
      return kept.length ? kept : allowed.slice(0, Math.min(2, allowed.length));
    });
  }

  function toggleAvatar(id: SkillId, checked: boolean) {
    setSelectedAvatarIds((current) => checked ? Array.from(new Set([...current, id])) : current.filter((avatarId) => avatarId !== id));
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-5xl text-lg leading-8 text-slate-600">{t.description}</p>
        <p className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-bold leading-6 text-purple-900">{t.rule}</p>
      </header>

      {searchMode !== "capture" ? (
        <SearchPanel
          t={t}
          query={query}
          setQuery={setQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          courses={filteredCourses}
          selectedId={selectedId}
          onSelect={selectForMaintenance}
        />
      ) : null}

      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">{notice}</div> : null}

      <form key={selectedCourse?.id ?? "new-course"} action={saveCourse} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{t.formTitle}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedCourse ? `${t.selected}: ${selectedCourse.name}` : t.noSelected}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]" onClick={createNew}><UserPlus size={17} />{t.create}</Button>
            <Button type="button" className="gap-2 bg-slate-950 text-white hover:bg-slate-800" onClick={() => { setSearchMode("edit"); setNotice(""); }}><Edit3 size={17} />{t.edit}</Button>
            <Button type="button" className="gap-2 bg-amber-500 text-white hover:bg-amber-600" onClick={() => { setSearchMode("delete"); setNotice(""); }}><Trash2 size={17} />{t.deleteSearch}</Button>
            <Button type="submit" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"><Save size={17} />{t.save}</Button>
            {selectedCourse ? <Button type="button" className="gap-2 bg-red-600 text-white hover:bg-red-700" onClick={logicalDelete}><Trash2 size={17} />{t.confirmDelete}</Button> : null}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <FormGroup title={t.identity} icon={<BookOpenCheck size={18} />}>
            <Field label={t.name}><Input name="name" defaultValue={selectedCourse?.name ?? ""} placeholder="Ej. CV estrategico base" /></Field>
            <Field label={t.organizationType}>
              <Select name="organizationType" value={organizationType} onChange={(event) => changeOrganizationType(event.target.value as CourseRecord["organizationType"])}>
                {Object.keys(organizations).map((type) => <option key={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label={t.organization}>
              <Select key={`organization-${organizationType}-${selectedCourse?.id ?? "new"}`} name="organization" defaultValue={selectedCourse?.organization ?? organizations[organizationType][0]}>
                {organizations[organizationType].map((organization) => <option key={organization}>{organization}</option>)}
              </Select>
            </Field>
            <Field label={t.createdBy}><Input name="createdBy" defaultValue={selectedCourse?.createdBy ?? "Leo Galvez"} /></Field>
            <Field label={t.creatorRole}>
              <Select name="creatorRole" defaultValue={selectedCourse?.creatorRole ?? roleOptions[0]}>
                {roleOptions.map((role) => <option key={role}>{role}</option>)}
              </Select>
            </Field>
            <Field label={t.use}>
              <Select key={`use-${organizationType}-${selectedCourse?.id ?? "new"}`} name="use" defaultValue={selectedCourse?.use ?? defaultUseFor(organizationType)}>
                {Object.entries(t.uses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </Select>
            </Field>
            <Field label={t.status}>
              <Select name="status" defaultValue={selectedCourse?.status ?? "activo"}>
                <option value="activo">{t.statusActive}</option>
                <option value="pendiente">{t.statusPending}</option>
                <option value="borrado_logico">{t.statusDeleted}</option>
              </Select>
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Metric label={t.createdAt} value={selectedCourse?.createdAt ?? today()} />
              <Metric label={t.credits} value={formatCredits(selectedCredits)} />
            </div>
            <Field label={t.notes}><Textarea name="notes" defaultValue={selectedCourse?.notes ?? ""} className="min-h-28" /></Field>
          </FormGroup>

          <FormGroup title={t.avatars} icon={<BookOpenCheck size={18} />}>
            <p className="text-sm font-semibold leading-6 text-slate-500">{t.allowedHelp}</p>
            <div className="mt-3 max-h-[520px] overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid gap-3 md:grid-cols-2">
                {allowedAvatarIds.map((id) => {
                  const skill = skills.find((item) => item.id === id);
                  if (!skill) return null;
                  const checked = selectedAvatarIds.includes(id);
                  return (
                    <label key={id} className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${checked ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      <input type="checkbox" checked={checked} onChange={(event) => toggleAvatar(id, event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--brand-primary)]" />
                      <span className="min-w-0">
                        <span className="block font-black text-slate-950">{skill.name}</span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{skill.description}</span>
                        <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand-primary)]">{formatCredits(skill.baseCredits)} creditos</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {!selectedAvatarIds.length ? <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">{t.zeroAvatars}</p> : null}
          </FormGroup>
        </div>
      </form>

      <CoursesTable t={t} courses={courses} selectedId={selectedId} onSelect={selectForMaintenance} />
    </div>
  );
}

function SearchPanel({ t, query, setQuery, typeFilter, setTypeFilter, statusFilter, setStatusFilter, courses, selectedId, onSelect }: {
  t: typeof copy.es | typeof copy.en;
  query: string;
  setQuery: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  courses: CourseRecord[];
  selectedId: string;
  onSelect: (course: CourseRecord) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-black text-slate-950">{t.filters}</h2>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <Field label={t.search}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder={t.searchPlaceholder} />
            </div>
          </Field>
          <Field label={t.type}>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">{t.all}</option>
              {Object.keys(organizations).map((type) => <option key={type}>{type}</option>)}
            </Select>
          </Field>
          <Field label={t.status}>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">{t.all}</option>
              <option value="activo">{t.statusActive}</option>
              <option value="pendiente">{t.statusPending}</option>
              <option value="borrado_logico">{t.statusDeleted}</option>
            </Select>
          </Field>
        </div>
      </div>
      <CoursesTable t={t} courses={courses} selectedId={selectedId} onSelect={onSelect} compact />
    </section>
  );
}

function CoursesTable({ t, courses, selectedId, onSelect, compact = false }: { t: typeof copy.es | typeof copy.en; courses: CourseRecord[]; selectedId: string; onSelect: (course: CourseRecord) => void; compact?: boolean }) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-xl font-black text-slate-950">{t.found}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{t.listHelp}</p>
      </div>
      <div className={`${compact ? "max-h-[230px]" : "max-h-[360px]"} overflow-auto`}>
        <table className="w-full min-w-[1380px] text-left text-sm">
          <thead className="sticky top-0 z-10"><tr>{t.columns.map((column) => <Th key={column}>{column}</Th>)}</tr></thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className={`border-b border-slate-100 last:border-0 ${selectedId === course.id ? "bg-[var(--brand-primary-soft)]" : ""}`}>
                <Td><input type="radio" checked={selectedId === course.id} onChange={() => onSelect(course)} /></Td>
                <Td><strong className="block text-slate-950">{course.name}</strong><span className="text-xs text-slate-500">{course.notes || "-"}</span></Td>
                <Td>{course.organization}</Td>
                <Td><Pill>{course.organizationType}</Pill></Td>
                <Td><strong className="block text-slate-700">{course.createdBy}</strong><span className="text-xs text-slate-500">{course.creatorRole}</span></Td>
                <Td>{t.uses[course.use]}</Td>
                <Td>{course.selectedAvatarIds.map((id) => skillName(id)).join(", ")}</Td>
                <Td><strong>{formatCredits(course.creditsPerParticipant)}</strong></Td>
                <Td><Pill>{statusLabel(course.status, t)}</Pill></Td>
                <Td>{course.createdAt}</Td>
                <Td>{course.updatedAt}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormGroup({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">{icon}{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white px-4 py-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-3 align-top text-slate-600">{children}</td>;
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex whitespace-nowrap rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--brand-primary)]">{children}</span>;
}

function creditsFor(ids: SkillId[]) {
  return ids.reduce((total, id) => total + (skills.find((skill) => skill.id === id)?.baseCredits ?? 0), 0);
}

function skillName(id: SkillId) {
  return skills.find((skill) => skill.id === id)?.name ?? id;
}

function formatCredits(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultUseFor(type: CourseRecord["organizationType"]): CourseUse {
  if (type === "Coach Partner") return "coach_partner_group";
  if (type === "Outplacement") return "outplacement_campaign";
  return "internal_1o1_group";
}

function statusLabel(status: CourseStatus, t: typeof copy.es | typeof copy.en) {
  if (status === "activo") return t.statusActive;
  if (status === "pendiente") return t.statusPending;
  return t.statusDeleted;
}
