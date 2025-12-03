const express = require("express");
const crypto = require("crypto");

// In-memory store for biometric challenges and credentials
// In production, use a database with proper encryption
const biometricChallenges = {}; // { username: { challenge, timestamp } }
const biometricCredentials = {}; // { username: { credentialId, publicKey, counter } }

const router = express.Router();

/**
 * POST /biometric/enroll/options
 * Generate WebAuthn registration options for biometric enrollment
 */
router.post("/enroll/options", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  // Generate a random challenge (32 bytes)
  const challenge = crypto.randomBytes(32).toString("base64");
  
  // Store challenge temporarily (expires in 10 minutes)
  biometricChallenges[username] = {
    challenge,
    timestamp: Date.now(),
  };

  // Return WebAuthn registration options
  const options = {
    challenge: challenge,
    rp: {
      name: "LexiSign",
      id: "localhost", // In production, use your actual domain
    },
    user: {
      id: crypto.randomBytes(32).toString("base64"),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    timeout: 60000,
    attestation: "direct",
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Uses device biometrics
      userVerification: "required",
    },
  };

  res.json(options);
});

/**
 * POST /biometric/enroll/verify
 * Verify and store the biometric credential
 */
router.post("/enroll/verify", (req, res) => {
  const { username, credentialRaw } = req.body;
  if (!username || !credentialRaw) {
    return res.status(400).json({ message: "Username and credential required" });
  }

  const challenge = biometricChallenges[username];
  if (!challenge || Date.now() - challenge.timestamp > 10 * 60 * 1000) {
    return res.status(400).json({ message: "Challenge expired or not found" });
  }

  // In a real implementation, you would:
  // 1. Verify the attestation object signature
  // 2. Extract and validate the public key
  // 3. Store the credential securely
  // 4. Verify the challenge matches

  // For demo, we'll simplify and just store the credential ID and public key info
  try {
    const credentialId = credentialRaw.id || crypto.randomBytes(32).toString("base64");
    const publicKeyData = credentialRaw.response?.publicKey || crypto.randomBytes(32).toString("base64");
    const counter = credentialRaw.response?.counter || 0;

    // Store the biometric credential
    biometricCredentials[username] = {
      credentialId,
      publicKeyData,
      counter,
      enrolledAt: new Date().toISOString(),
    };

    // Clean up challenge
    delete biometricChallenges[username];

    res.json({ message: "Biometric enrollment successful" });
  } catch (err) {
    console.error("Biometric enrollment error:", err);
    res.status(400).json({ message: "Failed to enroll biometric" });
  }
});

/**
 * POST /biometric/authenticate/options
 * Generate WebAuthn assertion options for biometric authentication
 */
router.post("/authenticate/options", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  const credential = biometricCredentials[username];
  if (!credential) {
    return res.status(404).json({ message: "No biometric credential found for user" });
  }

  // Generate a new challenge
  const challenge = crypto.randomBytes(32).toString("base64");
  
  biometricChallenges[username] = {
    challenge,
    timestamp: Date.now(),
  };

  // Return WebAuthn assertion options
  const options = {
    challenge: challenge,
    timeout: 60000,
    userVerification: "required",
    allowCredentials: [
      {
        type: "public-key",
        id: credential.credentialId,
        transports: ["internal"], // For platform authenticators
      },
    ],
  };

  res.json(options);
});

/**
 * POST /biometric/authenticate/verify
 * Verify biometric assertion and return JWT if successful
 * (Requires the client to first verify with password or existing token)
 */
router.post("/authenticate/verify", (req, res) => {
  const { username, assertionRaw } = req.body;
  if (!username || !assertionRaw) {
    return res.status(400).json({ message: "Username and assertion required" });
  }

  const challenge = biometricChallenges[username];
  if (!challenge || Date.now() - challenge.timestamp > 10 * 60 * 1000) {
    return res.status(400).json({ message: "Challenge expired or not found" });
  }

  const credential = biometricCredentials[username];
  if (!credential) {
    return res.status(404).json({ message: "No biometric credential found" });
  }

  // In a real implementation, you would:
  // 1. Verify the signature using the stored public key
  // 2. Check the challenge matches
  // 3. Verify the counter to prevent cloning
  // 4. Update the counter

  try {
    // For demo, verify that assertion has required fields
    if (!assertionRaw.id || !assertionRaw.response?.clientDataJSON) {
      return res.status(400).json({ message: "Invalid assertion format" });
    }

    // Increment counter
    credential.counter = (credential.counter || 0) + 1;

    // Clean up challenge
    delete biometricChallenges[username];

    // Signal success (JWT generation handled by main /auth/login route)
    res.json({
      message: "Biometric authentication successful",
      verified: true,
    });
  } catch (err) {
    console.error("Biometric verification error:", err);
    res.status(400).json({ message: "Biometric verification failed" });
  }
});

/**
 * GET /biometric/enrolled/:username
 * Check if user has enrolled biometric
 */
router.get("/enrolled/:username", (req, res) => {
  const { username } = req.params;
  const hasEnrolled = !!biometricCredentials[username];
  res.json({ username, hasEnrolled });
});

module.exports = router;
module.exports.biometricCredentials = biometricCredentials;
module.exports.biometricChallenges = biometricChallenges;
