import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Popsicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  type: number;

  @Column({ default: true })
  availability: boolean;
}
