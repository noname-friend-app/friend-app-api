
const newGroupCode = (length = 6) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let code = [];
    for (let i = 0; i < length; i++) {
        const choice = Math.random() < 0.5 ? alphabet : numbers;
        code.push(choice[Math.floor(Math.random() * choice.length)]);
    }
    return code.join('');
}

module.exports = { newGroupCode };