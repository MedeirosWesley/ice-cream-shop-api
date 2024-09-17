import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IceCreamSyrup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: number;

  @Column({ default: true })
  availability: boolean;
}
