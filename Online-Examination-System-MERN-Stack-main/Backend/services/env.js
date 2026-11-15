const config = require('config');

const localFallbacks = {
    MONGODB_URI: 'mongodb://localhost:27017/OnlineExaminationSystem',
    JWT_SECRET: 'Examination Portal Application',
    FRONTEND_URL: 'http://localhost:3000',
    MAIL_USER: 'deekshithar66@gmail.com',
    MAIL_PASSWORD: 'piew qqip hxmr mpdo'
};

const configPaths = {
    MONGODB_URI: 'mongodb.connectionString',
    JWT_SECRET: 'jwt.secret',
    FRONTEND_URL: 'app.frontendUrl',
    MAIL_USER: 'mail-credentials.userid',
    MAIL_PASSWORD: 'mail-credentials.password'
};

const getEnv = (name) => {
    if (process.env[name]) {
        return process.env[name];
    }

    const configPath = configPaths[name];
    if (configPath && config.has(configPath)) {
        return config.get(configPath);
    }

    return localFallbacks[name];
};

module.exports = { getEnv };
