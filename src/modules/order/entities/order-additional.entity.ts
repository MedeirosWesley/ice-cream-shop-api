import { Acai } from "src/modules/acai/entities/acai.entity";
import { Additional } from "src/modules/additional/entities/additional.entity";
import { MilkShake } from "src/modules/milk-shake/entities/milk-shake.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AcaiAdditional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  isSeparated: boolean;

  @ManyToOne(() => Acai, acai => acai.additionals, { onDelete: 'CASCADE' })
  @JoinColumn()
  acai: Acai;

  @ManyToOne(() => Additional, { eager: true })
  @JoinColumn()
  additional: Additional;
}
