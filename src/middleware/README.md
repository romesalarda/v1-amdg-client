# Event Permission Middleware

Flexible, type-safe middleware for enforcing event-based permissions in Nuxt routes.

## Quick Start

```typescript
// pages/events/[id]/registration/create.vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'create'
  }
})
</script>
```

## Features

- ✅ **Type-safe** - Full TypeScript support with auto-completion
- ✅ **Flexible** - Single or multiple permission checks
- ✅ **Cached** - Uses TanStack Query cache for fast checks
- ✅ **User-friendly** - Custom error messages and redirects
- ✅ **Composable** - Works with other middleware
- ✅ **Optimized** - Blocks navigation until verified for security

## Permission Categories

```typescript
type PermissionCategory =
  | 'GENERAL'
  | 'REGISTRATION'
  | 'PRODUCT_MANAGEMENT'
  | 'CONTENT_MANAGEMENT'
  | 'STAFF_MANAGEMENT'
  | 'REPORTING'
```

## CRUD Actions

```typescript
type CRUDAction = 'create' | 'read' | 'update' | 'delete'
```

## Usage Patterns

### Single Permission

```typescript
definePageMeta({
  middleware: 'event-permission',
  eventPermission: {
    category: 'REGISTRATION',
    action: 'read'  // Optional, defaults to 'read'
  }
})
```

### Multiple Permissions (Any)

User needs **at least one** of these permissions:

```typescript
definePageMeta({
  middleware: 'event-permission',
  eventPermission: {
    anyOf: [
      { category: 'REGISTRATION', action: 'read' },
      { category: 'STAFF_MANAGEMENT', action: 'read' }
    ]
  }
})
```

### Multiple Permissions (All)

User needs **all** of these permissions:

```typescript
definePageMeta({
  middleware: 'event-permission',
  eventPermission: {
    allOf: [
      { category: 'REGISTRATION', action: 'update' },
      { category: 'PRODUCT_MANAGEMENT', action: 'update' }
    ]
  }
})
```

### Custom Error Message

```typescript
definePageMeta({
  middleware: 'event-permission',
  eventPermission: {
    category: 'REPORTING',
    action: 'read',
    deniedMessage: 'Only administrators can view financial reports.'
  }
})
```

### Custom Redirect

```typescript
definePageMeta({
  middleware: 'event-permission',
  eventPermission: {
    category: 'STAFF_MANAGEMENT',
    action: 'delete',
    deniedRedirect: '/403'
  }
})
```

## Helper Functions

For cleaner, more readable code:

```typescript
import { 
  canCreate, 
  canUpdate, 
  requireAll 
} from '~/middleware/helpers/eventPermissionHelpers'

definePageMeta({
  middleware: 'event-permission',
  eventPermission: requireAll(
    canCreate('CONTENT_MANAGEMENT'),
    canUpdate('CONTENT_MANAGEMENT')
  )
})
```

## Presets

Common permission configurations:

```typescript
import { EventPermissionPresets } from '~/middleware/helpers/eventPermissionHelpers'

definePageMeta({
  middleware: 'event-permission',
  eventPermission: EventPermissionPresets.editProduct
})
```

Available presets:
- `viewRegistration`, `createAttendee`, `editAttendee`, `deleteAttendee`
- `viewProducts`, `createProduct`, `editProduct`, `deleteProduct`
- `viewStaff`, `addStaff`, `editStaff`, `removeStaff`
- `viewContent`, `createContent`, `editContent`, `deleteContent`
- `viewReports`
- `manageRegistration`, `manageProducts`
- `registrationOrStaff`

## Permission Checking Logic

The middleware follows these rules:

1. **Admin Bypass** - Django staff/superusers always have access
2. **Creator Bypass** - Event creators always have access
3. **ADMINISTRATIVE Role** - Users with ADMINISTRATIVE role have full access
4. **read_only Flag** - When true, only read access is granted
5. **Most Permissive Wins** - If role OR permission grants access, user gets access

## Combining with Other Middleware

The permission middleware works with other middleware:

```typescript
definePageMeta({
  middleware: ['auth', 'organisation-controller', 'event-permission'],
  eventPermission: {
    category: 'GENERAL',
    action: 'update'
  }
})
```

**Execution order**: Middleware runs in array order.

## Permission Denial

When permission is denied:

1. User is redirected to the event page (or custom redirect)
2. Error query params are added: `?error=permission_denied&message=...`
3. The 403 page displays the error message
4. User can go back or navigate to dashboard

## Programmatic Checks

For conditional UI elements, use the permission composable:

```typescript
import { useCurrentUserEventPermissions } from '~/composables/permissions'

const { can } = useCurrentUserEventPermissions(eventId)

const canCreate = can('REGISTRATION', 'create')

// Use in template
<button v-if="canCreate.allowed">Add Attendee</button>
```

## Performance

- **Cached**: Uses TanStack Query cache (5min stale time)
- **Fast**: Checks cached permissions first, API as fallback
- **Optimized**: Single API call per event, reused across routes

## Error Handling

If permission check fails:
- Logs error to console
- Redirects to 403 page
- Prevents access to protected content

## Testing

To test permission middleware:

1. **Grant permissions** via Django admin or API
2. **Navigate to route** - middleware blocks/allows access
3. **Check error messages** - verify custom messages work
4. **Test multiple permissions** - verify anyOf/allOf logic

## Examples

See `middleware/examples/eventPermissionExamples.ts` for comprehensive examples.

## Type Definitions

```typescript
interface EventPermissionMeta {
  // Single permission
  category?: PermissionCategory
  action?: CRUDAction
  
  // Multiple permissions
  anyOf?: PermissionRequirement[]
  allOf?: PermissionRequirement[]
  
  // Customization
  deniedMessage?: string
  deniedRedirect?: string
}
```

## Best Practices

1. **Always use with auth middleware**: `middleware: ['auth', 'event-permission']`
2. **Most restrictive on sensitive pages**: Use `action: 'delete'` for destructive actions
3. **Read access for views**: Default `action: 'read'` for list/detail pages
4. **Create access for forms**: Use `action: 'create'` on add/new pages
5. **Update access for edit pages**: Use `action: 'update'` on edit pages
6. **Combine permissions**: Use `allOf` for admin pages requiring multiple permissions
7. **Custom messages**: Provide clear error messages for better UX
8. **Test thoroughly**: Verify all permission combinations work correctly

## Troubleshooting

**Permission check fails but user should have access:**
- Check event_permissions in event detail API response
- Verify user has permission assignment in Django admin
- Check permission category and action match exactly
- Ensure read_only flag is not blocking write actions

**Middleware not running:**
- Verify middleware is in `definePageMeta`
- Check middleware order (auth must come before event-permission)
- Ensure event ID is in route params as `id`

**Cache issues:**
- Clear TanStack Query cache
- Force refetch event data
- Check staleTime configuration

## Related

- Permission Composables: `composables/permissions/`
- Permission Types: `types/permissions.ts`
- Backend Permissions: `v1-amdg-api/apps/events/api/permissions.py`
