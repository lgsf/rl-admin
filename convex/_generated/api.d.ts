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
import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
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
  auth: typeof auth;
  dashboard: typeof dashboard;
  "lib/permissions": typeof lib_permissions;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  organizations: typeof organizations;
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
