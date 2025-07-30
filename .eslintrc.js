
module.exports = {
    root: true,
    env: {
        node: true,
        browser: true
    },
    // 环境变量，不加入的话统一使用的话会被eslint提醒错误
    globals: {
      moment: 'readonly'
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unused-vars': process.env.NODE_ENV === 'production' ? 'off' : 'off',
        'no-unreachable': 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}