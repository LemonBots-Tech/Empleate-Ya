"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpenCheck, Edit3, Lock, Save, Search, Trash2, UserPlus } from "lucide-react";
import { skills, type SkillId } from "@/ai/skillRegistry";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type CourseStatus = "activo" | "pendiente" | "borrado_logico";
type CourseUse = "coach_partner_group" | "internal_1o1_group" | "outplacement_campaign";
type SearchMode = "capture" | "edit" | "delete";
type OrganizationType = "Empleate YA" | "Coach Partner" | "Outplacement";
type UserProfile = "super_admin" | "super_admin_support" | "coach_partner" | "outplacement" | "internal_coach" | "online" | "visitor";

type CourseRecord = {
  id: string;
  name: string;
  organization: string;
  organizationType: OrganizationType;
  commercialModel: string;
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

type CurrentUserContext = {
  profile: UserProfile;
  canSeeAll: boolean;
  organization: string;
  organizationType: OrganizationType;
  commercialModel: string;
  userName: string;
  role: string;
  defaultUse: CourseUse;
  allowedAvatarIds: SkillId[];
};

const storageKey = "empleate-ya-admin-coaching-courses-v2";
const profileStorageKey = "empleate-ya-nav-profile";

const copy = {
  es: {
    eyebrow: "Programas de capacitacion / outplacement",
    title: "Cursos de Coaching & Outplacement",
    description: "Define cursos reutilizables con los agentes permitidos para Empleate YA, Coach Partner u Outplacement. Despues podran asignarse a grupos o campanas y calcular sus creditos.",
    rule: "Regla: esta pantalla no cambia identidad, rol ni organizacion. Esos datos vienen del usuario y su empresa; aqui solo se crean cursos con los agentes permitidos.",
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
    currentIdentity: "Identidad actual",
    commercialModel: "Plan / servicio contratado",
    found: "Cursos registrados",
    listHelp: "Selecciona un registro para editarlo o marcarlo con borrado logico. Esta tabla solo aparece cuando buscas para editar o borrar.",
    formTitle: "Captura y mantenimiento del curso",
    selected: "Seleccionado",
    noSelected: "Crea un curso nuevo o busca uno existente.",
    selectedForEdit: "Curso seleccionado. Ajusta los datos editables y guarda.",
    selectedForDelete: "Curso seleccionado. Confirma el borrado logico si corresponde.",
    saved: "Curso guardado para pruebas.",
    deleted: "Curso marcado como borrado logico. No se elimino definitivamente.",
    identity: "Identidad bloqueada del creador",
    courseData: "Datos del curso",
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
    statusDeleted: "borrado logico",
    zeroAvatars: "Selecciona al menos un agente para sumar creditos.",
    allowedHelp: "Agentes disponibles segun permisos del usuario o de la organizacion activa.",
    lockedHelp: "Estos campos se muestran para confirmar contexto. Se modificaran desde usuarios/organizaciones cuando conectemos Supabase.",
    visibilityHelp: "Solo Empleate YA y sus apoyos autorizados tienen vision completa. Los demas usuarios ven cursos de su organizacion.",
    columns: ["Seleccion", "Curso", "Empresa", "Identidad", "Plan / servicio", "Usuario creador", "Uso", "Agentes", "Creditos", "Estado", "Creacion", "Ultimo cambio"],
    uses: {
      coach_partner_group: "Grupo Coach Partner",
      internal_1o1_group: "Grupo Coaching 1o1",
      outplacement_campaign: "Campana Outplacement",
    },
  },
  en: {
    eyebrow: "Training / outplacement programs",
    title: "Coaching & Outplacement Courses",
    description: "Define reusable courses with the agents allowed for Empleate YA, Coach Partner, or Outplacement. They can later be assigned to groups or campaigns and calculate credits.",
    rule: "Rule: this screen does not change identity, role, or organization. Those fields come from the user and company; here you only create courses with allowed agents.",
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
    currentIdentity: "Current identity",
    commercialModel: "Contracted plan / service",
    found: "Registered courses",
    listHelp: "Select a record to edit it or mark it with logical deletion. This table only appears when searching to edit or delete.",
    formTitle: "Course capture and maintenance",
    selected: "Selected",
    noSelected: "Create a new course or search an existing one.",
    selectedForEdit: "Course selected. Adjust editable data and save.",
    selectedForDelete: "Course selected. Confirm logical deletion if appropriate.",
    saved: "Course saved for testing.",
    deleted: "Course marked as logical delete. It was not permanently removed.",
    identity: "Creator locked identity",
    courseData: "Course data",
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
    allowedHelp: "Available agents according to the active user's or organization's permissions.",
    lockedHelp: "These fields are shown to confirm context. They will be managed from users/organizations once Supabase is connected.",
    visibilityHelp: "Only Empleate YA and authorized support roles have full visibility. Other users only see their own organization's courses.",
    columns: ["Select", "Course", "Company", "Identity", "Plan / service", "Creator", "Use", "Agents", "Credits", "Status", "Created", "Last change"],
    uses: {
      coach_partner_group: "Coach Partner group",
      internal_1o1_group: "1:1 Coaching group",
      outplacement_campaign: "Outplacement campaign",
    },
  },
} as const;

const allAvatarIds = skills.map((skill) => skill.id);

const allowedAvatarProfiles: Record<OrganizationType, SkillId[]> = {
  "Empleate YA": allAvatarIds,
  "Coach Partner": ["scorex", "optim", "mr_wow", "mr_boost_linked", "tommy_lee_picture", "lumo", "boost_me", "new_job_challenge", "miss_quest"],
  Outplacement: ["scorex", "optim", "scorex_360", "mr_wow", "mr_boost_linked", "new_job_challenge", "indiana_jobs", "miss_quest", "recharge"],
};

const initialCourses: CourseRecord[] = [
  {
    id: "course-cv-partner",
    name: "CV estrategico Coach Partner",
    organization: "Partner Ejecutivo Norte",
    organizationType: "Coach Partner",
    commercialModel: "Coach Starter",
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
    commercialModel: "Recolocacion profesional 90",
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
  {
    id: "course-internal-coach",
    name: "Coaching 1o1 CV y entrevista",
    organization: "Empleate YA",
    organizationType: "Empleate YA",
    commercialModel: "Coaching interno 1o1",
    createdBy: "Leo Galvez",
    creatorRole: "Coach interno 1o1",
    use: "internal_1o1_group",
    selectedAvatarIds: ["scorex", "optim", "miss_quest", "mr_wow"],
    creditsPerParticipant: creditsFor(["scorex", "optim", "miss_quest", "mr_wow"]),
    status: "activo",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
    notes: "Curso para sesiones internas de Empleate YA.",
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
  const [context, setContext] = useState<CurrentUserContext>(contextForProfile("super_admin"));
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<SkillId[]>(["scorex", "optim"]);

  useEffect(() => {
    const profile = (window.localStorage.getItem(profileStorageKey) ?? "super_admin") as UserProfile;
    const nextContext = contextForProfile(profile);
    setContext(nextContext);
    setSelectedAvatarIds(nextContext.allowedAvatarIds.slice(0, Math.min(2, nextContext.allowedAvatarIds.length)));

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCourses(JSON.parse(stored) as CourseRecord[]);
      } catch {
        setCourses(initialCourses);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(courses));
  }, [courses]);

  const selectedCourse = courses.find((course) => course.id === selectedId);
  const selectedCredits = creditsFor(selectedAvatarIds);

  const visibleCourses = useMemo(() => {
    return context.canSeeAll ? courses : courses.filter((course) => course.organization === context.organization);
  }, [context.canSeeAll, context.organization, courses]);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return visibleCourses.filter((course) => {
      const avatarNames = course.selectedAvatarIds.map((id) => skillName(id)).join(" ");
      const matchesText = !normalized || `${Object.values(course).join(" ")} ${avatarNames}`.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      const matchesType = typeFilter === "all" || course.organizationType === typeFilter;
      return matchesText && matchesStatus && matchesType;
    });
  }, [visibleCourses, query, statusFilter, typeFilter]);

  function createNew() {
    setSelectedId("");
    setSelectedAvatarIds(context.allowedAvatarIds.slice(0, Math.min(2, context.allowedAvatarIds.length)));
    setSearchMode("capture");
    setNotice("");
  }

  function selectForMaintenance(course: CourseRecord) {
    const nextMode = searchMode;
    setSelectedId(course.id);
    setSelectedAvatarIds(course.selectedAvatarIds.filter((id) => context.allowedAvatarIds.includes(id)));
    setSearchMode("capture");
    setNotice(nextMode === "delete" ? t.selectedForDelete : t.selectedForEdit);
  }

  function saveCourse(formData: FormData) {
    const now = today();
    const id = selectedCourse?.id ?? `course-${Date.now()}`;
    const selectedIdentity = selectedCourse ?? context;
    const allowedIds = context.canSeeAll ? selectedAvatarIds : selectedAvatarIds.filter((id) => context.allowedAvatarIds.includes(id));
    const createdBy = selectedCourse?.createdBy ?? context.userName;
    const creatorRole = selectedCourse?.creatorRole ?? context.role;
    const courseUse = selectedCourse?.use ?? context.defaultUse;
    const saved: CourseRecord = {
      id,
      name: String(formData.get("name") || "").trim() || "Curso sin nombre",
      organization: selectedIdentity.organization,
      organizationType: selectedIdentity.organizationType,
      commercialModel: selectedIdentity.commercialModel,
      createdBy,
      creatorRole,
      use: String(formData.get("use") || courseUse) as CourseUse,
      selectedAvatarIds: allowedIds,
      creditsPerParticipant: creditsFor(allowedIds),
      status: String(formData.get("status") || "activo") as CourseStatus,
      createdAt: selectedCourse?.createdAt ?? now,
      updatedAt: now,
      notes: String(formData.get("notes") || "").trim(),
    };

    setCourses((current) => current.some((course) => course.id === id) ? current.map((course) => course.id === id ? saved : course) : [saved, ...current]);
    setSelectedId(id);
    setSelectedAvatarIds(saved.selectedAvatarIds);
    setNotice(t.saved);
  }

  function logicalDelete() {
    if (!selectedCourse) return;
    setCourses((current) => current.map((course) => course.id === selectedCourse.id ? { ...course, status: "borrado_logico", updatedAt: today() } : course));
    setNotice(t.deleted);
  }

  function toggleAvatar(id: SkillId, checked: boolean) {
    setSelectedAvatarIds((current) => checked ? Array.from(new Set([...current, id])) : current.filter((avatarId) => avatarId !== id));
  }

  const identity = selectedCourse ?? context;
  const allowedAvatarIds = context.canSeeAll && selectedCourse ? allowedAvatarProfiles[selectedCourse.organizationType] : context.allowedAvatarIds;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-5xl text-lg leading-8 text-slate-600">{t.description}</p>
        <p className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-bold leading-6 text-purple-900">{t.rule}</p>
      </header>

      <ContextStrip t={t} context={context} />

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
          canSeeAll={context.canSeeAll}
        />
      ) : null}

      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">{notice}</div> : null}

      <form key={selectedCourse?.id ?? `new-${context.profile}`} action={saveCourse} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
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
          <div className="space-y-5">
            <FormGroup title={t.identity} icon={<Lock size={18} />}>
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-600">{t.lockedHelp}</p>
              <ReadOnlyField label={t.organizationType} value={identity.organizationType} />
              <ReadOnlyField label={t.organization} value={identity.organization} />
              <ReadOnlyField label={t.commercialModel} value={identity.commercialModel} />
              <ReadOnlyField label={t.createdBy} value={selectedCourse?.createdBy ?? context.userName} />
              <ReadOnlyField label={t.creatorRole} value={selectedCourse?.creatorRole ?? context.role} />
            </FormGroup>

            <FormGroup title={t.courseData} icon={<BookOpenCheck size={18} />}>
              <Field label={t.name}><Input name="name" defaultValue={selectedCourse?.name ?? ""} placeholder="Ej. CV estrategico base" /></Field>
              <Field label={t.use}>
                <Select name="use" defaultValue={selectedCourse?.use ?? context.defaultUse}>
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
          </div>

          <FormGroup title={t.avatars} icon={<BookOpenCheck size={18} />}>
            <p className="text-sm font-semibold leading-6 text-slate-500">{t.allowedHelp}</p>
            <div className="mt-3 max-h-[640px] overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
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
    </div>
  );
}

