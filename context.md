# Agent Handoff Context — Attendee Filter POST Rework

**Date:** 2026-06-16  
**Status:** Core implementation COMPLETE and working. Remaining work: improved chip labels and URL decode restoration of filter state in the UI.

---

## What Was Built

### Problem
The old attendee filtering used 90+ flat GET query parameters. EventForm filtering was especially broken — it couldn't support multiple forms each with multiple questions with different filter types (date ranges, choice options, sliders, etc.).

### Solution
A new `POST /api/attendees/filter/` endpoint with a structured JSON body. URL state is stored as a single base64-encoded `?f=` param. The frontend uses a "conditions builder" UI.

---

## Architecture

### POST Body Shape
```json
{
  "event": "event-slug",
  "page": 1,
  "page_size": 25,
  "search": "john",
  "ordering": "-created_at",
  "filters": {
    "operator": "AND",
    "demographics": {
      "gender": "Male", "age_min": 18, "age_max": 65, "is_minor": null,
      "organisation": [1], "area_from": [],
      "has_dietary_requirements": true, "dietary_requirement": [1],
      "has_medical_conditions": null, "medical_condition": [],
      "has_accessibility_requirements": null, "accessibility_requirement": [],
      "has_emergency_contacts": null, "include_deleted": false
    },
    "status": { "is_checked_in": null, "is_registered": null, "is_cancelled": null, "is_staff": null },
    "forms": {
      "operator": "AND",
      "conditions": [
        {
          "form": "form-uuid",
          "has_response": true,
          "response_complete": null,
          "operator": "AND",
          "questions": [
            { "question_id": 7, "type": "date", "date_after": "2026-06-11", "date_before": "2026-07-22" },
            { "question_id": 8, "type": "time", "time_after": "00:00", "time_before": "04:00" },
            { "question_id": 15, "type": "short_answer", "contains": "hello" },
            { "question_id": 20, "type": "single_choice", "selected_options": [3, 5] },
            { "question_id": 25, "type": "slider", "min": 3, "max": 8 }
          ]
        }
      ]
    },
    "registration_questions": {
      "operator": "AND",
      "conditions": [
        { "question_id": "uuid-string", "type": "short_answer", "contains": "hello" },
        { "question_id": "uuid-string", "type": "slider", "min": 1, "max": 10 },
        { "question_id": "uuid-string", "type": "single_choice", "selected_options": [1, 2] }
      ]
    },
    "orders": {
      "has_orders": null, "order_status": ["completed"], "order_status_not": [],
      "purchased_product": [], "purchased_product_title": null,
      "order_total_min": null, "order_total_max": null,
      "order_created_after": null, "order_created_before": null,
      "order_reference_id": null, "has_completed_orders": null, "has_pending_orders": null
    },
    "payments": {
      "has_payments": null, "payment_id": [], "payment_reference": null,
      "bank_transfer_reference": null, "payment_status": [], "payment_target": null,
      "payment_method_type": [], "payment_method_title": null,
      "has_refunds": null, "refund_status": [], "refund_is_active": null,
      "has_donations": null, "donation_status": [],
      "has_discounts_used": null, "discount_id": [], "discount_name": null
    },
    "advanced": {
      "relationship_to_user": null, "self_registered": null,
      "has_booking": null, "booking": [],
      "date_of_birth_after": null, "date_of_birth_before": null,
      "created_after": null, "created_before": null
    }
  }
}
```

### Response Shape
```json
{
  "count": 123,
  "page": 1,
  "page_size": 25,
  "total_pages": 5,
  "has_next": true,
  "has_previous": false,
  "results": [ /* AttendeeList objects */ ]
}
```

---

## Files Changed / Created

### Backend (`v1-amdg-api`)

| File | Status | Notes |
|------|--------|-------|
| `apps/attendee/api/serializers/filter_serializers.py` | **NEW** | All request/response serializers. Type-aware per-question validation (e.g. `date_after` rejected on `short_answer` questions). |
| `apps/attendee/services/filter_service.py` | **NEW** | `AttendeeFilterService` class. All filter logic ported from `filtersets.py`. Has been edited by user since creation — check current state before modifying. |
| `apps/attendee/api/viewsets/attendee.py` | **MODIFIED** | Added `POST /api/attendees/filter/` action (`filter_attendees`). Imports `AttendeeFilterRequestSerializer`, `AttendeeFilterResponseSerializer`, `AttendeeFilterService`. |
| `apps/attendee/api/serializers/__init__.py` | **MODIFIED** | Exports all new filter serializer classes. |

