import { RoomAnalysisResult } from '../../modules/room-analysis/dto/room-analysis.dto';

export interface IVisionAnalyzer {
  analyzeImage(
    imageUrlOrBase64: string,
    options?: any,
  ): Promise<RoomAnalysisResult>;
}
