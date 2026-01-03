const express = require("express");
const router = express.Router();
const { requirePermission } = require("../middleware/accessControl");

router.get("/metrics", async (req, res) => {
    try {
        const { role, user_id, class_id, department_id } = req.session;
        const db = req.db;

        const metrics = {
            attendance: { value: "0%", subtitle: "No data" },
            assignments: { value: "0", subtitle: "No pending" },
            syllabus: { value: "0%", subtitle: "No progress" },
            actions: { value: "0", subtitle: "No actions" },
            attendanceGraph: [],
            syllabusGraph: [],
            assignmentGraph: []
        };

        // 1. Attendance Metrics & Graph
        if (role === 'STUDENT') {
            const [attRows] = await db.query(
                `SELECT COUNT(*) as total, SUM(CASE WHEN day_result = 'PRESENT' THEN 1 WHEN day_result = 'HALF_DAY' THEN 0.5 ELSE 0 END) as present 
                 FROM attendance WHERE student_id = ?`,
                [user_id]
            );
            if (attRows[0].total > 0) {
                const percent = Math.round((attRows[0].present / attRows[0].total) * 100);
                metrics.attendance = { value: `${percent}%`, subtitle: `${attRows[0].present} / ${attRows[0].total} days` };
            }

            const [gRows] = await db.query(
                `SELECT DATE_FORMAT(date, '%a') as day, AVG(CASE WHEN day_result = 'PRESENT' THEN 100 WHEN day_result = 'HALF_DAY' THEN 50 ELSE 0 END) as attendance 
                 FROM attendance WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
                 GROUP BY date ORDER BY date ASC`,
                [user_id]
            );
            metrics.attendanceGraph = gRows.map(r => ({ day: r.day, attendance: Math.round(r.attendance) }));
        } else if (class_id) {
            const [attRows] = await db.query(
                `SELECT COUNT(*) as total, SUM(CASE WHEN day_result = 'PRESENT' THEN 1 WHEN day_result = 'HALF_DAY' THEN 0.5 ELSE 0 END) as present 
                 FROM attendance WHERE class_id = ? AND date = CURDATE()`,
                [class_id]
            );
            metrics.attendance = {
                value: attRows[0].total > 0 ? `${Math.round((attRows[0].present / attRows[0].total) * 100)}%` : "0%",
                subtitle: `Marked Today: ${attRows[0].present}/${attRows[0].total}`
            };

            const [gRows] = await db.query(
                `SELECT DATE_FORMAT(date, '%a') as day, AVG(CASE WHEN day_result = 'PRESENT' THEN 100 WHEN day_result = 'HALF_DAY' THEN 50 ELSE 0 END) as attendance 
                 FROM attendance WHERE class_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
                 GROUP BY date ORDER BY date ASC`,
                [class_id]
            );
            metrics.attendanceGraph = gRows.map(r => ({ day: r.day, attendance: Math.round(r.attendance) }));
        }

        // 2. Assignment Metrics & Graph
        if (class_id) {
            const [asgStats] = await db.query(
                `SELECT 
                    (SELECT COUNT(*) FROM assignment_submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.class_id = ? AND s.status = 'SUBMITTED') as submitted,
                    (SELECT COUNT(*) FROM assignment_submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.class_id = ? AND s.status = 'LATE') as late,
                    ((SELECT COUNT(*) FROM users WHERE class_id = ? AND role_id = (SELECT id FROM roles WHERE name = 'STUDENT')) * 
                     (SELECT COUNT(*) FROM assignments WHERE class_id = ?)) - 
                    (SELECT COUNT(*) FROM assignment_submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.class_id = ?) as pending`,
                [class_id, class_id, class_id, class_id, class_id]
            );

            const stats = asgStats[0];
            metrics.assignmentGraph = [
                { name: 'Submitted', value: stats.submitted, color: '#10b981' },
                { name: 'Late', value: stats.late, color: '#f59e0b' },
                { name: 'Pending', value: Math.max(0, stats.pending), color: '#ef4444' }
            ].filter(d => d.value > 0);

            if (role === 'STUDENT') {
                const [myAsg] = await db.query(
                    `SELECT COUNT(*) as count FROM assignments a
                     LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
                     WHERE a.class_id = ? AND (s.status IS NULL OR s.status = 'NOT_SUBMITTED')`,
                    [user_id, class_id]
                );
                metrics.assignments = { value: String(myAsg[0].count), subtitle: "Pending Submission" };
            } else {
                metrics.assignments = { value: String(stats.submitted + stats.late), subtitle: "Total Submissions" };
            }
        }

        // 3. Syllabus Metrics & Graph
        if (class_id) {
            const [sylRows] = await db.query(
                `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
                 FROM syllabus_units su JOIN syllabus s ON su.syllabus_id = s.id WHERE s.class_id = ?`,
                [class_id]
            );
            if (sylRows[0].total > 0) {
                metrics.syllabus = {
                    value: `${Math.round((sylRows[0].completed / sylRows[0].total) * 100)}%`,
                    subtitle: "Curriculum Covered"
                };
            }

            const [gRows] = await db.query(
                `SELECT s.subject as name, ROUND((SUM(CASE WHEN su.status = 'COMPLETED' THEN 1 ELSE 0 END) / COUNT(*)) * 100) as value
                 FROM syllabus_units su JOIN syllabus s ON su.syllabus_id = s.id
                 WHERE s.class_id = ? GROUP BY s.id`,
                [class_id]
            );
            const colors = ['#2563EB', '#7C3AED', '#10b981', '#f59e0b', '#ef4444'];
            metrics.syllabusGraph = gRows.map((r, i) => ({ ...r, color: colors[i % colors.length] }));
        }

        // 4. Actions
        if (role === 'ADVISOR') {
            const [reqRows] = await db.query(
                "SELECT COUNT(*) as count FROM admin_change_requests WHERE department_id = ? AND class_id = ? AND status = 'PENDING'",
                [department_id, class_id]
            );
            metrics.actions = { value: String(reqRows[0].count), subtitle: "Pending Approvals" };
        } else if (role === 'STUDENT') {
            const [markRows] = await db.query(
                "SELECT COUNT(*) as count FROM assignment_submissions WHERE student_id = ? AND marks IS NOT NULL",
                [user_id]
            );
            metrics.actions = { value: String(markRows[0].count), subtitle: "Graded Assignments" };
        }

        res.json(metrics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch metrics" });
    }
});

module.exports = router;
