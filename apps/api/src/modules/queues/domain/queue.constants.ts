export const AUTOMATION_EVENTS_QUEUE = "automation-events-queue";
export const AUTOMATION_SEND_QUEUE = "automation-send-queue";

export const AUTOMATION_EVENT_JOB = "process-automation-event";
export const AUTOMATION_SEND_JOB = "send-automation-template";

export const QUEUE_REMOVE_ON_COMPLETE = {
  age: 7 * 24 * 60 * 60,
  count: 1000
} as const;

export const QUEUE_REMOVE_ON_FAIL = {
  age: 30 * 24 * 60 * 60,
  count: 5000
} as const;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 60_000
  },
  removeOnComplete: QUEUE_REMOVE_ON_COMPLETE,
  removeOnFail: QUEUE_REMOVE_ON_FAIL
} as const;
