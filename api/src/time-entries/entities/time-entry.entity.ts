import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TimeEntryType {
  IN = 'IN',
  OUT = 'OUT',
  LUNCH_OUT = 'LUNCH_OUT',
  LUNCH_IN = 'LUNCH_IN',
}

@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: TimeEntryType,
  })
  type: TimeEntryType;

  @Column('timestamp')
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.timeEntries)
  @JoinColumn({ name: 'userId' })
  user: User;
}