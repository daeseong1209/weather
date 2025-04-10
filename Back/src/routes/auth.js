const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  // 입력값 검증
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: '모든 필드를 입력해주세요.'
      }
    });
  }

  try {
    // 이메일 중복 확인
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '데이터베이스 오류가 발생했습니다.'
          }
        });
      }

      if (user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: '이미 등록된 이메일입니다.'
          }
        });
      }

      // 비밀번호 해시화
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 사용자 등록
      db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: {
                code: 'DB_ERROR',
                message: '사용자 등록 중 오류가 발생했습니다.'
              }
            });
          }

          // 등록 성공 응답
          res.status(201).json({
            success: true,
            data: {
              id: this.lastID,
              email,
              name
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    });
  }
});

// 로그인
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // 입력값 검증
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: '이메일과 비밀번호를 입력해주세요.'
      }
    });
  }

  // 사용자 조회
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DB_ERROR',
          message: '데이터베이스 오류가 발생했습니다.'
        }
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        }
      });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        }
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 로그인 성공 응답
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });
  });
});

module.exports = router; 