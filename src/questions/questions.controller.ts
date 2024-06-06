import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Req, UseInterceptors, UploadedFiles, Res } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './questions.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { Response } from 'express';
import { audioFileFilter, mediaFileFilter } from 'src/validators';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'voice', maxCount: 1 },
    { name: 'media', maxCount: 1 },
  ], {
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'media') {
        return mediaFileFilter(req, file, cb);
      } else if (file.fieldname === 'voice') {
        return audioFileFilter(req, file, cb);
      }
      cb(new Error('Unexpected field'), false);
    },
  }))
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
    type: "object",
    properties: {
      question: { type: 'string' },
      media: {
        type: 'string',
        format: 'binary',
      },
      voice: {
        type: 'string',
        format: 'binary',
      },
    },
  }})
  @ApiOperation({ summary: 'Create a new question'})
  @ApiResponse({ status: 201, description: 'The question has been successfully created.' })
  async create(@UploadedFiles() files: { media?: Express.Multer.File[], voice?: Express.Multer.File[] }, @Body() question: Question, @Request() req) {
    return this.questionsService.create(question, req.user.userId, files);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all questions for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of questions.' })
  async findAllForUser(@Req() req) {
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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'voice', maxCount: 1 },
    { name: 'media', maxCount: 1 },
  ], {
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'media') {
        return mediaFileFilter(req, file, cb);
      } else if (file.fieldname === 'voice') {
        return audioFileFilter(req, file, cb);
      }
      cb(new Error('Unexpected field'), false);
    },
  }))
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
    type: "object",
    properties: {
      media: {
        type: 'string',
        format: 'binary',
      },
      voice: {
        type: 'string',
        format: 'binary',
      },
      answer: {
        type: 'string',
      }
    },
  }})
  @ApiOperation({ summary: 'Update a question by ID' })
  @ApiResponse({ status: 200, description: 'The question has been successfully updated.' })
  async update(@UploadedFiles() files: { media?: Express.Multer.File[], voice?: Express.Multer.File[] }, @Param('id') id: number, @Body() question: Partial<Question>): Promise<Question> {
    return this.questionsService.update(id, question, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question by ID' })
  @ApiResponse({ status: 204, description: 'The question has been successfully deleted.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.questionsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('file/:filename')
  @ApiOperation({ summary: 'Get question source file media/audio (type parameter must be "media" or "audio")' })
  @ApiResponse({ status: 200, description: 'The question.' })
  async getMedia(@Res() res: Response, @Param('filename') filename: string) {
    const file = await this.questionsService.getFile(filename)
    return res.sendFile(file)
  }
}
