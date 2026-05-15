import type { EventMarkdownForm, TimelineItem, FollowUpTask } from '~/types/eventMarkdown'
import { EMPTY_FORM } from '~/types/eventMarkdown'

// ---------------------------------------------------------------------------
// markdown → structured object
// ---------------------------------------------------------------------------

/**
 * Extract the body text that belongs to a given `# Section` heading.
 * Reads everything between the heading and the next `# ` heading (or EOF).
 */
function extractSection(markdown: string, heading: string): string {
  const pattern = new RegExp(
    `^#\\s+${escapeRegex(heading)}\\s*$([\\s\\S]*?)(?=^#\\s|\\z)`,
    'mi',
  )
  const match = markdown.match(pattern)
  return match ? match[1].trim() : ''
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Parse `- HH:MM UTC — description` timeline lines */
function parseTimelineLines(block: string): TimelineItem[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line, i) => {
      const body = line.replace(/^-\s*/, '')
      const sep = body.indexOf(' — ')
      if (sep !== -1) {
        return {
          id: `tl-${Date.now()}-${i}`,
          time: body.slice(0, sep).trim(),
          event: body.slice(sep + 3).trim(),
        }
      }
      // Fallback: treat whole line as event text
      return { id: `tl-${Date.now()}-${i}`, time: '', event: body }
    })
}

/** Parse `- [ ] task (@owner)` follow-up lines */
function parseFollowUpLines(block: string): FollowUpTask[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line, i) => {
      const body = line.replace(/^-\s*\[[ xX]?\]\s*/, '').trim()
      const ownerMatch = body.match(/\s*\(@([^)]+)\)\s*$/)
      if (ownerMatch) {
        return {
          id: `fu-${Date.now()}-${i}`,
          task: body.slice(0, body.length - ownerMatch[0].length).trim(),
          owner: ownerMatch[1],
        }
      }
      return { id: `fu-${Date.now()}-${i}`, task: body, owner: '' }
    })
}

export function parseMarkdownToForm(markdown: string): EventMarkdownForm {
  if (!markdown || !markdown.trim()) return EMPTY_FORM()

  return {
    context: extractSection(markdown, 'Context'),
    description: extractSection(markdown, 'Event Description'),
    impact: extractSection(markdown, 'Impact'),
    timeline: parseTimelineLines(extractSection(markdown, 'Timeline')),
    actionsTaken: extractSection(markdown, 'Actions Taken'),
    resolution: extractSection(markdown, 'Resolution'),
    followUps: parseFollowUpLines(extractSection(markdown, 'Follow-up Tasks')),
  }
}

// ---------------------------------------------------------------------------
// structured object → markdown
// ---------------------------------------------------------------------------

function section(title: string, body: string): string {
  if (!body.trim()) return ''
  return `# ${title}\n\n${body.trim()}\n`
}

function timelineToMd(items: TimelineItem[]): string {
  if (!items.length) return ''
  const lines = items
    .filter((i) => i.time || i.event)
    .map((i) => `- ${i.time ? `${i.time} — ` : ''}${i.event}`)
    .join('\n')
  return lines
}

function followUpsToMd(items: FollowUpTask[]): string {
  if (!items.length) return ''
  return items
    .filter((i) => i.task)
    .map((i) => `- [ ] ${i.task}${i.owner ? ` (@${i.owner})` : ''}`)
    .join('\n')
}

export function formToMarkdown(form: EventMarkdownForm): string {
  const parts: string[] = []

  if (form.context.trim()) parts.push(section('Context', form.context))
  if (form.description.trim()) parts.push(section('Event Description', form.description))
  if (form.impact.trim()) parts.push(section('Impact', form.impact))

  const tlMd = timelineToMd(form.timeline)
  if (tlMd) parts.push(`# Timeline\n\n${tlMd}\n`)

  if (form.actionsTaken.trim()) parts.push(section('Actions Taken', form.actionsTaken))
  if (form.resolution.trim()) parts.push(section('Resolution', form.resolution))

  const fuMd = followUpsToMd(form.followUps)
  if (fuMd) parts.push(`# Follow-up Tasks\n\n${fuMd}\n`)

  return parts.join('\n')
}
