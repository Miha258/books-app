import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @ManyToOne(() => User, user => user.books)
  user: User;
}
