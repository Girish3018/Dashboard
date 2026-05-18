import express from "express";

const router = express.Router();

router.post("/trigger", async (req, res) => {
  try {
    const { repoUrl, branches } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    const isValidUrl = /^(https?:\/\/[^\s]+|git@[a-zA-Z0-9.-]+:[a-zA-Z0-9.\/-]+)$/.test(repoUrl.trim());
    if (!isValidUrl) {
      return res.status(400).json({ error: "Invalid repository URL format. Must be a valid HTTP/HTTPS or SSH Git URL." });
    }

    let branchNames = "main";
    if (Array.isArray(branches) && branches.length > 0) {
      branchNames = branches.join(",");
    } else if (typeof branches === "string" && branches.trim() !== "") {
      branchNames = branches.trim();
    }
    console.log(`[SCAN TRIGGERED] Repo: ${repoUrl}`);
    console.log(`[SCAN TRIGGERED] Branches: ${branchNames}`);

    // =========================================================================
    // JENKINS TRIGGER INTEGRATION
    // Configuration is now securely loaded from your backend/.env file.
    // =========================================================================
    const JENKINS_URL = process.env.JENKINS_URL;
    const JENKINS_JOB_NAME = process.env.JENKINS_JOB_NAME;
    const JENKINS_USER = process.env.JENKINS_USER;
    const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;
    
    // Optional: Define the exact names of the parameters your Jenkins job expects
    const JENKINS_PARAM_REPO = process.env.JENKINS_PARAM_REPO || "REPO_URL";
    const JENKINS_PARAM_BRANCH = process.env.JENKINS_PARAM_BRANCH || "BRANCHES";
    // =========================================================================

    if (JENKINS_URL && JENKINS_JOB_NAME) {
      // Create the trigger URL (buildWithParameters is used when passing variables)
      const triggerUrl = `${JENKINS_URL}/job/${JENKINS_JOB_NAME}/buildWithParameters?${JENKINS_PARAM_REPO}=${encodeURIComponent(repoUrl)}&${JENKINS_PARAM_BRANCH}=${encodeURIComponent(branchNames)}`;

      // Create basic auth header
      const authHeader = "Basic " + Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');

      console.log(`[JENKINS] Calling: ${triggerUrl}`);
      
      // Make the POST request to Jenkins API
      const jenkinsResponse = await fetch(triggerUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
        }
      });

      if (!jenkinsResponse.ok) {
         throw new Error(`Jenkins API Error: ${jenkinsResponse.status} ${jenkinsResponse.statusText}`);
      }
      
      console.log("[JENKINS] Job triggered successfully.");
    } else {
      console.log("[MOCK] Jenkins credentials not provided. Simulating scan instead...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    res.json({
      success: true,
      message: `Successfully initiated scan for ${repoUrl}`,
    });
  } catch (err) {
    console.error("Error triggering scan:", err);
    res.status(500).json({
      error: "Failed to trigger Jenkins pipeline: " + err.message,
    });
  }
});

export default router;
