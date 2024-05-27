import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Question } from '../questions/questions.entity';
import { Book } from 'src/books/book.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  questionsEmail: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true, default: "day" })
  questionCreationFrequency: 'day' | 'week' | 'month' | 'year';
f
  @Column({ nullable: true })
  cardName: number

  @Column({ nullable: true })
  cardNumber: number

  @Column({ nullable: true })
  cardExpDate: Date

  @Column({ nullable: true })
  cardCvv: number

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Question, question => question.user)
  questions: Question[];

  @OneToMany(() => Book, book => book.user)
  books: Book[];
}
