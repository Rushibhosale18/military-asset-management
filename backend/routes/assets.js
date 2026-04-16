const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
    let query = `SELECT * FROM assets`;
    let params = [];
    
    if (req.query.base) {
        query += ` WHERE base = ?`;
        params.push(req.query.base);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
});

router.get('/:id', verifyToken, (req, res) => {
    db.get(`SELECT * FROM assets WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'Asset not found' });
        res.json(row);
    });
});

router.post('/', verifyToken, requireRole(['Admin']), (req, res) => {
    const { name, category, base, quantity, description } = req.body;
    
    if (!name || !category || !base || quantity === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    db.run(
        `INSERT INTO assets (name, category, base, quantity, description) VALUES (?, ?, ?, ?, ?)`,
        [name, category, base, quantity, description],
        function(err) {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            res.status(201).json({ id: this.lastID, name, category, base, quantity, description });
        }
    );
});

router.put('/:id', verifyToken, requireRole(['Admin', 'Logistics Officer']), (req, res) => {
    const { quantity } = req.body;
    db.run(
        `UPDATE assets SET quantity = ? WHERE id = ?`,
        [quantity, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (this.changes === 0) return res.status(404).json({ message: 'Asset not found' });
            res.json({ message: 'Asset updated successfully' });
        }
    );
});

module.exports = router;
