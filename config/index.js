require('dotenv').config();

const getConfig = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing config value ${name}`);
    }

    return value;
}

module.exports = {
    getConfig,
}
