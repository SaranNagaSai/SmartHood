const jwt = require("jsonwebtoken");

const generateToken = (id, tokenVersion = 0) => {
    return jwt.sign({ id, tv: tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = generateToken;
