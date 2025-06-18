-- StudyFlow Assignment Platform Database Schema

-- Users table (students)
CREATE TABLE studyflow_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  student_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE studyflow_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  credits INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User course enrollments
CREATE TABLE studyflow_user_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES studyflow_users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES studyflow_courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id)
);

-- Assignments table
CREATE TABLE studyflow_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  submit_link VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES studyflow_users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES studyflow_courses(id) ON DELETE CASCADE
);

-- Assignment attachments
CREATE TABLE studyflow_assignment_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES studyflow_assignments(id) ON DELETE CASCADE
);

-- Schedule/Classes table
CREATE TABLE studyflow_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(100),
  building VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES studyflow_users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES studyflow_courses(id) ON DELETE CASCADE
);

-- User statistics tracking
CREATE TABLE studyflow_user_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  assignments_completed INT DEFAULT 0,
  assignments_added INT DEFAULT 0,
  study_hours DECIMAL(4,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES studyflow_users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date)
);

-- Indexes for better performance
CREATE INDEX idx_assignments_user_status ON studyflow_assignments(user_id, status);
CREATE INDEX idx_assignments_due_date ON studyflow_assignments(due_date);
CREATE INDEX idx_schedule_user_day ON studyflow_schedule(user_id, day_of_week);
CREATE INDEX idx_statistics_user_date ON studyflow_user_statistics(user_id, date);