### Frontend (`v1-amdg-client`)

| File | Status | Notes |
|------|--------|-------|
| `src/composables/resources/attendee/useAttendeesPostFilter.ts` | **NEW** | Vue Query wrapper for `POST /api/attendees/filter/`. Uses `attendeesFilterCreate` from generated SDK. |
| `src/composables/participants/useParticipantsUrlState.ts` | **REPLACED** | Entire file rewritten. Old 90+ flat URL params → single `?f=<base64>` param. Exports `postFilterBody` (POST body) alongside `queryParams` (GET params for stats). `buildActiveFilterChips` is implemented but has **known issues** (see below). |
| `src/composables/participants/useParticipantsDashboardData.ts` | **MODIFIED** | New signature: `useParticipantsDashboardData(eventId, postFilterBody, queryParams, ...)`. Main attendee list uses `useAttendeesPostFilter(postFilterBody)`. Stats queries remain on GET. |
| `src/components/attendees/filters/QuestionConditionRow.vue` | **NEW** | Per-question condition UI. Type-aware: text→contains input, choice→multi-select, slider/rating→min/max, date→date range, time→time range, upload→submission date range. |
| `src/components/attendees/filters/FormConditionCard.vue` | **NEW** | Card UI for a single form condition. Contains `EventFormSelect`, has_response/response_complete toggles, list of `QuestionConditionRow` components, "Add question" picker. Caches question details internally. |
| `src/components/attendees/EventFormFilterPanel.vue` | **REWORKED** | Now uses list of `FormConditionCard` components with AND/OR operator toggle. Emits `FormsFilterRequest`. |
| `src/components/attendees/RegistrationQuestionsFilterPanel.vue` | **NEW** | Conditions builder for registration questions (EventQuestion, UUID IDs, 6 types). Uses `EventQuestionSelect` for question picking. |
| `src/components/attendees/AttendeeFiltersModal.vue` | **REWORKED** | Wired to structured `AttendeeFiltersRequest`. Has been edited by user since — check current state. |

---

## Generated SDK Types (from `npm run generate-api`)

Key types in `src/api/types.gen.ts`:
- `AttendeeFilterRequestRequest` — root POST body
- `AttendeeFiltersRequest` — the `filters` sub-object
- `FormConditionRequest` — single form condition
- `FormQuestionConditionRequest` — single question condition (form questions, integer IDs)
- `RegQuestionConditionRequest` — single question condition (registration questions, UUID string IDs)
- `FormsFilterRequest` — `{ operator, conditions: FormConditionRequest[] }`
- `RegistrationQuestionsFilterRequest` — `{ operator, conditions: RegQuestionConditionRequest[] }`
- `DemographicsFilterRequest`, `StatusFilterRequest`, `OrdersFilterRequest`, `PaymentsFilterRequest`, `AdvancedFilterRequest`
- `AttendeeFilterResponse` — paginated response (count, page, page_size, total_pages, has_next, has_previous, results)
- `AttendeesFilterCreateData`, `AttendeesFilterCreateResponses` — SDK endpoint types
- `attendeesFilterCreate` function in `src/api/sdk.gen.ts`

---

## Known Issues / Remaining Work

### 1. CHIP LABELS — The main task for the next agent

**Problem:** The `buildActiveFilterChips` function in `useParticipantsUrlState.ts` produces poor chip labels for forms and registration questions. Currently:
- Form conditions show: `"Form Filter: 2 questions"` — should show the form **title** and individual question **titles**
- Registration question conditions show: `"Reg. Question: short_answer"` — should show the question **body/title** and a human-readable description of the filter value

**What's needed:**
- For **form chips**: resolve form UUIDs → form titles (via `useEventForms` composable), resolve question IDs → question titles (via `useEventFormQuestions`), and show something like: `"Feedback Form: Answer contains 'hello'"` per condition
- For **registration question chips**: resolve question UUIDs → question bodies (via `useEventQuestions` composable), show something like: `"Why are you attending? contains 'learn'"`
- The `buildActiveFilterChips` function receives lists: `organisationsList`, `areasList`, `_questionsList` (legacy, now unused), `dietaryList`, `medicalList`, `accessibilityList`, `_formQuestionsList` (legacy, now unused)
- The function needs to be updated to accept (or fetch internally) form titles and question title maps
- Consider passing `eventSlug` into the composable so it can fetch form/question metadata reactively

