import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, UseInterceptors, UploadedFile, Res, Req } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { mediaFileFilter } from 'src/validators';
import { Response } from 'express';

@ApiTags('books')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('coverImage', {
    fileFilter: (req, file, cb) => mediaFileFilter(req, file, cb)
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({schema: {
    type: "object",
    properties: {
      title: {
        type: 'string'
      },
      subtitle: {
        type: 'string',
      },
      coverImage: {
        type: 'string',
        format: 'binary'
      }
    }
  }})
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'The book has been successfully created.' })
  async create(@UploadedFile() file: Express.Multer.File, @Body() book: Book, @Request() req): Promise<Book> {
    return this.booksService.create(book, req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all books for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of books.' })
  async findAllForUser(@Request() req): Promise<Book[]> {
    return this.booksService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'The book.' })
  async findOne(@Param('id') id: number): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully updated.' })
  async update(@Param('id') id: number, @Body() book: Partial<Book>): Promise<Book> {
    return this.booksService.update(id, book);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({ status: 204, description: 'The book has been successfully deleted.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.booksService.remove(id);
  }


  @Get('file/:type/:filename')
  @ApiOperation({ summary: 'Get book source file (type must be "pdf" or "books"' })
  @ApiResponse({ status: 200, description: 'The source file.' })
  async getBookFile(@Res() res: Response, @Param('type') type: string, @Param('filename') filename: string)  {
    const file = await this.booksService.getFile(type, filename)
    return res.sendFile(file)
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate pdf file' })
  @ApiResponse({ status: 201, description: 'The file' })
  @Post('pdf/:bookId')
  async generatePdf(@Req() req, @Param('bookId') bookId: string) {
    return await this.booksService.generatePdfForAllQuestions(req.user.userId, parseInt(bookId))
  }
}
