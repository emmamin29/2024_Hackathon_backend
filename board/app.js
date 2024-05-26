// app.js
const express = require("express");
//const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./config/mysql.js");
const app = express();
const conn = db.init();
/*
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      console.log(file);
      if (!fs.existsSync("./uploads/")) {
        fs.mkdirSync("./uploads/", { recursive: true });
      }
      callback(null, "./uploads/");
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
  }),
});
*/

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "views")));

// 루트 경로 설정
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "postlist.html"));
});

// 카테고리 조회
app.get("/categories", function (req, res) {
  var sql = "SELECT * FROM categories";
  conn.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
    }
  });
});

// 게시물 조회
app.get("/views", function (req, res) {
  var sql = "SELECT * FROM posts";
  conn.query(sql, function (err, result) {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
    }
  });
});

//게시물 카테고리별 조회

// /insert 경로에 대한 GET 요청 처리
app.get("/insert", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));
});

// 게시글 쓰기
app.post("/insert", function (req, res) {
  console.log("POST /insert called"); // 라우트가 호출되었는지 확인

  console.log("req.body:", req.body); // req.body 객체를 콘솔에 출력하여 확인

  var body = req.body;

  var sql =
    "INSERT INTO posts (title, content, author_id, category_id, created_at) VALUES (?, ?, ?, ?, NOW())";
  var params = [body.title, body.content, body.author_id, body.category_id];
  conn.query(sql, params, function (err) {
    if (err) {
      console.log("Query not executed: " + err);
      res.status(500).send("Internal Server Error");
    } else {
      res.sendStatus(200);
    }
  });
});
app.get("/insert", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));
});

app.get("/post/:post_id", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "read.html"));
});

// 게시글 보기
app.get("/post/:post_id", function (req, res) {
  console.log("GET /post/:post_id called"); // 라우트가 호출되었는지 확인

  // 요청된 post_id 확인
  console.log("Requested post_id:", req.params.post_id);

  // post_id를 사용하여 데이터베이스에서 게시글 조회
  var sql = "SELECT * FROM posts WHERE post_id = ?";
  conn.query(sql, [req.params.post_id], function (err, result) {
    if (err) {
      console.log("Query not executed:", err);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Query result:", result); // 쿼리 결과 확인
      res.json(result); // JSON 형식으로 반환
    }
  });
});

// 게시글 수정 라우터
app.get("/update/:post_id", function (req, res) {
  const post_id = req.params.post_id;
  // post_id를 사용하여 해당 게시글 정보를 조회하는 쿼리를 실행합니다.
  const sql = "SELECT * FROM posts WHERE post_id = ?";
  conn.query(sql, [post_id], function (err, result) {
    if (err) {
      console.log("Query not executed:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // 조회된 게시글 정보를 클라이언트에게 전달합니다.
      res.send(result);
    }
  });
});

// 게시글 수정
app.post("/update/:post_id", function (req, res) {
  var body = req.body;
  var sql =
    "UPDATE posts SET author_id = ?, title = ?, content = ? WHERE post_id = ?";
  var params = [body.author_id, body.title, body.content, req.params.post_id];
  conn.query(sql, params, function (err) {
    if (err) {
      console.log("Query not executed: " + err);
      res.status(500).send("Internal Server Error");
    } else {
      res.sendStatus(200);
    }
  });
});

// 게시글 삭제

app.delete("/delete/:post_id", function (req, res) {
  var sql = "DELETE FROM posts WHERE post_id = ?";
  conn.query(sql, [req.params.post_id], function (err) {
    if (err) {
      console.log("Query not executed: " + err);
      res.status(500).send("Internal Server Error");
    } else {
      res.sendStatus(200);
    }
  });
});

//

// 댓글 작성
app.post("/post/:post_id/comment", function (req, res) {
  const postId = req.params.post_id;
  const { content, author } = req.body;

  var sql =
    "INSERT INTO comments (post_id, content, author, created_at) VALUES (?, ?, ?, NOW())";
  var params = [postId, content, author];

  conn.query(sql, params, function (err) {
    if (err) {
      console.log("Query not executed: " + err);
      res.status(500).send("Internal Server Error");
    } else {
      res.sendStatus(200);
    }
  });
});

// 게시물 추천 여부 확인
app.get("/post/:post_id/recommendation-status", function (req, res) {
  const postId = req.params.post_id;
  const userId = req.user.id; // 로그인한 유저의 ID, 세션 또는 토큰에서 가져옵니다.

  const sql =
    "SELECT COUNT(*) AS count FROM post_recommendations WHERE user_id = ? AND post_id = ?";
  conn.query(sql, [userId, postId], function (err, result) {
    if (err) {
      console.error("Error checking recommendation status:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const recommended = result[0].count > 0;
    res.json({ recommended });
  });
});

// 게시물 추천
app.post("/post/:post_id/recommend", function (req, res) {
  const postId = req.params.post_id;
  const userId = req.user.id; // 로그인한 유저의 ID, 세션 또는 토큰에서 가져옵니다.

  const insertSql =
    "INSERT INTO post_recommendations (user_id, post_id) VALUES (?, ?)";
  conn.query(insertSql, [userId, postId], function (err) {
    if (err) {
      console.error("Error recommending post:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.sendStatus(200);
  });
});

module.exports = app;
