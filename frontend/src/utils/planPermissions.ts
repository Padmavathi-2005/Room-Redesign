export const PLAN_MODEL_PERMISSIONS: Record<string, string[]> = {
  FREE: ['interior-design', 'floor-plan-generator'],
  STARTER: [
    'interior-design',
    'kitchen-design',
    'bedroom-design',
    'exterior-design',
    'floor-plan-generator',
    'sketch-to-render',
  ],
  STANDARD: [
    'interior-design',
    'kitchen-design',
    'bathroom-design',
    'bedroom-design',
    'office-design',
    'ai-room-decorator',
    'exterior-design',
    'landscape-design',
    'floor-plan-generator',
    '3d-floor-plan',
    'floor-plan-maker',
    'sketch-to-render',
    'paint-color-visualizer',
    'change-room-light',
  ],
  PROFESSIONAL: [
    'floor-plan-generator',
    '3d-floor-plan',
    'floor-plan-maker',
    'interior-design',
    'kitchen-design',
    'bathroom-design',
    'bedroom-design',
    'office-design',
    'ai-room-decorator',
    'style-transfer',
    'ai-room-cleaner',
    'paint-color-visualizer',
    'change-room-light',
    'ai-wall-design',
    'ai-flooring-design',
    'change-furniture-ai',
    'exterior-design',
    'landscape-design',
    'garden-design',
    'change-sky',
    'sketch-to-render',
    'ai-architecture-generator',
  ],
};

/**
 * Checks if a specific AI model or tool is allowed for the user's current subscription plan.
 */
export function isModelAllowedForUser(modelSlug: string, user?: any): boolean {
  if (!user) {
    return PLAN_MODEL_PERMISSIONS.FREE.includes(modelSlug);
  }

  if (user.role === 'admin' || user.role === 'ADMIN') {
    return true;
  }

  if (Array.isArray(user.accessibleModels) && user.accessibleModels.length > 0) {
    return user.accessibleModels.includes(modelSlug);
  }

  const tierKey = (user.subscriptionTier || user.plan || 'FREE').toUpperCase();
  const allowedList = PLAN_MODEL_PERMISSIONS[tierKey] || PLAN_MODEL_PERMISSIONS.FREE;
  return allowedList.includes(modelSlug);
}

/**
 * Returns required plan name for a locked model.
 */
export function getRequiredPlanForModel(modelSlug: string): string {
  if (PLAN_MODEL_PERMISSIONS.FREE.includes(modelSlug)) return 'Free';
  if (PLAN_MODEL_PERMISSIONS.STARTER.includes(modelSlug)) return 'Starter';
  if (PLAN_MODEL_PERMISSIONS.STANDARD.includes(modelSlug)) return 'Standard';
  return 'Professional';
}
