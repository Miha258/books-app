import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The question text' })
  @Column()
  question: string;

  @ApiProperty({ description: 'The answer to the question', nullable: true })
  @Column({ nullable: true })
  answer: string;

  @ApiProperty({ description: 'The URL of the media associated with the question', nullable: true })
  @Column({ nullable: true })
  media: string;

  @ApiProperty({ description: 'The URL of the voice associated with the question', nullable: true })
  @Column({ nullable: true })
  voice: string;

  @ManyToOne(() => User, user => user.questions)
  user: User;
}
