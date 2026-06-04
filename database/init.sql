-- 复古汽车修复进度跟踪系统 数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS retro_car_repair DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE retro_car_repair;

-- 车辆表
CREATE TABLE IF NOT EXISTS cars (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    vin VARCHAR(50) NOT NULL UNIQUE COMMENT '车架号',
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    model VARCHAR(100) NOT NULL COMMENT '型号',
    year INT NOT NULL COMMENT '年款',
    name VARCHAR(100) COMMENT '车辆昵称',
    restoration_route ENUM('restoration', 'modification') NOT NULL COMMENT '修复路线：restoration-修旧如旧, modification-改装升级',
    original_photos JSON COMMENT '原始车况照片URL数组',
    description TEXT COMMENT '车辆描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_vin (vin),
    INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆表';

-- 工序表
CREATE TABLE IF NOT EXISTS processes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    car_id BIGINT NOT NULL COMMENT '关联车辆ID',
    name VARCHAR(50) NOT NULL COMMENT '工序名称',
    process_order INT NOT NULL COMMENT '工序顺序(1-6:拆解、钣金、喷漆、电气、内饰、总装)',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending' COMMENT '状态',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '完成日期',
    description TEXT COMMENT '工序描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_car_id (car_id),
    INDEX idx_status (status),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工序表';

-- 子任务表
CREATE TABLE IF NOT EXISTS sub_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    process_id BIGINT NOT NULL COMMENT '关联工序ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    task_order INT NOT NULL COMMENT '任务排序',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_process_id (process_id),
    INDEX idx_status (status),
    FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';

-- 零件采购表
CREATE TABLE IF NOT EXISTS parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    car_id BIGINT NOT NULL COMMENT '关联车辆ID',
    name VARCHAR(200) NOT NULL COMMENT '零件名称',
    part_number VARCHAR(100) COMMENT '零件号',
    source VARCHAR(200) NOT NULL COMMENT '采购来源',
    unit_price DECIMAL(10, 2) NOT NULL COMMENT '单价',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    is_original TINYINT(1) DEFAULT 0 COMMENT '是否原厂件：0-否, 1-是',
    order_date DATE COMMENT '下单日期',
    arrival_date DATE COMMENT '到货日期',
    status ENUM('pending', 'ordered', 'shipped', 'delivered') DEFAULT 'pending' COMMENT '状态',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_car_id (car_id),
    INDEX idx_status (status),
    INDEX idx_is_original (is_original),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='零件采购表';

-- 修复日志表
CREATE TABLE IF NOT EXISTS repair_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    car_id BIGINT NOT NULL COMMENT '关联车辆ID',
    log_date DATE NOT NULL COMMENT '日志日期',
    content TEXT NOT NULL COMMENT '日志内容',
    photos JSON COMMENT '照片URL数组',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_car_id (car_id),
    INDEX idx_log_date (log_date),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='修复日志表';

-- 插入示例数据
-- 插入一辆示例车辆
INSERT INTO cars (vin, brand, model, year, name, restoration_route, original_photos, description) VALUES
('WVWZZZ33ZEW123456', 'Volkswagen', 'Golf GTI', 1986, '老伙计', 'restoration', 
 '["/photos/original/1986-golf-1.jpg", "/photos/original/1986-golf-2.jpg", "/photos/original/1986-golf-3.jpg"]',
 '1986年款大众高尔夫GTI，整车锈蚀严重，发动机无法启动，需要全面修复。');

-- 获取刚插入的车辆ID
SET @car_id = LAST_INSERT_ID();

-- 插入6道工序
INSERT INTO processes (car_id, name, process_order, status, description) VALUES
(@car_id, '拆解', 1, 'completed', '全车拆解，记录每个零件状态'),
(@car_id, '钣金', 2, 'completed', '车身钣金修复，除锈、防锈处理'),
(@car_id, '喷漆', 3, 'in_progress', '全车喷漆，恢复原厂银色'),
(@car_id, '电气', 4, 'pending', '全车线束更换，电器设备修复'),
(@car_id, '内饰', 5, 'pending', '内饰翻新，座椅重新包覆'),
(@car_id, '总装', 6, 'pending', '全车总装调试');

-- 插入子任务示例
INSERT INTO sub_tasks (process_id, name, description, task_order, status) VALUES
(1, '拆卸发动机', '拆卸发动机及变速箱总成', 1, 'completed'),
(1, '拆卸内饰', '拆卸座椅、仪表盘、门板等内饰件', 2, 'completed'),
(1, '拆卸外观件', '拆卸前后保险杠、大灯、格栅等', 3, 'completed'),
(2, '除锈处理', '车身全面除锈处理', 1, 'completed'),
(2, '钣金修复', '修复车身凹陷和锈蚀部位', 2, 'completed'),
(2, '防锈处理', '底盘和车身内部喷涂防锈漆', 3, 'completed'),
(3, '打磨找平', '全车打磨，原子灰找平', 1, 'completed'),
(3, '喷涂底漆', '喷涂环氧底漆', 2, 'completed'),
(3, '喷色漆', '喷涂原厂银色漆', 3, 'in_progress'),
(3, '喷清漆', '喷涂清漆保护', 4, 'pending');

-- 插入零件采购示例
INSERT INTO parts (car_id, name, part_number, source, unit_price, quantity, is_original, order_date, arrival_date, status, notes) VALUES
(@car_id, '发动机大修包', '026198001', '德国eBay', 1280.00, 1, 1, '2025-03-15', '2025-04-20', 'delivered', '原厂NOS零件'),
(@car_id, '前大灯总成', '191941017K', '美国VW老车配件店', 850.00, 2, 1, '2025-04-10', '2025-05-15', 'delivered', '海拉原厂'),
(@car_id, '全车线束', '191971011', '国内定制', 2800.00, 1, 0, '2025-05-01', NULL, 'shipped', '按照原厂规格定制'),
(@car_id, '减震器总成', '191413031', '日本雅虎拍卖', 680.00, 4, 1, '2025-05-10', NULL, 'ordered', 'Bilstein B6'),
(@car_id, '座椅真皮包覆', '', '本地内饰改装店', 3500.00, 1, 0, NULL, NULL, 'pending', '黑色真皮，原厂款式');

-- 插入修复日志示例
INSERT INTO repair_logs (car_id, log_date, content, photos) VALUES
(@car_id, '2025-03-01', '项目正式启动！今天把车拖到了修理厂，第一次见到这台30年的老伙计。虽然满身锈迹，但依然能看出当年的风采。车架号检查完毕，确认是1986年的原厂GTI。',
 '["/photos/logs/2025-03-01-1.jpg", "/photos/logs/2025-03-01-2.jpg"]'),
(@car_id, '2025-03-10', '开始拆解工作。发动机舱的油泥很厚，很多螺丝都锈死了。花了整整一周才把发动机吊出来，发现缸体已经有裂纹了，需要找替换件。',
 '["/photos/logs/2025-03-10-1.jpg", "/photos/logs/2025-03-10-2.jpg", "/photos/logs/2025-03-10-3.jpg"]'),
(@car_id, '2025-04-05', '拆解工作全部完成，一共装了30多个收纳箱。钣金师傅检查后说车身状况比预想的好，主要锈蚀部位在门槛和后轮拱。开始从全球采购零件。',
 '["/photos/logs/2025-04-05-1.jpg"]'),
(@car_id, '2025-05-01', '钣金工作完成了！整整做了一个月，把所有锈蚀的地方都切割替换，做了完整的防锈处理。车身现在和新车一样扎实。下周开始喷漆。',
 '["/photos/logs/2025-05-01-1.jpg", "/photos/logs/2025-05-01-2.jpg"]'),
(@car_id, '2025-05-20', '底漆已经喷完了，正在打磨找平。选的是原厂的银色金属漆，期待最终效果。德国来的发动机大修包也到货了，都是NOS原厂件，运气不错！',
 '["/photos/logs/2025-05-20-1.jpg", "/photos/logs/2025-05-20-2.jpg"]');
