CREATE DATABASE IF NOT EXISTS dance_library DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dance_library;

DROP TABLE IF EXISTS choreography_item;
DROP TABLE IF EXISTS share_link;
DROP TABLE IF EXISTS choreography;
DROP TABLE IF EXISTS dance_action;

CREATE TABLE dance_action (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '动作名称',
    video_path VARCHAR(500) NOT NULL COMMENT '视频文件路径',
    cover_path VARCHAR(500) DEFAULT NULL COMMENT '封面图路径',
    style VARCHAR(20) NOT NULL COMMENT '风格：street/folk/modern/jazz',
    beat INT NOT NULL COMMENT '节拍：4或8',
    difficulty INT NOT NULL COMMENT '难度：1到5',
    body_part VARCHAR(20) NOT NULL COMMENT '身体部位：full/upper/lower',
    duration DECIMAL(5,2) DEFAULT 0 COMMENT '时长(秒)',
    description VARCHAR(500) DEFAULT NULL COMMENT '动作描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动作素材表';

CREATE TABLE choreography (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '编排名称',
    total_beats INT NOT NULL COMMENT '总节拍数(8拍为单位)',
    description VARCHAR(500) DEFAULT NULL COMMENT '编排描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='编排表';

CREATE TABLE choreography_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    choreography_id BIGINT NOT NULL COMMENT '编排ID',
    action_id BIGINT NOT NULL COMMENT '动作ID',
    sort_order INT NOT NULL COMMENT '排序序号',
    beat_position INT NOT NULL COMMENT '在第几个8拍位置开始',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (choreography_id) REFERENCES choreography(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES dance_action(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='编排动作项表';

CREATE TABLE share_link (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    choreography_id BIGINT NOT NULL COMMENT '编排ID',
    share_code VARCHAR(32) NOT NULL UNIQUE COMMENT '分享码',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否有效',
    expire_at DATETIME DEFAULT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (choreography_id) REFERENCES choreography(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分享链接表';
