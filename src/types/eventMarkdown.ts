export interface TimelineItem {
  id: string
  time: string
  event: string
}

export interface FollowUpTask {
  id: string
  task: string
  owner?: string
}

export interface EventMarkdownForm {
  context: string
  description: string
  impact: string
  timeline: TimelineItem[]
  actionsTaken: string
  resolution: string
  followUps: FollowUpTask[]
}

export const EMPTY_FORM = (): EventMarkdownForm => ({
  context: '',
  description: '',
  impact: '',
  timeline: [],
  actionsTaken: '',
  resolution: '',
  followUps: [],
})
