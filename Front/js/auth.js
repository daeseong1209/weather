// DOM 요소
const authPage = document.getElementById('auth-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// 인증 상태 확인
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // 이미 로그인된 상태면 메인 페이지로 이동
        window.location.href = 'index.html';
    }
}

// 인증 페이지 표시
function showAuthPage() {
    authPage.classList.remove('hidden');
    mainPage.classList.add('hidden');
}

// 메인 페이지 표시
function showMainPage(user) {
    authPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    userName.textContent = user.name;
}

// 에러 메시지 표시
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// 에러 메시지 숨기기
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// 성공 메시지 표시
function showSuccess(form, message) {
    const successDiv = form.querySelector('.success-message') || document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    if (!form.querySelector('.success-message')) {
        form.appendChild(successDiv);
    }
}

// 폼 초기화
function resetForm(form) {
    form.reset();
    const errorMessage = form.querySelector('.error-message');
    const successMessage = form.querySelector('.success-message');
    
    if (errorMessage) errorMessage.remove();
    if (successMessage) successMessage.remove();
}

// 탭 전환
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetForm = tab.dataset.tab === 'login' ? loginForm : registerForm;
        const otherForm = tab.dataset.tab === 'login' ? registerForm : loginForm;
        
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        targetForm.classList.remove('hidden');
        otherForm.classList.add('hidden');
        
        resetForm(targetForm);
        resetForm(otherForm);
    });
});

// 로그인 처리 함수
async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // 로그인 성공
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            window.location.replace('./index.html');
        } else {
            // 로그인 실패
            showError(data.error?.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showError('로그인 중 오류가 발생했습니다.');
    }
}

// 현재 페이지가 로그인 페이지인지 확인
const isLoginPage = window.location.pathname.endsWith('login.html');

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // 로그인 페이지에서만 실행
    if (isLoginPage) {
        // 이미 로그인되어 있는지 확인
        const token = localStorage.getItem('token');
        if (token) {
            window.location.replace('./index.html');
            return;
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideError();

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                await handleLogin(email, password);
            });
        }
    }
});

// 회원가입 폼 제출
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await authAPI.register({ name, email, password });
        showSuccess(registerForm, '회원가입이 완료되었습니다. 로그인해주세요.');
        
        // 로그인 탭으로 전환
        const loginTab = document.querySelector('[data-tab="login"]');
        loginTab.click();
    } catch (error) {
        showError(error.message);
    }
});

// 로그아웃
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuthPage();
});

// 초기 인증 상태 확인
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // 현재 페이지가 로그인 페이지인 경우에만 처리
    if (loginForm) {
        // 페이지 로드 시 로그인 상태 확인
        checkAuth();
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                
                if (data.success) {
                    // 로그인 성공 시 토큰 저장
                    localStorage.setItem('token', data.token);
                    // 메인 페이지로 이동
                    window.location.href = 'index.html';
                } else {
                    showError(data.message || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error('로그인 오류:', error);
                showError('로그인 중 오류가 발생했습니다.');
            }
        });
    }
}); 