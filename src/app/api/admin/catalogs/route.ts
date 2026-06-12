import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { getStore, newId, now, type CatalogItem } from "@/lib/mockdb/store";
import { requireSuperAdmin } from "@/services/authService";

const catalogItemSchema = z.object({
  catalogCode: z.string().min(2),
  code: z.string().min(2).regex(/^[a-z0-9_:-]+$/),
  labelEs: z.string().min(2),
  labelEn: z.string().optional(),
  descriptionEs: z.string().optional(),
  descriptionEn: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

const updateCatalogItemSchema = catalogItemSchema.partial().extend({
  id: z.string().min(1),
});

const deleteCatalogItemSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  try {
    await requireSuperAdmin();
    return jsonOk({ catalogs: getStore().catalogs });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSuperAdmin();
    const input = catalogItemSchema.parse(await request.json());
    const db = getStore();
    const catalog = db.catalogs.find((item) => item.code === input.catalogCode);
    if (!catalog) throw new Error("NOT_FOUND");
    if (catalog.items.some((item) => item.code === input.code)) throw new Error("CATALOG_ITEM_EXISTS");

    const item: CatalogItem = {
      id: newId(),
      ...input,
      createdById: user.id,
      updatedById: user.id,
      createdAt: now(),
      updatedAt: now(),
    };
    catalog.items.push(item);
    catalog.items.sort((a, b) => a.sortOrder - b.sortOrder || a.labelEs.localeCompare(b.labelEs));
    db.auditLogs.push({ id: newId(), userId: user.id, action: "catalog.item.create", entityType: "catalog_item", entityId: item.id, metadataJson: { catalogCode: catalog.code, code: item.code }, createdAt: now() });

    return jsonOk({ item }, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSuperAdmin();
    const input = updateCatalogItemSchema.parse(await request.json());
    const db = getStore();
    const catalog = db.catalogs.find((entry) => entry.items.some((item) => item.id === input.id));
    const item = catalog?.items.find((entry) => entry.id === input.id);
    if (!catalog || !item) throw new Error("NOT_FOUND");
    if (input.code && input.code !== item.code && catalog.items.some((entry) => entry.code === input.code)) throw new Error("CATALOG_ITEM_EXISTS");

    Object.assign(item, input, { updatedById: user.id, updatedAt: now() });
    catalog.items.sort((a, b) => a.sortOrder - b.sortOrder || a.labelEs.localeCompare(b.labelEs));
    db.auditLogs.push({ id: newId(), userId: user.id, action: "catalog.item.update", entityType: "catalog_item", entityId: item.id, metadataJson: { catalogCode: catalog.code, code: item.code }, createdAt: now() });

    return jsonOk({ item });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSuperAdmin();
    const input = deleteCatalogItemSchema.parse(await request.json());
    const db = getStore();
    const catalog = db.catalogs.find((entry) => entry.items.some((item) => item.id === input.id));
    const item = catalog?.items.find((entry) => entry.id === input.id);
    if (!catalog || !item) throw new Error("NOT_FOUND");

    item.status = "archived";
    item.updatedById = user.id;
    item.updatedAt = now();
    db.auditLogs.push({ id: newId(), userId: user.id, action: "catalog.item.archive", entityType: "catalog_item", entityId: item.id, metadataJson: { catalogCode: catalog.code, code: item.code }, createdAt: now() });

    return jsonOk({ item });
  } catch (error) {
    return jsonError(error);
  }
}
