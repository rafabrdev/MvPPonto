import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('date')
  date: Date;

  @Column('time')
  startTime: string; // Format: HH:mm

  @Column('time')
  endTime: string; // Format: HH:mm

  @Column('time', { nullable: true })
  lunchStart?: string; // Format: HH:mm

  @Column('time', { nullable: true })
  lunchEnd?: string; // Format: HH:mm

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn({ name: 'userId' })
  user: User;
}