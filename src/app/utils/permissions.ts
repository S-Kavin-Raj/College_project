import { FRONTEND_PERMISSION_MAP } from "../config/permissions";

export function normalizeRole(role: string) {
  return (role || "").toString().toUpperCase();
}

export function can(role: string, moduleName: string, action: string) {
  const r = normalizeRole(role);
  const rolePerms = (FRONTEND_PERMISSION_MAP as any)[r];
  if (!rolePerms) return false;
  const actions: string[] = rolePerms[moduleName];
  if (!actions) return false;
  return actions.includes(action);
}
