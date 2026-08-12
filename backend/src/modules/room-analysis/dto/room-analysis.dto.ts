export interface CameraLockInfo {
  cameraPosition?: string;
  cameraHeight?: string;
  cameraRotation?: string;
  lens?: string;
  perspective?: string;
  horizon?: string;
  crop?: string;
  promptClause: string;
}

export interface FixedElement {
  name: string;
  editable: false;
  details?: string;
}

export interface MovableObject {
  name: string;
  replaceable: true;
  location?: string;
}

export interface ColorAnalysis {
  wallColor?: string;
  floorColor?: string;
  furnitureColor?: string;
  accentColor?: string;
  curtainColor?: string;
  ceilingColor?: string;
}

export interface RoomAnalysisResult {
  cameraLock: CameraLockInfo;
  fixedElements: FixedElement[];
  movableObjects: MovableObject[];
  editableSurfaces: string[];
  colors: ColorAnalysis;
  emptySpace: string[];
  rawAnalysisText?: string;
}
