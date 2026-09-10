import { Injectable, OnModuleInit, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument, CurrencyPosition } from './schemas/currency.schema';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';

@Injectable()
export class CurrenciesService implements OnModuleInit {
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultCurrencies();
  }

  /**
   * Seed initial popular world currencies if collection is empty
   */
  private async seedDefaultCurrencies() {
    const count = await this.currencyModel.countDocuments();
    if (count === 0) {
      const initialCurrencies = [
        {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          exchangeRate: 1.0,
          isDefault: true,
          isActive: true,
          position: CurrencyPosition.PREFIX,
          decimalPlaces: 2,
        },
        {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          exchangeRate: 0.92,
          isDefault: false,
          isActive: true,
          position: CurrencyPosition.SUFFIX,
          decimalPlaces: 2,
        },
        {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹',
          exchangeRate: 83.5,
          isDefault: false,
          isActive: true,
          position: CurrencyPosition.PREFIX,
          decimalPlaces: 2,
        },
        {
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          exchangeRate: 0.79,
          isDefault: false,
          isActive: true,
          position: CurrencyPosition.PREFIX,
          decimalPlaces: 2,
        },
      ];

      await this.currencyModel.insertMany(initialCurrencies);
      console.log('✅ Default currencies successfully seeded into MongoDB.');
    }
  }

  /**
   * Get all active currencies for frontend users
   */
  async getActiveCurrencies() {
    const currencies = await this.currencyModel.find({ isActive: true }).sort({ isDefault: -1, code: 1 }).exec();
    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0];
    return {
      currencies,
      defaultCurrency,
    };
  }

  /**
   * Get all currencies for Admin management
   */
  async getAllCurrencies() {
    const currencies = await this.currencyModel.find().sort({ isDefault: -1, code: 1 }).exec();
    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0];
    return {
      currencies,
      defaultCurrency,
      totalCount: currencies.length,
    };
  }

  /**
   * Create a new currency
   */
  async createCurrency(createDto: CreateCurrencyDto) {
    const normalizedCode = createDto.code.trim().toUpperCase();
    const existing = await this.currencyModel.findOne({ code: normalizedCode });
    if (existing) {
      throw new ConflictException(`Currency with code '${normalizedCode}' already exists`);
    }

    if (createDto.isDefault) {
      await this.currencyModel.updateMany({}, { isDefault: false });
    }

    const created = new this.currencyModel({
      ...createDto,
      code: normalizedCode,
      name: createDto.name.trim(),
      symbol: createDto.symbol.trim(),
    });

    return created.save();
  }

  /**
   * Update currency
   */
  async updateCurrency(id: string, updateDto: UpdateCurrencyDto) {
    const currency = await this.currencyModel.findById(id);
    if (!currency) {
      throw new NotFoundException(`Currency with ID '${id}' not found`);
    }

    if (updateDto.code) {
      const normalizedCode = updateDto.code.trim().toUpperCase();
      const existing = await this.currencyModel.findOne({ code: normalizedCode, _id: { $ne: id } });
      if (existing) {
        throw new ConflictException(`Currency with code '${normalizedCode}' already exists`);
      }
      currency.code = normalizedCode;
    }

    if (updateDto.name !== undefined) currency.name = updateDto.name.trim();
    if (updateDto.symbol !== undefined) currency.symbol = updateDto.symbol.trim();
    if (updateDto.exchangeRate !== undefined) currency.exchangeRate = Number(updateDto.exchangeRate);
    if (updateDto.isActive !== undefined) {
      if (currency.isDefault && !updateDto.isActive) {
        throw new BadRequestException('Default base currency cannot be set to inactive.');
      }
      currency.isActive = updateDto.isActive;
    }
    if (updateDto.position !== undefined) currency.position = updateDto.position;
    if (updateDto.decimalPlaces !== undefined) currency.decimalPlaces = Number(updateDto.decimalPlaces);

    if (updateDto.isDefault && !currency.isDefault) {
      await this.currencyModel.updateMany({ _id: { $ne: id } }, { isDefault: false });
      currency.isDefault = true;
      currency.isActive = true;
      currency.exchangeRate = 1.0;
    }

    return currency.save();
  }

  /**
   * Delete a currency
   */
  async deleteCurrency(id: string) {
    const currency = await this.currencyModel.findById(id);
    if (!currency) {
      throw new NotFoundException(`Currency with ID '${id}' not found`);
    }

    if (currency.isDefault) {
      throw new BadRequestException('Cannot delete the default base currency. Set another currency as default first.');
    }

    await this.currencyModel.findByIdAndDelete(id);
    return { success: true, message: `Currency ${currency.code} deleted successfully` };
  }

  /**
   * Set a currency as the default base currency
   * Recalculates other exchange rates relative to the new base
   */
  async setDefaultCurrency(id: string) {
    const newDefault = await this.currencyModel.findById(id);
    if (!newDefault) {
      throw new NotFoundException(`Currency with ID '${id}' not found`);
    }

    if (newDefault.isDefault) {
      return newDefault;
    }

    const oldRate = newDefault.exchangeRate > 0 ? newDefault.exchangeRate : 1.0;

    // Fetch all currencies
    const allCurrencies = await this.currencyModel.find();
    for (const curr of allCurrencies) {
      if (curr._id.toString() === id) {
        curr.isDefault = true;
        curr.isActive = true;
        curr.exchangeRate = 1.0;
      } else {
        curr.isDefault = false;
        // Convert old rate to new base rate: newRate = oldCurrRate / newDefaultOldRate
        curr.exchangeRate = Number((curr.exchangeRate / oldRate).toFixed(6));
      }
      await curr.save();
    }

    return this.currencyModel.findById(id);
  }
}
