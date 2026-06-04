CREATE DATABASE IF NOT EXISTS motorcycle_team DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE motorcycle_team;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    motorcycle_brand VARCHAR(100),
    motorcycle_model VARCHAR(100),
    displacement INT COMMENT '排量(cc)',
    license_level VARCHAR(20) COMMENT '驾照等级: D, E, F等',
    license_number VARCHAR(50),
    proficiency_level VARCHAR(10) DEFAULT 'C' COMMENT '熟练度: A/B/C',
    total_rides INT DEFAULT 0,
    total_distance DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creator_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_point VARCHAR(200) NOT NULL,
    start_lat DECIMAL(10,7),
    start_lng DECIMAL(10,7),
    end_point VARCHAR(200) NOT NULL,
    end_lat DECIMAL(10,7),
    end_lng DECIMAL(10,7),
    meet_time DATETIME NOT NULL,
    route_gpx_path VARCHAR(255),
    route_description TEXT,
    min_displacement INT DEFAULT 0 COMMENT '最低排量要求',
    require_license_level VARCHAR(10) COMMENT '要求驾照等级',
    max_participants INT DEFAULT 20,
    checkin_radius INT DEFAULT 200 COMMENT '签到半径(米)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/ongoing/completed/cancelled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    INDEX idx_creator (creator_id),
    INDEX idx_status (status),
    INDEX idx_meet_time (meet_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    displacement INT COMMENT '报名时排量',
    license_level VARCHAR(20) COMMENT '报名时驾照等级',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/approved/rejected',
    review_note VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_event_user (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE checkins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    distance_from_start DECIMAL(10,2) COMMENT '距离起点(米)',
    is_valid TINYINT(1) DEFAULT 1,
    checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    group_level VARCHAR(10) NOT NULL COMMENT 'A/B/C',
    leader_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (leader_id) REFERENCES users(id),
    INDEX idx_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE group_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    UNIQUE KEY uk_group_user (group_id, user_id),
    INDEX idx_group (group_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    total_distance DECIMAL(10,2) COMMENT '总里程(km)',
    max_speed DECIMAL(10,2) COMMENT '最高时速(km/h)',
    avg_speed DECIMAL(10,2) COMMENT '平均时速(km/h)',
    ride_duration INT COMMENT '骑行时长(分钟)',
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    media_type VARCHAR(10) NOT NULL COMMENT 'image/video',
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    captured_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_review (review_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE track_points (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    elevation DECIMAL(10,2),
    speed DECIMAL(10,2),
    recorded_at DATETIME NOT NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    INDEX idx_review (review_id),
    INDEX idx_user (user_id),
    INDEX idx_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
