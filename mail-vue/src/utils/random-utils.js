/**
 * 随机生成工具类
 */

/**
 * 生成随机邮箱名（8位字符：数字+小写字母组合）
 * @returns {string} 随机邮箱名，如 "a3onumtx"
 */
export function generateRandomEmailName() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // 确保第一个字符是字母
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    result += letters.charAt(Math.floor(Math.random() * letters.length));
    
    // 生成剩余7位字符
    for (let i = 1; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
 * 生成随机密码（10位字符：大小写字母+数字组合）
 * @returns {string} 随机密码，如 "z3KgTLjYQz"
 */
export function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // 确保密码包含至少一个大写字母、一个小写字母和一个数字
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    
    // 先添加必需的字符类型
    result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    
    // 生成剩余7位字符
    for (let i = 3; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 打乱字符顺序
    return result.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * 使用加密安全的随机数生成器（如果可用）
 * @param {number} length 生成字符串的长度
 * @param {string} chars 可用字符集
 * @returns {string} 随机字符串
 */
export function generateSecureRandom(length, chars) {
    let result = '';
    
    if (window.crypto && window.crypto.getRandomValues) {
        // 使用加密安全的随机数生成器
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(array[i] % chars.length);
        }
    } else {
        // 回退到普通随机数生成器
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    
    return result;
}

/**
 * 生成更安全的随机邮箱名
 * @returns {string} 随机邮箱名
 */
export function generateSecureEmailName() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    
    // 确保第一个字符是字母
    let result = generateSecureRandom(1, letters);
    // 生成剩余7位字符
    result += generateSecureRandom(7, chars);
    
    return result;
}

/**
 * 生成更安全的随机密码
 * @returns {string} 随机密码
 */
export function generateSecurePassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    // 确保包含各种字符类型
    let result = '';
    result += generateSecureRandom(1, uppercase);
    result += generateSecureRandom(1, lowercase);
    result += generateSecureRandom(1, numbers);
    result += generateSecureRandom(7, allChars);
    
    // 打乱字符顺序
    return result.split('').sort(() => {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(1);
            window.crypto.getRandomValues(array);
            return (array[0] / 255) - 0.5;
        }
        return Math.random() - 0.5;
    }).join('');
}
