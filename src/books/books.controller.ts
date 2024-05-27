import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('books')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'The book has been successfully created.' })
  async create(@Body() book: Book, @Request() req): Promise<Book> {
    book.user = req.user;
    return this.booksService.create(book);
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
  async update(@Param('id') id: number, @Body() book: Book): Promise<Book> {
    return this.booksService.update(id, book);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({ status: 204, description: 'The book has been successfully deleted.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.booksService.remove(id);
  }
}
