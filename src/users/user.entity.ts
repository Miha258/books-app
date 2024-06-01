import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Question } from '../questions/questions.entity';
import { Book } from 'src/books/book.entity';
import { ApiProperty } from '@nestjs/swagger'; // Import the ApiProperty decorator

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The email address of the user', uniqueItems: true })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @Column()
  password: string;

  @ApiProperty({ description: 'The first name of the user', nullable: true })
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty({ description: 'The last name of the user', nullable: true })
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty({ description: 'The URL of the profile picture of the user', nullable: true })
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty({ description: 'The phone number of the user', nullable: true })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'The email address where the user receives questions', nullable: true })
  @Column({ nullable: true })
  questionsEmail: string;

  @ApiProperty({ description: 'The Instagram username of the user', nullable: true })
  @Column({ nullable: true })
  instagram: string;

  @ApiProperty({ description: 'The frequency at which the user creates questions (day, week, month, year)', default: 'day' })
  @Column({ nullable: true, default: "day" })
  questionCreationFrequency: 'day' | 'week' | 'month' | 'year';

  @ApiProperty({ description: 'The name on the user\'s card', nullable: true })
  @Column({ nullable: true })
  cardName: number;

  @ApiProperty({ description: 'The card number of the user', nullable: true })
  @Column({ nullable: true })
  cardNumber: number;

  @ApiProperty({ description: 'The expiration date of the user\'s card', nullable: true })
  @Column({ nullable: true })
  cardExpDate: Date;

  @ApiProperty({ description: 'The CVV of the user\'s card', nullable: true })
  @Column({ nullable: true })
  cardCvv: number;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Question, question => question.user)
  questions: Question[];

  @OneToMany(() => Book, book => book.user)
  books: Book[];
}
