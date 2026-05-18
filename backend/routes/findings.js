import express from "express";
import pool from "../db.js";
import { getSeverity } from "../utils/severityMapper.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT
          s.id,
          s.tool,
          s.secret_type,
          s.file_path,
          s.source_url,
          s.created_at,
          s.is_active,
          s.secret_status,

          r.name AS repo_name,

          gm.author_email,
          gm.committer_email,
          gm.commit_hash,

          sv.verdict,
          sv.confidence,
          sv.risk_score,
          sv.reasoning,
          sv.evidence,
          sv.is_likely_active

      FROM secrets s

      LEFT JOIN repositories r
          ON s.repo_id = r.id

      LEFT JOIN secret_git_metadata gm
          ON gm.secret_id = s.id

      LEFT JOIN secret_validations sv
          ON sv.secret_id = s.id

      ORDER BY s.created_at DESC
    `;

    const result = await pool.query(query);

    const formatted = result.rows.map((item) => ({
      id: item.id,
      tool: item.tool || "Unknown",
      secretType: item.secret_type || "Unknown",
      repo: item.repo_name,
      severity: getSeverity(item.risk_score),
      riskScore: item.risk_score,
      status: item.secret_status || "OPEN",
      time: item.created_at,
      committerEmail: item.committer_email || item.author_email || "unknown@company.com",
      commitHash: item.commit_hash,
      confidence: item.confidence,
      filePath: item.file_path,
      sourceUrl: item.source_url,
      reasoning: item.reasoning,
      evidence: item.evidence,
      verdict: item.verdict,
      isActive: item.is_active,
      isLikelyActive: item.is_likely_active,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch findings" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalSecrets = await pool.query(`
      SELECT COUNT(*) FROM secrets
    `);

    const criticalExposures = await pool.query(`
      SELECT COUNT(*)
      FROM secret_validations
      WHERE risk_score >= 9
    `);

    const scannedReposQuery = await pool.query(`
      SELECT name FROM repositories
    `);
    const scannedReposList = scannedReposQuery.rows.map(row => row.name);

    // Active incidents = secrets still OPEN
    const activeIncidents = await pool.query(`
      SELECT COUNT(*)
      FROM secrets
      WHERE secret_status = 'OPEN'
    `);

    res.json({
      totalSecrets: totalSecrets.rows[0].count,
      criticalExposures: criticalExposures.rows[0].count,
      repositoriesScanned: scannedReposList.length,
      scannedReposList: scannedReposList,
      activeIncidents: activeIncidents.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, changedBy = "dashboard", changeReason = null } = req.body;

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED_RISK"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Use the stored procedure which also writes audit history
    await pool.query(
      `SELECT set_secret_status($1, $2, $3, $4)`,
      [id, status, changedBy, changeReason]
    );

    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.get("/trend", async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(s.created_at) as date,
        COUNT(s.id) as total,
        COUNT(CASE WHEN sv.risk_score >= 9 THEN 1 END) as critical,
        COUNT(CASE WHEN sv.risk_score >= 7 AND sv.risk_score < 9 THEN 1 END) as high,
        COUNT(CASE WHEN sv.risk_score >= 4 AND sv.risk_score < 7 THEN 1 END) as medium,
        COUNT(CASE WHEN sv.risk_score < 4 THEN 1 END) as low
      FROM secrets s
      LEFT JOIN secret_validations sv ON sv.secret_id = s.id
      GROUP BY DATE(s.created_at)
      ORDER BY date ASC
      LIMIT 30
    `;
    const result = await pool.query(query);

    const formatted = result.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      total: parseInt(row.total, 10) || 0,
      critical: parseInt(row.critical, 10) || 0,
      high: parseInt(row.high, 10) || 0,
      medium: parseInt(row.medium, 10) || 0,
      low: parseInt(row.low, 10) || 0,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching trend:", err);
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
});

export default router;
