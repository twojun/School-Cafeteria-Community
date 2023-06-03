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
  });
});

// 특정 메뉴에 대한 리뷰 작성 페이지로 이동
app.get('/menu/:menuId/writeReview', (req, res) => {
  const menuId = req.params.menuId;
  // 리뷰 작성 페이지로 이동하는 코드 작성

  // 예를 들어, 리뷰 작성 페이지로 이동하는 HTML을 응답으로 보내는 방식으로 구현할 수 있습니다.
  const writeReviewPage = `
    <html>
      <head>
        <title>리뷰 작성</title>
      </head>
      <body>
        <h1>${menuId}에 대한 리뷰 작성</h1>
        <form action="/reviews" method="post">
          <input type="hidden" name="menu_id" value="${menuId}">
          <label for="student_number">학번:</label>
          <input type="text" name="student_number" id="student_number">
          <label for="rating">평점:</label>
          <input type="number" name="rating" id="rating" min="1" max="5">
          <label for="content">리뷰 내용:</label>
          <textarea name="content" id="content"></textarea>
          <button type="submit">리뷰 작성</button>
        </form>
      </body>
    </html>
  `;
  
  res.send(writeReviewPage);
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버 동작 중, 동작 포트 : ${port}`);
});
