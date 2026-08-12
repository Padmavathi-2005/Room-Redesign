import { Injectable } from '@nestjs/common';

@Injectable()
export class DecorationFactory {
  getDecorDescription(customInstructions?: string, selectedProducts?: string[]): string {
    const base = 'styled with curated art prints, organic indoor potted plants, tailored throw pillows, and cozy woven textiles';
    const parts = [base];

    if (selectedProducts && selectedProducts.length > 0) {
      parts.push(`featuring requested products: ${selectedProducts.join(', ')}`);
    }

    if (customInstructions && customInstructions.trim().length > 0) {
      parts.push(`incorporating user custom instructions: ${customInstructions.trim()}`);
    }

    return parts.join(', ');
  }
}
