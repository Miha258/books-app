import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column({ nullable: true })
  answer: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => User, user => user.questions)
  user: User;
}