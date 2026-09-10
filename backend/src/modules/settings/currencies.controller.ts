import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  /**
   * Public: Get all active currencies for frontend switcher
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getActiveCurrencies() {
    const data = await this.currenciesService.getActiveCurrencies();
    return {
      success: true,
      data,
    };
  }

  /**
   * Admin: Get all currencies (active & inactive)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  @HttpCode(HttpStatus.OK)
  async getAllCurrencies() {
    const data = await this.currenciesService.getAllCurrencies();
    return {
      success: true,
      data,
    };
  }

  /**
   * Admin: Add new currency
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCurrency(@Body() createDto: CreateCurrencyDto) {
    const currency = await this.currenciesService.createCurrency(createDto);
    return {
      success: true,
      message: `Currency ${currency.code} created successfully`,
      data: currency,
    };
  }

  /**
   * Admin: Update currency details
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateCurrency(
    @Param('id') id: string,
    @Body() updateDto: UpdateCurrencyDto,
  ) {
    const currency = await this.currenciesService.updateCurrency(id, updateDto);
    return {
      success: true,
      message: `Currency ${currency.code} updated successfully`,
      data: currency,
    };
  }

  /**
   * Admin: Set currency as default
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/set-default')
  @HttpCode(HttpStatus.OK)
  async setDefaultCurrency(@Param('id') id: string) {
    const currency = await this.currenciesService.setDefaultCurrency(id);
    return {
      success: true,
      message: `Currency ${currency?.code} set as default base currency`,
      data: currency,
    };
  }

  /**
   * Admin: Delete currency
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCurrency(@Param('id') id: string) {
    const result = await this.currenciesService.deleteCurrency(id);
    return result;
  }
}
