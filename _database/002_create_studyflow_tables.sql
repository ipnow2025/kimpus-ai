-- StudyFlow Platform Database Schema with TypeORM

-- Assignments table
CREATE TABLE studyflow_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  description TEXT,
  submit_link VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Courses table
CREATE TABLE studyflow_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  instructor VARCHAR(255),
  credits INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schedule table
CREATE TABLE studyflow_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  day_of_week VARCHAR(10) NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  room VARCHAR(100),
  instructor VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for better performance
CREATE INDEX idx_assignments_status ON studyflow_assignments(status);
CREATE INDEX idx_assignments_due_date ON studyflow_assignments(due_date);
CREATE INDEX idx_schedule_day ON studyflow_schedule(day_of_week);
CREATE INDEX idx_courses_code ON studyflow_courses(code);

-- Insert sample data
INSERT INTO studyflow_courses (name, code, instructor, credits) VALUES
('데이터베이스시스템', 'CS301', '김교수', 3),
('알고리즘', 'CS302', '이교수', 3),
('웹프로그래밍', 'CS303', '박교수', 3),
('소프트웨어공학', 'CS304', '최교수', 3);

INSERT INTO studyflow_assignments (title, course, due_date, status, priority, description, submit_link) VALUES
('데이터베이스 설계 프로젝트', '데이터베이스시스템', '2025-05-28', 'pending', 'high', 'E-R 다이어그램 작성 및 정규화 과정 포함', 'https://lms.university.ac.kr/submit/123'),
('알고리즘 분석 보고서', '알고리즘', '2025-05-26', 'pending', 'medium', '정렬 알고리즘 시간복잡도 분석', ''),
('웹프로그래밍 과제', '웹프로그래밍', '2025-05-25', 'completed', 'low', 'React를 이용한 SPA 개발', 'https://github.com/student/web-project');

INSERT INTO studyflow_schedule (day_of_week, time_slot, subject, room, instructor) VALUES
('월', '09:00-10:30', '데이터베이스시스템', '공학관 301', '김교수'),
('월', '13:00-14:30', '알고리즘', '공학관 205', '이교수'),
('화', '10:00-11:30', '웹프로그래밍', 'IT관 401', '박교수'),
('수', '09:00-10:30', '데이터베이스시스템', '공학관 301', '김교수'),
('목', '13:00-14:30', '소프트웨어공학', '공학관 102', '최교수'),
('금', '10:00-11:30', '웹프로그래밍', 'IT관 401', '박교수');
