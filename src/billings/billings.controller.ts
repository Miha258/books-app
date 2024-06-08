import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { BillingService } from './billings.service';
import { Billing } from './billing.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/guards/isAdmin.guard';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new billing record' })
  @ApiResponse({ status: 201, description: 'The billing record has been successfully created.', type: Billing })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() billing: Billing): Promise<Billing> {
    return await this.billingService.create(billing);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all billing records' })
  @ApiResponse({ status: 200, description: 'Returns all billing records.', type: [Billing] })
  async findAll(): Promise<Billing[]> {
    return await this.billingService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get a billing record by ID' })
  @ApiResponse({ status: 200, description: 'Returns the billing record.', type: Billing })
  @ApiResponse({ status: 404, description: 'Billing record not found.' })
  async findOne(@Param('id') id: string) {
    return await this.billingService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update a billing record' })
  @ApiResponse({ status: 200, description: 'The billing record has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Billing record not found.' })
  async update(@Param('id') id: string, @Body() billing: Billing) {
    return await this.billingService.update(+id, billing);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete a billing record' })
  @ApiResponse({ status: 200, description: 'The billing record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Billing record not found.' })
  async remove(@Param('id') id: string) {
    return await this.billingService.remove(+id);
  }
}