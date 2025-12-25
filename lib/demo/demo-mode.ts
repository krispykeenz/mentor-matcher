export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Used for GitHub Pages sub-path hosting (e.g. /mentor-matcher)
export const demoBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
