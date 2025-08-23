/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appearance from "../appearance.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as channels from "../channels.js";
import type * as dashboard from "../dashboard.js";
import type * as groupNotifications from "../groupNotifications.js";
import type * as groups from "../groups.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as notificationGroups from "../notificationGroups.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as systemGroups from "../systemGroups.js";
import type * as systemNotifications from "../systemNotifications.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appearance: typeof appearance;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  channels: typeof channels;
  dashboard: typeof dashboard;
  groupNotifications: typeof groupNotifications;
  groups: typeof groups;
  "lib/permissions": typeof lib_permissions;
  notificationGroups: typeof notificationGroups;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  organizations: typeof organizations;
  systemGroups: typeof systemGroups;
  systemNotifications: typeof systemNotifications;
  tasks: typeof tasks;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