function ContextStrip({ t, context }: { t: typeof copy.es | typeof copy.en; context: CurrentUserContext }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label={t.currentIdentity} value={context.organizationType} />
        <Metric label={t.organization} value={context.organization} />
        <Metric label={t.creatorRole} value={context.role} />
        <Metric label={t.commercialModel} value={context.commercialModel} />
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{t.visibilityHelp}</p>
    </section>
  );
}

function SearchPanel({ t, query, setQuery, typeFilter, setTypeFilter, statusFilter, setStatusFilter, courses, selectedId, onSelect, canSeeAll }: {
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
  canSeeAll: boolean;
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
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} disabled={!canSeeAll}>
              <option value="all">{t.all}</option>
              <option value="Empleate YA">Empleate YA</option>
              <option value="Coach Partner">Coach Partner</option>
              <option value="Outplacement">Outplacement</option>
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
      <CoursesTable t={t} courses={courses} selectedId={selectedId} onSelect={onSelect} />
    </section>
  );
}

function CoursesTable({ t, courses, selectedId, onSelect }: { t: typeof copy.es | typeof copy.en; courses: CourseRecord[]; selectedId: string; onSelect: (course: CourseRecord) => void }) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-xl font-black text-slate-950">{t.found}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{t.listHelp}</p>
      </div>
      <div className="max-h-[300px] overflow-auto">
        <table className="w-full min-w-[1540px] text-left text-sm">
          <thead className="sticky top-0 z-10"><tr>{t.columns.map((column) => <Th key={column}>{column}</Th>)}</tr></thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className={`border-b border-slate-100 last:border-0 ${selectedId === course.id ? "bg-[var(--brand-primary-soft)]" : ""}`}>
                <Td><input type="radio" checked={selectedId === course.id} onChange={() => onSelect(course)} /></Td>
                <Td><strong className="block text-slate-950">{course.name}</strong><span className="text-xs text-slate-500">{course.notes || "-"}</span></Td>
                <Td>{course.organization}</Td>
                <Td><Pill>{course.organizationType}</Pill></Td>
                <Td>{course.commercialModel}</Td>
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex min-h-11 items-center rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-700">{value}</div>
    </div>
  );
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

