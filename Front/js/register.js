// 에러 메시지 표시 함수
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// 에러 메시지 숨기기 함수
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// 회원가입 처리 함수
async function handleRegister(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // 회원가입 성공
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            setTimeout(() => {
                window.location.replace('./login.html');
            }, 100);
        } else {
            // 회원가입 실패
            showError(data.error?.message || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        showError('회원가입 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        // 이미 로그인되어 있는지 확인
        const token = localStorage.getItem('token');
        if (token) {
            window.location.href = 'index.html';
            return;
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // 비밀번호 확인
            if (password !== confirmPassword) {
                showError('비밀번호가 일치하지 않습니다.');
                return;
            }

            // 비밀번호 길이 확인
            if (password.length < 8) {
                showError('비밀번호는 8자 이상이어야 합니다.');
                return;
            }

            await handleRegister(name, email, password);
        });
    }
}); 