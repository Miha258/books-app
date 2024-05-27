import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './questions.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'The question has been successfully created.' })
  async create(@Body() question: Question, @Request() req): Promise<Question> {
    return this.questionsService.create(question, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiOperation({ summary: 'Get all questions for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of questions.' })
  async findAllForUser(@Req() req): Promise<Question[]> {
    return this.questionsService.findAllForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiResponse({ status: 200, description: 'The question.' })
  async findOne(@Param('id') id: number): Promise<Question> {
    return this.questionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a question by ID' })
  @ApiResponse({ status: 200, description: 'The question has been successfully updated.' })
  async update(@Param('id') id: number, @Body() question: Question): Promise<Question> {
    return this.questionsService.update(id, question);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question by ID' })
  @ApiResponse({ status: 204, description: 'The question has been successfully deleted.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.questionsService.remove(id);
  }
}
