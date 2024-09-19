import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Drink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  size: number;

  @Column()
  type: number;

  @Column({ default: true })
  availability: boolean;
}