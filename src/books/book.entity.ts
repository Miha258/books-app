import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The title of the book' })
  @Column()
  title: string;

  @ApiProperty({ description: 'The subtitle of the book', nullable: true })
  @Column({ nullable: true })
  subtitle: string;

  @ApiProperty({ description: 'The media of the cover image of the book', nullable: true })
  @Column({ nullable: true })
  coverImage: string;

  @ApiProperty({ description: 'Is book generated in pdf', nullable: true })
  @Column({ nullable: true })
  generated: boolean;

  @ManyToOne(() => User, user => user.books)
  user: User;
}
