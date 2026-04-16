const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
    let query = `
        SELECT t.*, a.name as assetName, a.category, u.username as requesterName 
        FROM transfers t
        JOIN assets a ON t.assetId = a.id
        LEFT JOIN users u ON t.requestedBy = u.id
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
});

router.post('/', verifyToken, requireRole(['Logistics Officer', 'Base Commander', 'Admin']), (req, res) => {
    const { assetId, fromBase, toBase, quantity } = req.body;

    if (!assetId || !fromBase || !toBase || !quantity) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    db.get(`SELECT quantity FROM assets WHERE id = ? AND base = ?`, [assetId, fromBase], (err, asset) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!asset) return res.status(404).json({ message: 'Asset not found at the source base' });
        if (asset.quantity < quantity) return res.status(400).json({ message: 'Insufficient quantity at source base' });

        db.run(
            `INSERT INTO transfers (assetId, fromBase, toBase, quantity, status, requestedBy) VALUES (?, ?, ?, ?, 'Pending', ?)`,
            [assetId, fromBase, toBase, quantity, req.userId],
            function(err) {
                if (err) return res.status(500).json({ message: 'Database error', error: err.message });
                res.status(201).json({ message: 'Transfer requested', transferId: this.lastID });
            }
        );
    });
});

router.put('/:id/status', verifyToken, requireRole(['Admin', 'Logistics Officer']), (req, res) => {
    const { status } = req.body;
    const transferId = req.params.id;

    if (!['Completed', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.get(`SELECT * FROM transfers WHERE id = ?`, [transferId], (err, transfer) => {
        if (err || !transfer) return res.status(404).json({ message: 'Transfer not found' });
        if (transfer.status !== 'Pending') return res.status(400).json({ message: 'Transfer already processed' });

        if (status === 'Rejected') {
            db.run(`UPDATE transfers SET status = 'Rejected', completedAt = CURRENT_TIMESTAMP WHERE id = ?`, [transferId]);
            return res.json({ message: 'Transfer rejected' });
        }

        db.run(`UPDATE assets SET quantity = quantity - ? WHERE id = ? AND base = ?`, [transfer.quantity, transfer.assetId, transfer.fromBase], function(err) {
            if (err) return res.status(500).json({ message: 'Error updating source base' });
            
            db.get(`SELECT * FROM assets WHERE name = (SELECT name FROM assets WHERE id = ?) AND base = ?`, [transfer.assetId, transfer.toBase], (err, destAsset) => {
                if (destAsset) {
                    db.run(`UPDATE assets SET quantity = quantity + ? WHERE id = ?`, [transfer.quantity, destAsset.id]);
                } else {
                    db.get(`SELECT name, category, description FROM assets WHERE id = ?`, [transfer.assetId], (err, origAsset) => {
                        db.run(`INSERT INTO assets (name, category, base, quantity, description) VALUES (?, ?, ?, ?, ?)`, 
                            [origAsset.name, origAsset.category, transfer.toBase, transfer.quantity, origAsset.description]);
                    });
                }
                
                db.run(`UPDATE transfers SET status = 'Completed', completedAt = CURRENT_TIMESTAMP WHERE id = ?`, [transferId]);
                res.json({ message: 'Transfer completed successfully' });
            });
        });
    });
});

module.exports = router;
