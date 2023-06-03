const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);

// MYSQL 연결 설정
const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database
});

// 데이터조회 API
app.get('/api/data', (req, res) => {
  const { type } = req.query;

  // 쿼리 실행
  const query = `SELECT * FROM menus;`
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error : '데이터 조회 실패'});
      return;
    }

    // 조회 결과를 JSON 형태로 변환
    res.json(results);
  });
});

app.listen(3001, () => {
  console.log('서버가 http://localhost:3001에서 실행 중입니다.');
})