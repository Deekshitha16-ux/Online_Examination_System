const base = process.env.REACT_APP_API_BASE || 'https://online-examination-backend.vercel.app';
const LoginApi = '/api/v1/login';
const FetchUserDetailsApi = '/api/v1/user/details';

module.exports={ base, LoginApi, FetchUserDetailsApi }
