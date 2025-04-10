const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 토큰 가져오기
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 토큰이 없는 경우
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: '인증 토큰이 필요합니다.'
      }
    });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보를 요청 객체에 추가
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다.'
      }
    });
  }
}; 