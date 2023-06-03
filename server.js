const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);


// MySQL Environment Connection settings.
const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database
});

connection.connect();



// 로그인 요청 처리
app.post('/login', (req, res) => {
  const student_number = req.body.student_number;
  const student_password = req.body.student_password;

  // users entity에서 학번과 비밀번호 조회한다.
  const query = `SELECT * FROM users WHERE student_number = '${student_number}'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.err('로그인 오류', err);
      res.status(500).send('로그인 오류');
      return;
    }

    if (results.length === 0) {
      // 학번이 일치하지 않을 때
      res.status(401).send('해당 학번의 사용자를 찾을 수 없습니다.');
      return;
    }

    const user = results[0];

    if (user.password !== student_password) {
      // 비밀번호가 일치하지 않을 때
      res.status(401).send('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 로그인 성공 시 세션에 사용자 정보 저장
    req.session.student_number = student_number;

    // 로그인 성공 시
    res.send('로그인 성공!');
  });
});



// 로그아웃 처리
app.post('/logout', (req, res) => {
  // 세션에서 사용자 정보 삭제
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 오류', err);
      res.status(500).send('로그아웃 오류');
      return;
    }

    // 로그아웃 성공 시
    res.send('로그아웃 성공!');
  });
});



// 회원가입 요청 처리
app.post('/signup', (req, res) => {
  const student_number = req.body.student_number;
  const student_password = req.body.password;

  // users 테이블에 학번, 비밀번호 추가(회원가입)
  const query = `INSERT INTO users (student_number, student_password) VALUES ('${student_number}', '${student_password}')`;
  connection.query(query, (err, result) => {
    if (err ) {
      console.error('회원가입 오류', err);
      res.status(500).send('회원가입 오류');
      return;
    }

    // 회원가입 성공
    res.send('회원가입 성공');
  });
});



// 리뷰 작성 : POST /reviews 
app.post('/reviews', (req, res) => {
  const { menu_id, student_number, rating, content } = req.body;

  // 리뷰 정보를 DB에 저장
  const query = `INSERT INTO reviews (menu_id, student_number, rating, content) VALUES (?, ?, ?, ?)`;

  connection.query(query, [menu_id, student_number, rating, content],(err, result) => {
    if (err) {
      console.error('리뷰 작성 실패: ', err);
      res.status(500).json({ error: '리뷰 작성에 실패했습니다.'});
    } else {
      console.log('리뷰 작성 성공');
      res.status(201).json({ message: '리뷰 작성에 성공했습니다.'});
    }
    console.log()
  });
});



// 특정 메뉴의 리뷰 조회 : GET /menu/:menuId/reviews
app.get('/menu/:menuId/reviews', (req, res) => {
  const menuId = req.params.menuId;

  // 특정 메뉴에 대한 리뷰를 DB에서 조회
  const query = `SELECT * FROM reviews WHERE menu_id = ?`;

  connection.query(query, [menuId], (err, results) => {
    if (err) {
      console.error('리뷰 조회 실패: ', err);
      res.status(500).json({ error: '리뷰 조회에 실패했습니다.'});
    } else {
      console.log('리뷰 조회 성공');
      res.status(200).json(results);
    }
  });
});



// 특정 메뉴의 평균 rating 점수 조회 : GET /menu/:menuId/averageRating
app.get('/menu/:menuId/averageRating', (req, res) => {
  const menuId = req.params.menuId;

  // 특정 메뉴에 대한 평균 rating 점수를 계산하여 조회하기
  const query = `SELECT ROUND(AVG(rating), 1) AS averageRating FROM reviews WHERE menu_id = ?`;

  connection.query(query, [menuId], (err, results) => {
    if (err) {
      console.error('평균 rating 점수 조회 실패: ', err);
      res.status(500).json({ error: '평균 rating 점수 조회에 실패했습니다.'});
    } else {
      const averageRating = results[0].averageRating;
      console.log('평균 rating 점수 조회 성공: ', averageRating);
      res.status(200).json({ averageRating });
    }
  });
});



// 서버 시작
app.listen(port, () => {
  console.log(`서버 동작 중, 동작 포트 : ${port}`);
});
