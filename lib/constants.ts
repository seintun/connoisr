/**
 * Application-wide constants
 */

export const APP_NAME = "Connoisr";
export const APP_NAME_SHORT = "Connoisr";
export const APP_DESCRIPTION = "Vibrant Modernist Dining";

/**
 * Storage key prefixes
 */
export const STORAGE_PREFIX = "connoisr";
export const IDENTITY_STORAGE_KEY = (tableId: string) =>
  `${STORAGE_PREFIX}-identity-${tableId}`;
export const SESSION_STORAGE_KEY = (tableId: string) =>
  `${STORAGE_PREFIX}-session-${tableId}`;
