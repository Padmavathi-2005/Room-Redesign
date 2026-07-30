/**
 * Application Constants Barrel Export
 */
export const APP_NAME = 'RoomAI';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const DESIGN_STYLES = [
  'Modern',
  'Scandinavian',
  'Minimalist',
  'Industrial',
  'Luxury',
  'Cyberpunk',
  'Tropical',
  'Coastal',
] as const;

export const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Kitchen',
  'Home Office',
  'Bathroom',
  'Gaming Room',
] as const;
