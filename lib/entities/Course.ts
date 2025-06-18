import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("studyflow_courses")
export class Course {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 50, unique: true })
  code: string

  @Column({ type: "varchar", length: 255, nullable: true })
  instructor: string

  @Column({ type: "int", default: 3 })
  credits: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
