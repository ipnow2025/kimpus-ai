import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("studyflow_assignments")
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 255 })
  title: string

  @Column({ type: "varchar", length: 255 })
  course: string

  @Column({ type: "date" })
  due_date: string

  @Column({ type: "enum", enum: ["pending", "completed"], default: "pending" })
  status: "pending" | "completed"

  @Column({ type: "enum", enum: ["low", "medium", "high"], default: "medium" })
  priority: "low" | "medium" | "high"

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "varchar", length: 500, nullable: true })
  submit_link: string

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
