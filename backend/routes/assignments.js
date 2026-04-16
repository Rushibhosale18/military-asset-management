const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
    let query = `
        SELECT a.*, ast.name as assetName, ast.category, u.username as assignedByName 
        FROM assignments a
        JOIN assets ast ON a.assetId = ast.id
        LEFT JOIN users u ON a.assignedBy = u.id
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.json(rows);
    });
});

router.post('/', verifyToken, requireRole(['Base Commander', 'Admin']), (req, res) => {
    const { assetId, assignedTo, purpose, quantity, base } = req.body;

    if (!assetId || !assignedTo || !purpose || !quantity || !base) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    db.get(`SELECT quantity FROM assets WHERE id = ? AND base = ?`, [assetId, base], (err, asset) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!asset) return res.status(404).json({ message: 'Asset not found at the specified base' });
        if (asset.quantity < quantity) return res.status(400).json({ message: 'Insufficient quantity at base' });

        db.serialize(() => {
            db.run(`UPDATE assets SET quantity = quantity - ? WHERE id = ?`, [quantity, assetId]);
            db.run(
                `INSERT INTO assignments (assetId, assignedTo, purpose, quantity, status, base, assignedBy) VALUES (?, ?, ?, ?, 'Assigned', ?, ?)`,
                [assetId, assignedTo, purpose, quantity, base, req.userId],
                function(err) {
                    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
                    res.status(201).json({ message: 'Asset assigned successfully', assignmentId: this.lastID });
                }
            );
        });
    });
});

router.put('/:id/status', verifyToken, requireRole(['Base Commander', 'Admin']), (req, res) => {
    const { status } = req.body;
    const assignmentId = req.params.id;

    if (!['Expended', 'Returned'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be Expended or Returned.' });
    }

    db.get(`SELECT * FROM assignments WHERE id = ?`, [assignmentId], (err, assignment) => {
        if (err || !assignment) return res.status(404).json({ message: 'Assignment not found' });
        if (assignment.status !== 'Assigned') return res.status(400).json({ message: 'Assignment already processed' });

        db.serialize(() => {
            db.run(`UPDATE assignments SET status = ? WHERE id = ?`, [status, assignmentId]);
            
            if (status === 'Returned') {
                db.run(`UPDATE assets SET quantity = quantity + ? WHERE id = ?`, [assignment.quantity, assignment.assetId]);
            }
            res.json({ message: `Assignment marked as ${status}` });
        });
    });
});

module.exports = router;