function contextForProfile(profile: UserProfile): CurrentUserContext {
  if (profile === "coach_partner") {
    return {
      profile,
      canSeeAll: false,
      organization: "Partner Ejecutivo Norte",
      organizationType: "Coach Partner",
      commercialModel: "Coach Starter",
      userName: "Mariana Soto",
      role: "Coach partner principal",
      defaultUse: "coach_partner_group",
      allowedAvatarIds: allowedAvatarProfiles["Coach Partner"],
    };
  }
  if (profile === "outplacement") {
    return {
      profile,
      canSeeAll: false,
      organization: "Empresa Demo Outplacement",
      organizationType: "Outplacement",
      commercialModel: "Recolocacion profesional 90",
      userName: "Ana Torres",
      role: "Administrador RH",
      defaultUse: "outplacement_campaign",
      allowedAvatarIds: allowedAvatarProfiles.Outplacement,
    };
  }
  if (profile === "internal_coach") {
    return {
      profile,
      canSeeAll: false,
      organization: "Empleate YA",
      organizationType: "Empleate YA",
      commercialModel: "Coaching interno 1o1",
      userName: "Coach 1o1 Demo",
      role: "Coach interno 1o1",
      defaultUse: "internal_1o1_group",
      allowedAvatarIds: ["scorex", "optim", "miss_quest", "mr_wow"],
    };
  }
  return {
    profile,
    canSeeAll: profile === "super_admin" || profile === "super_admin_support",
    organization: "Empleate YA",
    organizationType: "Empleate YA",
    commercialModel: profile === "super_admin_support" ? "Apoyo operativo Empleate YA" : "Super Admin",
    userName: "Leo Galvez",
    role: profile === "super_admin_support" ? "Apoyo Super Admin" : "Super Admin",
    defaultUse: "internal_1o1_group",
    allowedAvatarIds: allAvatarIds,
  };
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

function statusLabel(status: CourseStatus, t: typeof copy.es | typeof copy.en) {
  if (status === "activo") return t.statusActive;
  if (status === "pendiente") return t.statusPending;
  return t.statusDeleted;
}
