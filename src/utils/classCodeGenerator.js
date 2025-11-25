// 6자리 랜덤 학급 코드 생성 (예: ABC123)
export function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 학급 코드 유효성 검사
export function validateClassCode(code) {
  if (!code) return false;
  const pattern = /^[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase());
}
