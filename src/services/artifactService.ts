import { getStore, newId, now, type Artifact } from "@/lib/mockdb/store";

export function createArtifact(
  input: Omit<Artifact, "id" | "version" | "status" | "createdAt" | "updatedAt"> & {
    status?: Artifact["status"];
    version?: number;
  }
) {
  const artifact: Artifact = {
    id: newId(),
    version: input.version ?? 1,
    status: input.status ?? "final",
    createdAt: now(),
    updatedAt: now(),
    ...input,
  };

  getStore().artifacts.push(artifact);
  getStore().artifactVersions.push({
    id: newId(),
    artifactId: artifact.id,
    version: artifact.version,
    contentJson: artifact.contentJson,
    htmlContent: artifact.htmlContent,
    storagePathDocx: artifact.storagePathDocx,
    storagePathPdf: artifact.storagePathPdf,
    createdAt: now(),
  });

  return artifact;
}

export function listArtifacts(userId: string) {
  return getStore()
    .artifacts.filter((artifact) => artifact.userId === userId && artifact.status !== "deleted")
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getArtifact(userId: string, id: string) {
  return getStore().artifacts.find((artifact) => artifact.id === id && artifact.userId === userId && artifact.status !== "deleted");
}

export function deleteArtifact(userId: string, id: string) {
  const artifact = getArtifact(userId, id);

  if (!artifact) {
    throw new Error("NOT_FOUND");
  }

  artifact.status = "deleted";
  artifact.updatedAt = now();

  return artifact;
}
