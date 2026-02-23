/**
 * URL State Version Migrations
 *
 * This module handles migrations for the URL state encoding format.
 * When the compact data structure changes, add a migration function
 * and increment CURRENT_VERSION to preserve backward compatibility.
 */

/**
 * Current version of the URL state format
 * Increment this each time the CompactData structure changes
 */
export const CURRENT_VERSION = 0;

/**
 * Migration function type - transforms data from one version to the next
 * @param data - The state data at version N
 * @returns The state data at version N+1
 */
export type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migration registry
 * Index i contains the function that migrates version i to version i+1
 *
 * Example:
 * migrations[0] = (data) => { ... } // migrates v0 → v1
 * migrations[1] = (data) => { ... } // migrates v1 → v2
 *
 * INVARIANT: migrations.length === CURRENT_VERSION
 */
const migrations: MigrationFn[] = [
  // No migrations yet - version 0 is the initial format
];

/**
 * Migrate compact data from any version to the current version
 * @param data - The decoded compact data with optional version field
 * @returns The migrated data at CURRENT_VERSION
 * @throws Error if data is from a future version
 */
export function migrateCompactData(data: Record<string, unknown>): Record<string, unknown> {
  // Read version field (default to 0 if missing - original format had no version)
  const version = typeof data.v === 'number' ? data.v : 0;

  // Reject data from the future
  if (version > CURRENT_VERSION) {
    throw new Error(
      `URL state is from version ${version}, but this app only supports up to version ${CURRENT_VERSION}. ` +
      `Please update your application.`
    );
  }

  // Already at current version - no migration needed
  if (version === CURRENT_VERSION) {
    return { ...data, v: CURRENT_VERSION };
  }

  // Chain migrations from detected version to current
  let migrated = { ...data };
  for (let i = version; i < CURRENT_VERSION; i++) {
    migrated = migrations[i](migrated);
  }

  // Stamp with current version
  migrated.v = CURRENT_VERSION;
  return migrated;
}
