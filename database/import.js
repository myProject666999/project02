const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      multipleStatements: true
    });

    console.log('已连接到MySQL服务器');

    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('正在执行数据库脚本...');
    await connection.query(sql);
    console.log('数据库脚本执行成功！');

    await connection.query('USE retro_car_repair');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('数据库中的表:');
    tables.forEach(table => {
      console.log('  - ' + Object.values(table)[0]);
    });

    await connection.end();
    console.log('数据库导入完成！');
  } catch (error) {
    console.error('数据库导入失败:', error.message);
    process.exit(1);
  }
}

importDatabase();
