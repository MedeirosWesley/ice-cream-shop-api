import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Additional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  type: number;
}
