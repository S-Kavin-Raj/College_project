-- Migration: Create College_Management schema and tables
CREATE DATABASE IF NOT EXISTS College_Management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE College_Management;

-- Departments ENUM
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

-- Academic years
CREATE TABLE IF NOT EXISTS academic_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    class_name VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(department_id, academic_year_id, class_name)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NOT NULL,
    academic_year_id INT, -- nullable for admins who can manage all years of department
    class_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Class roles linking (CR assignments)
CREATE TABLE IF NOT EXISTS class_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    class_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMP NULL,
    removed_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    FOREIGN KEY (removed_by) REFERENCES users(id),
    UNIQUE(user_id, class_id, role_id)
);

-- Enforce maximum 4 CRs per class via trigger (throws error if exceeded)
DROP TRIGGER IF EXISTS trg_check_cr_limit;
DELIMITER $$
CREATE TRIGGER trg_check_cr_limit BEFORE INSERT ON class_roles
FOR EACH ROW
BEGIN
  DECLARE cr_count INT;
  DECLARE role_name VARCHAR(32);
  SELECT name INTO role_name FROM roles WHERE id = NEW.role_id;
  IF role_name = 'CR' THEN
    SELECT COUNT(*) INTO cr_count FROM class_roles WHERE class_id = NEW.class_id AND removed_at IS NULL;
    IF cr_count >= 4 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum 4 CRs allowed per class.';
    END IF;
  END IF;
END;
$$
DELIMITER ;

-- Authorized Emails (Access Control)
-- academic_year_id may be NULL for department-wide entries (e.g., Admins)
CREATE TABLE IF NOT EXISTS authorized_emails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    academic_year_id INT NULL,
    allowed_roles SET('STUDENT','STAFF','ADVISOR','ADMIN') DEFAULT NULL,
    added_by INT,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (added_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE(email, department_id, academic_year_id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    date DATE NOT NULL,
    fn_status ENUM('PRESENT','ABSENT','LEAVE','NA') NOT NULL DEFAULT 'NA',
    an_status ENUM('PRESENT','ABSENT','LEAVE','NA') NOT NULL DEFAULT 'NA',
    day_result ENUM('PRESENT','ABSENT','HALF_DAY','NA') NOT NULL DEFAULT 'NA',
    entered_by INT NOT NULL,
    approved_by INT,
    status ENUM('PENDING','APPROVED','LOCKED') DEFAULT 'PENDING',
    edit_reason TEXT,
    department_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (entered_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(student_id, class_id, date)
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    created_by INT NOT NULL,
    department_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submitted_at TIMESTAMP NULL,
    status ENUM('SUBMITTED','LATE','NOT_SUBMITTED') DEFAULT 'NOT_SUBMITTED',
    marks DECIMAL(5,2),
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    comments TEXT NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE(assignment_id, student_id)
);

-- Syllabus and units
CREATE TABLE IF NOT EXISTS syllabus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    locked_by INT,
    locked_at TIMESTAMP NULL,
    department_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (locked_by) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(class_id, subject)
);

CREATE TABLE IF NOT EXISTS syllabus_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    syllabus_id INT NOT NULL,
    unit_no INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('COMPLETED','NOT_COMPLETED') DEFAULT 'NOT_COMPLETED',
    last_updated_by INT,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (syllabus_id) REFERENCES syllabus(id),
    FOREIGN KEY (last_updated_by) REFERENCES users(id),
    UNIQUE(syllabus_id, unit_no)
);

-- Change requests (admin changes that require advisor approval)
CREATE TABLE IF NOT EXISTS change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requestor_id INT NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    target_id BIGINT NULL,
    change_type ENUM('CREATE','UPDATE','DELETE') NOT NULL,
    payload JSON NOT NULL,
    department_id INT NOT NULL,
    academic_year_id INT NULL,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requestor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL
);

-- Backwards-compatible table used by existing routes/scripts: admin_change_requests
CREATE TABLE IF NOT EXISTS admin_change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name ENUM('attendance', 'assignments', 'syllabus') NOT NULL,
    record_id INT,
    change_type ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    new_data JSON,
    requested_by INT NOT NULL,
    department_id INT NOT NULL,
    academic_year_id INT NULL,
    class_id INT NULL,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    advisor_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_dept_class ON admin_change_requests(department_id, class_id);

-- Mirror admin_change_requests into change_requests for unified audit trail
DROP TRIGGER IF EXISTS trg_adminreq_to_change_requests;
DELIMITER $$
CREATE TRIGGER trg_adminreq_to_change_requests AFTER INSERT ON admin_change_requests
FOR EACH ROW
BEGIN
  INSERT INTO change_requests (requestor_id, target_table, target_id, change_type, payload, department_id, academic_year_id, status, created_at)
  VALUES (NEW.requested_by, NEW.table_name, NEW.record_id, CASE WHEN NEW.change_type='INSERT' THEN 'CREATE' WHEN NEW.change_type='UPDATE' THEN 'UPDATE' ELSE 'DELETE' END, NEW.new_data, NEW.department_id, NEW.academic_year_id, NEW.status, NEW.created_at);
END;
$$
DELIMITER ;

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NULL,
    target_id BIGINT NULL,
    details JSON NULL,
    ip_address VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- End of updated block

-- Indexes for frequent filters
CREATE INDEX idx_attendance_dept_year ON attendance(department_id, academic_year_id);
CREATE INDEX idx_assignments_dept_year ON assignments(department_id, academic_year_id);
CREATE INDEX idx_syllabus_dept_year ON syllabus(department_id, academic_year_id);

-- Seed departments and academic years and roles
INSERT IGNORE INTO departments (name) VALUES
('BE CSE'),
('B.Tech AIDS'),
('BE AI-ML'),
('BE EEE'),
('BE ECE'),
('BE CCE');

INSERT IGNORE INTO academic_years (name) VALUES
('1st Year'),('2nd Year'),('3rd Year'),('4th Year');

INSERT IGNORE INTO roles (name) VALUES
('ADMIN'),('ADVISOR'),('STAFF'),('CR'),('STUDENT');