**Location:** `src/composables/participants/useParticipantsUrlState.ts`, function `buildActiveFilterChips` (line ~207)

**Dashboard call site:** In the dashboard page, `buildActiveFilterChips` is called with 7 args corresponding to the lists above. The call needs updating once the signature changes.

### 2. URL DECODE RESTORATION

**Problem:** When a user navigates to a URL with `?f=<base64>`, the filters are decoded correctly from the URL into `filters.value`, but the `AttendeeFiltersModal` local state (`localFilters`) is initialised from `props.filters` only on mount. If the modal is opened after URL restoration, it should show the previously-applied filters.

**What to verify:**
- `AttendeeFiltersModal` receives `filters` as a prop
- On modal open, `localFilters` is re-synced from `props.filters` 
- The `watch(() => props.filters, ...)` in the modal correctly deep-copies the new structured filter shape
- The section refs (`demog`, `stat`, `ord`, `pay`, `adv`) in the modal are re-initialised when the watch fires

**Location:** `src/components/attendees/AttendeeFiltersModal.vue` — check the `watch(() => props.filters, ...)` handler and the section ref initialisers.

### 3. Minor: `removeFilter` for non-array section fields

**Location:** `useParticipantsUrlState.ts`, `removeFilter` function.  
For nested section fields like `demographics.gender`, the current implementation does:
```ts
filters.value = { ...filters.value, [section]: { ...f[section], [field]: undefined } }
```
This works for simple fields but may leave `undefined` values in the JSON which, when encoded to base64 and decoded, become absent. This is fine — just needs a test pass.

---

## Key Composable Relationships

```
dashboard.vue
  └── useParticipantsUrlState(eventId)
        → filters: AttendeeFiltersRequest  (structured state)
        → postFilterBody: AttendeeFilterRequestRequest  (POST body computed)
        → queryParams  (GET params for stats/bookings/families)
        → buildActiveFilterChips(orgs, areas, _, dietary, medical, accessibility, _) → computed chips
  └── useParticipantsDashboardData(eventId, postFilterBody, queryParams, ...)
        → useAttendeesPostFilter(postFilterBody)  ← main attendee list (POST)
        → useAttendees(statsQuery)  ← stats (GET, unchanged)
        → attendees, totalAttendees (reads from POST response: .results, .count at root)
  └── AttendeeFiltersModal
        :filters="filters"
        @apply="applyFilters"  ← replaces filters.value entirely
        @clear="clearAllFilters"
```

---

## Important Notes for Next Agent

1. **`filter_service.py` was edited by the user** after creation — do not overwrite it without reading current state first.

2. **`AttendeeFiltersModal.vue` was also edited by the user** after the agent created it — read current state before any edits.

3. The `AttendeeFilterResponse.results` type in the generated SDK is `Array<{ [key: string]: unknown }>` (not typed as `AttendeeList[]`). The dashboard uses a double-cast: `... as unknown as ExtendedAttendeeList[]`. Don't "fix" this — it's intentional.

4. The `buildActiveFilterChips` function signature takes 7 positional args. Any change to the signature must be updated at the call site in the dashboard page.

5. The **GET endpoint is untouched**. Stats, bookings, family groups, and dropdowns all still use GET. Only the main attendee roster uses the new POST endpoint.

6. The existing `EventFormQuestionSelect` component emits a `@select` event with the full `QuestionOption` object `{ id, title, type, typeDisplay, minValue, maxValue, options[] }`. The `FormConditionCard` uses this to populate its `questionDetailsCache` map so `QuestionConditionRow` gets the full detail needed to render type-appropriate UI.

7. Registration question IDs are **UUID strings** (`question_id: string` in `RegQuestionConditionRequest`). Form question IDs are **integers** (`question_id: number` in `FormQuestionConditionRequest`). This asymmetry matters in the chip resolver.

8. URL param `?f=` stores base64(JSON). All other URL params (`page`, `search`, `ordering`, `view`) remain as plain query params. Old-style flat params (`?organisation=1&gender=Male` etc.) are **no longer supported** — they are simply ignored.

---

## Repos

- Backend: `c:\Users\Romxs\Documents\projects\websites\amdg\v1-amdg-api`
- Frontend: `c:\Users\Romxs\Documents\projects\websites\amdg\v1-amdg-client`
