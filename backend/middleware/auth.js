const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'military_super_secret_key_123';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    const parts = token.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid token format.' });
    }

    jwt.verify(parts[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.username = decoded.username;
        next();
    });
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Access Denied: You do not have the required role.' });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole, SECRET_KEY };
