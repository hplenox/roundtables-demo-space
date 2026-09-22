// Shared localStorage key for submitted "New Survey" drafts (see survey-draft-store.ts).
// Split into its own module so mock-data.ts can fall back to it without
// creating a circular import between mock-data.ts and survey-draft-store.ts
// (the store already imports MOCK_SURVEYS from mock-data.ts).
export const SUBMITTED_SURVEYS_KEY = "rt_custom_surveys_v1";
