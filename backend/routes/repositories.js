import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
          r.id, 
          r.name, 
          r.url, 
          r.created_at as repo_created_at,
          COUNT(s.id) as total_findings,
          MAX(sr.started_at) as last_scan_time,
          (SELECT status FROM scan_runs WHERE repo_id = r.id ORDER BY started_at DESC LIMIT 1) as last_scan_status
      FROM repositories r
      LEFT JOIN secrets s ON s.repo_id = r.id
      LEFT JOIN scan_runs sr ON sr.repo_id = r.id
      GROUP BY r.id, r.name, r.url, r.created_at
      ORDER BY last_scan_time DESC NULLS LAST;
    `;

    const result = await pool.query(query);

    const formatted = result.rows.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      totalFindings: parseInt(item.total_findings, 10),
      lastScanTime: item.last_scan_time,
      lastScanStatus: item.last_scan_status || "Unknown",
      createdAt: item.repo_created_at
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching repositories:", err);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

export default router;
