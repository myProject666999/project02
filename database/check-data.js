const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'retro_car_repair'
  });

  console.log('=== 检查cars表数据 ===');
  const [cars] = await connection.query('SELECT * FROM cars');
  console.log(JSON.stringify(cars, null, 2));

  console.log('\n=== 检查processes表数据 ===');
  const [processes] = await connection.query('SELECT * FROM processes');
  console.log(JSON.stringify(processes, null, 2));

  console.log('\n=== 检查parts表数据 ===');
  const [parts] = await connection.query('SELECT * FROM parts');
  console.log(JSON.stringify(parts, null, 2));

  console.log('\n=== 检查repair_logs表数据 ===');
  const [logs] = await connection.query('SELECT * FROM repair_logs');
  console.log(JSON.stringify(logs, null, 2));

  await connection.end();
}

checkData().catch(console.error);
