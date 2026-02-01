<template>
  <div class="template-selector">
    <div class="template-selector__header">
      <h3>Apply Template</h3>
      <button
        v-if="hasWindows"
        @click="showSaveModal = true"
        class="btn btn-secondary"
      >
        Save as Template
      </button>
    </div>

    <div v-if="isLoading" class="template-selector__loading">
      Loading templates...
    </div>

    <div v-else-if="error" class="template-selector__error">
      Failed to load templates: {{ error.message }}
    </div>

    <div v-else-if="templates?.results.length === 0" class="template-selector__empty">
      <p>No templates available yet.</p>
      <p v-if="hasWindows" class="text-muted">
        Save your current availability windows as a template to reuse them on future events.
      </p>
    </div>

    <div v-else class="template-selector__grid">
      <div
        v-for="template in templates?.results"
        :key="template.template_id"
        class="template-card"
        :class="{ 'template-card--applying': isApplying && selectedTemplateId === template.template_id }"
      >
        <div class="template-card__header">
          <div class="template-card__title-section">
            <h4>{{ template.name }}</h4>
            <span v-if="template.is_predefined" class="badge badge-primary">System</span>
          </div>
          <!-- Actions for user's own templates -->
          <div v-if="!template.is_predefined && isOwnedByUser(template)" class="template-card__actions">
            <button
              @click.stop="startEditTemplate(template)"
              class="btn-icon"
              title="Edit template"
            >
              ✏️
            </button>
            <button
              @click.stop="confirmDeleteTemplate(template)"
              class="btn-icon btn-icon--danger"
              title="Delete template"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <p v-if="template.description" class="template-card__description">
          {{ template.description }}
        </p>

        <div class="template-card__windows">
          <div class="template-card__windows-label">
            {{ template.windows_count }} window{{ template.windows_count !== 1 ? 's' : '' }}
          </div>
          <ul v-if="Array.isArray(template.windows_config)" class="template-card__windows-list">
            <li v-for="(window, idx) in (template.windows_config as WindowConfig[])" :key="idx">
              {{ formatWindowType(window.availability_type) }}
              <span class="text-muted">
                ({{ formatOffset(window.offset_from_event_start) }} to {{ formatOffset(window.offset_to_event_start) }})
              </span>
            </li>
          </ul>
        </div>

        <button
          @click="previewAndApplyTemplate(template.template_id)"
          :disabled="isApplying || isPreviewing"
          class="btn btn-primary btn-block"
        >
          {{ isPreviewing && selectedTemplateId === template.template_id ? 'Loading Preview...' : 
             isApplying && selectedTemplateId === template.template_id ? 'Applying...' : 
             'Preview & Apply' }}
        </button>
      </div>
    </div>

    <!-- Save Template Modal -->
    <div v-if="showSaveModal" class="modal-overlay" @click.self="showSaveModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Save Windows as Template</h3>
          <button @click="showSaveModal = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveAsTemplate" class="modal-body">
          <div class="form-group">
            <label for="template-name">Template Name *</label>
            <input
              id="template-name"
              v-model="templateName"
              type="text"
              class="form-control"
              placeholder="e.g., Standard Event, Paid Conference"
              required
            />
          </div>

          <div class="form-group">
            <label for="template-description">Description</label>
            <textarea
              id="template-description"
              v-model="templateDescription"
              class="form-control"
              rows="3"
              placeholder="Optional description of when to use this template"
            />
          </div>

          <div class="alert alert-info">
            <strong>Note:</strong> Your current {{ windowCount }} availability window{{ windowCount !== 1 ? 's' : '' }}
            will be saved as a template with dates calculated as offsets from the event start date.
          </div>
        </form>

        <div class="modal-footer">
          <button
            @click="showSaveModal = false"
            type="button"
            class="btn btn-secondary"
            :disabled="isSaving"
          >
            Cancel
          </button>
          <button
            @click="saveAsTemplate"
            type="submit"
            class="btn btn-primary"
            :disabled="isSaving || !templateName.trim()"
          >
            {{ isSaving ? 'Saving...' : 'Save Template' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Template Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Template</h3>
          <button @click="showEditModal = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="updateTemplate" class="modal-body">
          <div class="alert alert-warning">
            <strong>⚠️ Note:</strong> You can only edit the name and description. Window configurations are immutable.
          </div>

          <div class="form-group">
            <label for="edit-template-name">Template Name *</label>
            <input
              id="edit-template-name"
              v-model="editTemplateName"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="edit-template-description">Description</label>
            <textarea
              id="edit-template-description"
              v-model="editTemplateDescription"
              class="form-control"
              rows="3"
            />
          </div>
        </form>

        <div class="modal-footer">
          <button
            @click="showEditModal = false"
            type="button"
            class="btn btn-secondary"
            :disabled="isUpdating"
          >
            Cancel
          </button>
          <button
            @click="updateTemplate"
            type="submit"
            class="btn btn-primary"
            :disabled="isUpdating || !editTemplateName.trim()"
          >
            {{ isUpdating ? 'Updating...' : 'Update Template' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import { 
  useAvailabilityTemplates, 
  useApplyAvailabilityTemplate, 
  useSaveWindowsAsTemplate,
  useUpdateAvailabilityTemplate,
  useDeleteAvailabilityTemplate,
  usePreviewTemplateApplication
} from '~/composables/resources/events/availability-templates'
import { useMe } from '~/composables/resources/user/users'
import type { AvailabilityWindowTemplate } from '~/api/types.gen'

interface WindowConfig {
  availability_type: string
  offset_from_event_start: number
  offset_to_event_start: number
  name?: string
  description?: string
}

const props = defineProps<{
  eventId: string
  hasWindows?: boolean
  windowCount?: number
}>()

const emit = defineEmits<{
  templateApplied: []
}>()

const { $notyf } = useNuxtApp()
const { data: user } = useMe()

// Check if template is owned by current user
function isOwnedByUser(template: AvailabilityWindowTemplate): boolean {
  return template.created_by === user.value?.data?.id
}

// Fetch templates
const { data: templates, isLoading, error } = useAvailabilityTemplates()

// Preview template
const { mutateAsync: previewTemplateMutation, isPending: isPreviewing } = usePreviewTemplateApplication(props.eventId)
const selectedTemplateId = ref<string>()

async function previewAndApplyTemplate(templateId: string) {
  selectedTemplateId.value = templateId
  
  try {
    // First, get the preview with conflicts
    const preview = await previewTemplateMutation(templateId)
    
    if (!preview) {
      $notyf.error('Failed to get template preview')
      selectedTemplateId.value = undefined
      return
    }
    
    // If there are conflicts, show warning with SweetAlert
    if (preview.has_conflicts && preview.conflicts && preview.conflicts.length > 0) {
      const conflictList = preview.conflicts
        .map((c: any) => {
          const severity = c.severity === 'high' ? '🔴' : '🟡'
          return `${severity} ${c.message}`
        })
        .join('<br>')
      
      const result = await Swal.fire({
        title: 'Conflicts Detected',
        html: `
          <div style="text-align: left;">
            <p><strong>${preview.conflicts.length} conflict(s) detected</strong></p>
            <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 4px; font-size: 0.9rem;">
              ${conflictList}
            </div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
              This template will create ${preview.windows?.length || 0} window(s). Overlapping windows may cause confusion for users.
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Apply Anyway',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
      })
      
      if (!result.isConfirmed) {
        selectedTemplateId.value = undefined
        return
      }
    } else {
      // No conflicts, show success preview
      const windowList = preview.windows
        ?.map((w: any) => `✓ ${w.name}`)
        .join('<br>')
      
      const result = await Swal.fire({
        title: 'Preview',
        html: `
          <div style="text-align: left;">
            <p>This template will create <strong>${preview.windows?.length} window(s)</strong> with no conflicts:</p>
            <div style="margin-top: 1rem; padding: 1rem; background: #d4edda; border-radius: 4px; font-size: 0.9rem;">
              ${windowList}
            </div>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Apply Template',
        cancelButtonText: 'Cancel',
      })
      
      if (!result.isConfirmed) {
        selectedTemplateId.value = undefined
        return
      }
    }
    
    // Apply the template
    await applyTemplate(templateId)
  } catch (err: any) {
    $notyf.error(err.response?.data?.detail || 'Failed to preview template')
    selectedTemplateId.value = undefined
  }
}

// Apply template
const { mutateAsync: applyTemplateMutation, isPending: isApplying } = useApplyAvailabilityTemplate(props.eventId)

async function applyTemplate(templateId: string) {
  try {
    const response = await applyTemplateMutation(templateId)
    $notyf.success('Template applied successfully')
    emit('templateApplied')
  } catch (err: any) {
    $notyf.error(err.response?.data?.detail || 'Failed to apply template')
  } finally {
    selectedTemplateId.value = undefined
  }
}

// Edit template
const showEditModal = ref(false)
const editingTemplate = ref<AvailabilityWindowTemplate | null>(null)
const editTemplateName = ref('')
const editTemplateDescription = ref('')
const { mutateAsync: updateTemplateMutation, isPending: isUpdating } = useUpdateAvailabilityTemplate()

function startEditTemplate(template: AvailabilityWindowTemplate) {
  editingTemplate.value = template
  editTemplateName.value = template.name
  editTemplateDescription.value = template.description || ''
  showEditModal.value = true
}

async function updateTemplate() {
  if (!editTemplateName.value.trim() || !editingTemplate.value) return

  try {
    await updateTemplateMutation({
      templateId: editingTemplate.value.template_id,
      data: {
        name: editTemplateName.value.trim(),
        description: editTemplateDescription.value.trim() || undefined,
      },
    })
    $notyf.success('Template updated successfully')
    showEditModal.value = false
    editingTemplate.value = null
    editTemplateName.value = ''
    editTemplateDescription.value = ''
  } catch (err: any) {
    $notyf.error(err.response?.data?.detail || 'Failed to update template')
  }
}

// Delete template
const { mutateAsync: deleteTemplateMutation, isPending: isDeleting } = useDeleteAvailabilityTemplate()

async function confirmDeleteTemplate(template: AvailabilityWindowTemplate) {
  const result = await Swal.fire({
    title: 'Delete Template?',
    html: `
      <p>Are you sure you want to delete <strong>"${template.name}"</strong>?</p>
      <p style="color: #dc3545; font-size: 0.9rem; margin-top: 1rem;">
        ⚠️ This action cannot be undone.
      </p>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc3545',
  })

  if (!result.isConfirmed) return

  try {
    await deleteTemplateMutation(template.template_id)
    $notyf.success('Template deleted successfully')
  } catch (err: any) {
    $notyf.error(err.response?.data?.detail || 'Failed to delete template')
  }
}

// Save as template
const showSaveModal = ref(false)
const templateName = ref('')
const templateDescription = ref('')
const { mutateAsync: saveTemplateMutation, isPending: isSaving } = useSaveWindowsAsTemplate(props.eventId)

async function saveAsTemplate() {
  if (!templateName.value.trim()) return

  try {
    await saveTemplateMutation({
      name: templateName.value.trim(),
      description: templateDescription.value.trim() || undefined,
    })
    $notyf.success('Template saved successfully')
    showSaveModal.value = false
    templateName.value = ''
    templateDescription.value = ''
  } catch (err: any) {
    $notyf.error(err.response?.data?.detail || 'Failed to save template')
  }
}

// Helper functions
function formatWindowType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatOffset(days: number): string {
  if (days === 0) return 'Event day'
  if (days === 1) return '1 day after'
  if (days === -1) return '1 day before'
  if (days > 0) return `${days} days after`
  return `${Math.abs(days)} days before`
}
</script>

<style scoped>
.template-selector {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.template-selector__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.template-selector__header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.template-selector__loading,
.template-selector__error,
.template-selector__empty {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.template-selector__error {
  color: #dc3545;
}

.template-selector__empty .text-muted {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.template-selector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
}

.template-card--applying {
  opacity: 0.6;
  pointer-events: none;
}

.template-card__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.template-card__title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.template-card__header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.template-card__actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #f8f9fa;
}

.btn-icon--danger:hover {
  background-color: #fee;
  color: #dc3545;
}

.template-card__description {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.template-card__windows {
  margin-bottom: 1.25rem;
}

.template-card__windows-label {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #495057;
}

.template-card__windows-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}

.template-card__windows-list li {
  padding: 0.375rem 0;
  border-bottom: 1px solid #f1f3f5;
}

.template-card__windows-list li:last-child {
  border-bottom: none;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
}

.badge-primary {
  background-color: #0d6efd;
  color: white;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5c636a;
}

.btn-block {
  width: 100%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #000;
}

.modal-body {
  padding: 1.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #dee2e6;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-control:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.alert-info {
  background-color: #cfe2ff;
  border: 1px solid #b6d4fe;
  color: #084298;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffd966;
  color: #856404;
}

.text-muted {
  color: #6c757d;
}
</style>
