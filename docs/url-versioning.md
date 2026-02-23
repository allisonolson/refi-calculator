# URL State Versioning System

## Overview

The calculator app encodes its entire state into the URL hash to enable sharing and bookmarking. The encoding pipeline is:

```
CalculatorInputs → CompactData → JSON → deflate → base64url → URL hash
```

**Decoding reverses this:**

```
URL hash → base64url decode → inflate → JSON parse → migration → CompactData → CalculatorInputs
```

To ensure old URLs continue to work when the data format changes, we use a versioning system with automatic migrations.

## How It Works

1. **Version Stamping**: Every encoded URL includes a version number (`v` field)
2. **Migration Chain**: When decoding, old versions are migrated forward to the current version
3. **Graceful Fallback**: Invalid or corrupted URLs fail silently and fall back to default values

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0 | 2025-02 | Initial format with compact field names |

## Adding a New Version

When you need to change the `CompactData` structure (add/remove/rename fields), follow these steps:

### 1. Add Migration Function

In `src/utils/urlMigrations.ts`, add a migration function to the `migrations` array:

```typescript
const migrations: MigrationFn[] = [
  // Migration 0 → 1: Example - add a new field with default value
  (data) => {
    return {
      ...data,
      // Add new field with default value for old URLs
      newField: 'default-value'
    };
  },

  // Migration 1 → 2: Example - rename a field
  (data) => {
    const { oldFieldName, ...rest } = data;
    return {
      ...rest,
      newFieldName: oldFieldName
    };
  }
];
```

**Important**: The migration at index `i` transforms data from version `i` to version `i+1`.

### 2. Increment CURRENT_VERSION

```typescript
export const CURRENT_VERSION = 2;  // Was 1, now 2
```

**Invariant**: `migrations.length === CURRENT_VERSION` must always be true.

### 3. Update CompactData Interface

In `src/utils/urlEncoding.ts`, update the `CompactData` interface and the `toCompact`/`fromCompact` functions to match the new structure:

```typescript
interface CompactData {
  v?: number;
  // ... existing fields ...
  newField?: string;  // Add your new field
}
```

### 4. Update Conversion Functions

Modify `toCompact` and `fromCompact` to handle the new field:

```typescript
function toCompact(inputs: CalculatorInputs): CompactData {
  const compact: CompactData = {
    // ... existing fields ...
  };

  // Handle new field
  if (inputs.newField) {
    compact.newField = inputs.newField;
  }

  return compact;
}

function fromCompact(compact: CompactData): CalculatorInputs {
  return {
    // ... existing fields ...
    newField: compact.newField || 'default-value'
  };
}
```

### 5. Add Tests

In `src/utils/__tests__/urlEncoding.test.ts`, add tests for the new migration:

```typescript
it('should migrate v1 to v2', () => {
  const v1Data = {
    v: 1,
    c: { /* ... */ }
    // Missing newField
  };

  const hash = manualEncode(v1Data);
  const decoded = decodeFromHash(hash);

  expect(decoded).not.toBeNull();
  expect(decoded!.newField).toBe('default-value');
});
```

### 6. Update Version History

Add an entry to the version history table above documenting what changed.

## Example Migration Scenarios

### Adding a New Optional Field

```typescript
// Migration function
(data) => {
  // No changes needed - just increment version
  // The field is optional, so old URLs work fine without it
  return data;
}
```

Then update `toCompact`/`fromCompact` to handle the new field.

### Renaming a Field

```typescript
// Migration function
(data) => {
  const { oldName, ...rest } = data;
  return {
    ...rest,
    newName: oldName
  };
}
```

### Changing Field Structure

```typescript
// Migration function - flatten nested structure
(data) => {
  const settings = data.s as Record<string, unknown>;
  return {
    ...data,
    s: {
      ...settings,
      // Flatten: move s.nested.field to s.field
      field: settings.nested?.field,
      nested: undefined
    }
  };
}
```

### Adding Required Field with Default

```typescript
// Migration function
(data) => {
  return {
    ...data,
    requiredField: 'sensible-default'
  };
}
```

## Testing Strategy

### Round-Trip Tests
Ensure current version encodes and decodes correctly:
```typescript
const hash = encodeToHash(inputs);
const decoded = decodeFromHash(hash);
expect(decoded).toEqual(inputs);
```

### Backward Compatibility Tests
Manually construct old version data and verify it decodes:
```typescript
const v0Data = { c: { /* ... */ } };  // No 'v' field
const hash = manualEncode(v0Data);
const decoded = decodeFromHash(hash);
expect(decoded).not.toBeNull();
```

### Migration Tests
Test each migration function in isolation:
```typescript
const v1Data = { v: 1, /* ... */ };
const migrated = migrateCompactData(v1Data);
expect(migrated.v).toBe(CURRENT_VERSION);
```

## Error Handling

- **Future version**: Returns `null` (graceful fallback to defaults)
- **Corrupted data**: Returns `null` (graceful fallback)
- **Invalid structure**: Returns `null` (graceful fallback)
- **Migration error**: Returns `null` (graceful fallback)

The system never throws errors to the user - invalid URLs simply result in default calculator state.

## Best Practices

1. **Keep migrations simple**: Complex transformations increase the risk of bugs
2. **Test thoroughly**: Old URLs are user-facing and must continue to work
3. **Document changes**: Update this file's version history table
4. **Consider defaults**: Choose sensible defaults for new required fields
5. **Maintain invariant**: Always ensure `migrations.length === CURRENT_VERSION`
6. **Don't skip versions**: Migrations must form an unbroken chain from 0 to current
