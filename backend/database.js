const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'military_assets.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT
            )`, (err) => {
                if (!err) {
                    db.get(`SELECT count(*) as count FROM users`, (err, row) => {
                        if (row && row.count === 0) {
                            const hash = bcrypt.hashSync('admin123', 10);
                            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', hash, 'Admin']);
                            
                            const hash2 = bcrypt.hashSync('commander123', 10);
                            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['commander', hash2, 'Base Commander']);

                            const hash3 = bcrypt.hashSync('logistics123', 10);
                            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['logistics', hash3, 'Logistics Officer']);
                            console.log("Default users created.");
                        }
                    });
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                category TEXT,
                base TEXT,
                quantity INTEGER,
                description TEXT,
                purchasedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS transfers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assetId INTEGER,
                fromBase TEXT,
                toBase TEXT,
                quantity INTEGER,
                status TEXT, -- Pending, Approved, Rejected, Completed
                requestedBy INTEGER,
                requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                completedAt DATETIME,
                FOREIGN KEY(assetId) REFERENCES assets(id),
                FOREIGN KEY(requestedBy) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assetId INTEGER,
                assignedTo TEXT,
                purpose TEXT,
                quantity INTEGER,
                status TEXT, -- Assigned, Expended, Returned
                base TEXT,
                assignedBy INTEGER,
                assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(assetId) REFERENCES assets(id),
                FOREIGN KEY(assignedBy) REFERENCES users(id)
            )`);
        });
    }
});

module.exports = db;
