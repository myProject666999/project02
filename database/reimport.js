const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function reimportDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      multipleStatements: true
    });

    console.log('已连接到MySQL服务器');

    await connection.query('DROP DATABASE IF EXISTS retro_car_repair');
    console.log('已删除旧数据库');

    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('正在重新执行数据库脚本...');
    await connection.query(sql);
    console.log('数据库脚本执行成功！');

    await connection.query('USE retro_car_repair');
    
    const [cars] = await connection.query('SELECT id, vin, brand, model, year, name, restoration_route FROM cars');
    console.log('cars表数据:');
    console.log(JSON.stringify(cars, null, 2));

    const [processes] = await connection.query('SELECT id, car_id, name, process_order, status FROM processes');
    console.log('processes表数据:');
    console.log(JSON.stringify(processes, null, 2));

    const [parts] = await connection.query('SELECT id, car_id, name, source, status FROM parts');
    console.log('parts表数据:');
    console.log(JSON.stringify(parts, null, 2));

    await connection.end();
    console.log('数据库重新导入完成！');
  } catch (error) {
    console.error('数据库重新导入失败:', error.message);
    process.exit(1);
  }
}

reimportDatabase();
