import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Popsicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  type: number;

  @Column({ default: true })
  availability: boolean;
}
