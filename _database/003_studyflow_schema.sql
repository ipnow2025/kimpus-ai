-- StudyFlow 데이터베이스 스키마 (PRD 요구사항 반영)
-- 모든 테이블에 공통 필드 적용: reg_date, mdy_date, del_date, is_flag

-- 과목 테이블
CREATE TABLE IF NOT EXISTS courses (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '과목 고유 ID',
    member_idx INT(11) NOT NULL COMMENT '사용자 식별자',
    name VARCHAR(255) NOT NULL COMMENT '과목명',
    code VARCHAR(50) NOT NULL COMMENT '과목 코드',
    instructor VARCHAR(100) DEFAULT NULL COMMENT '담당 교수',
    credits TINYINT(2) NOT NULL DEFAULT 3 COMMENT '학점',
    description TEXT DEFAULT NULL COMMENT '과목 설명',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    INDEX idx_member_idx (member_idx),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='과목 정보 테이블';

-- 팀 테이블
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '팀 고유 ID',
    creator_member_idx INT(11) NOT NULL COMMENT '팀 생성자 식별자',
    name VARCHAR(255) NOT NULL COMMENT '팀명',
    description TEXT DEFAULT NULL COMMENT '팀 설명',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    INDEX idx_creator_member_idx (creator_member_idx),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='팀 정보 테이블';

-- 팀 멤버 테이블
CREATE TABLE IF NOT EXISTS team_members (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '팀 멤버 고유 ID',
    team_id VARCHAR(50) NOT NULL COMMENT '팀 ID',
    member_idx INT(11) NOT NULL COMMENT '사용자 식별자',
    member_name VARCHAR(100) NOT NULL COMMENT '멤버 이름',
    member_avatar VARCHAR(255) DEFAULT NULL COMMENT '멤버 아바타 URL',
    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '초대 상태',
    role ENUM('admin', 'member') NOT NULL DEFAULT 'member' COMMENT '팀 내 역할',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_member (team_id, member_idx),
    INDEX idx_team_id (team_id),
    INDEX idx_member_idx (member_idx),
    INDEX idx_status (status),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='팀 멤버 테이블';

-- 과제 테이블
CREATE TABLE IF NOT EXISTS assignments (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '과제 고유 ID',
    member_idx INT(11) NOT NULL COMMENT '사용자 식별자',
    title VARCHAR(255) NOT NULL COMMENT '과제 제목',
    course_id INT(11) DEFAULT NULL COMMENT '과목 ID',
    course_name VARCHAR(255) NOT NULL COMMENT '과목명',
    due_date DATE NOT NULL COMMENT '마감일',
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending' COMMENT '과제 상태',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' COMMENT '우선순위',
    description TEXT DEFAULT NULL COMMENT '과제 설명',
    submit_link VARCHAR(500) DEFAULT NULL COMMENT '제출 링크',
    notes TEXT DEFAULT NULL COMMENT '메모',
    is_team_assignment TINYINT(1) NOT NULL DEFAULT 0 COMMENT '팀 과제 여부 (0:개인, 1:팀)',
    team_id VARCHAR(50) DEFAULT NULL COMMENT '팀 ID (팀 과제인 경우)',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_member_idx (member_idx),
    INDEX idx_course_id (course_id),
    INDEX idx_team_id (team_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='과제 정보 테이블';

-- 스케줄 테이블
CREATE TABLE IF NOT EXISTS schedules (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '스케줄 고유 ID',
    member_idx INT(11) NOT NULL COMMENT '사용자 식별자',
    course_id INT(11) DEFAULT NULL COMMENT '과목 ID',
    subject VARCHAR(255) NOT NULL COMMENT '과목명',
    day_of_week ENUM('월', '화', '수', '목', '금', '토', '일') NOT NULL COMMENT '요일',
    start_time TIME NOT NULL COMMENT '시작 시간',
    end_time TIME NOT NULL COMMENT '종료 시간',
    room VARCHAR(100) DEFAULT NULL COMMENT '강의실',
    instructor VARCHAR(100) DEFAULT NULL COMMENT '강사명',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_member_idx (member_idx),
    INDEX idx_course_id (course_id),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='스케줄 테이블';

-- 팀 태스크 테이블
CREATE TABLE IF NOT EXISTS team_tasks (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '태스크 고유 ID',
    team_id VARCHAR(50) NOT NULL COMMENT '팀 ID',
    assignment_id INT(11) DEFAULT NULL COMMENT '과제 ID',
    text TEXT NOT NULL COMMENT '태스크 내용',
    completed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '완료 여부 (0:미완료, 1:완료)',
    assigned_to INT(11) DEFAULT NULL COMMENT '담당자 member_idx',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
    INDEX idx_team_id (team_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='팀 태스크 테이블';

-- 팀 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS team_chat_messages (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '메시지 고유 ID',
    team_id VARCHAR(50) NOT NULL COMMENT '팀 ID',
    member_idx INT(11) NOT NULL COMMENT '발송자 member_idx',
    member_name VARCHAR(100) NOT NULL COMMENT '발송자 이름',
    message TEXT NOT NULL COMMENT '메시지 내용',
    reg_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() COMMENT '등록일 (UNIX TIME)',
    mdy_date INT(11) NOT NULL DEFAULT UNIX_TIMESTAMP() ON UPDATE UNIX_TIMESTAMP() COMMENT '수정일 (UNIX TIME)',
    del_date INT(11) DEFAULT NULL COMMENT '삭제일 (soft delete 시 사용, UNIX TIME)',
    is_flag TINYINT(1) NOT NULL DEFAULT 0 COMMENT '삭제 여부 (0:정상, 1:삭제)',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_member_idx (member_idx),
    INDEX idx_reg_date (reg_date),
    INDEX idx_is_flag (is_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='팀 채팅 메시지 테이블';
