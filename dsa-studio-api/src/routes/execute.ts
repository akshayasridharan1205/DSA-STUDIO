import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const router = express.Router();
const execAsync = promisify(exec);

const DOCKER_IMAGE = 'dsa-studio-sandbox';

router.post('/', async (req, res) => {
  const { language, code } = req.body;

  // 1. Validation
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return res.status(400).json({ success: false, error: 'Code cannot be empty.' });
  }
  if (code.length > 20000) {
    return res.status(400).json({ success: false, error: 'Code exceeds length limit of 20,000 characters.' });
  }
  if (language !== 'c' && language !== 'python') {
    return res.status(400).json({ success: false, error: 'Unsupported language. Only "c" or "python" are allowed.' });
  }

  let tempDir = '';
  try {
    // Check if Docker is available
    try {
      await execAsync('docker --version');
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Docker is not installed or not available on the server.'
      });
    }

    // Create a temporary directory for this execution
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsa-sandbox-'));

    let dockerCmd = '';
    
    if (language === 'python') {
      const codePath = path.join(tempDir, 'main.py');
      await fs.writeFile(codePath, code);
      // Run Python script directly in the container
      dockerCmd = `docker run --rm -i --network none --memory 100m -v "${tempDir}:/sandbox" -w /sandbox ${DOCKER_IMAGE} python3 main.py`;
    } else if (language === 'c') {
      const codePath = path.join(tempDir, 'main.c');
      await fs.writeFile(codePath, code);
      // Compile and run C code
      // We run a shell command inside the container to do both steps
      dockerCmd = `docker run --rm -i --network none --memory 100m -v "${tempDir}:/sandbox" -w /sandbox ${DOCKER_IMAGE} sh -c "gcc main.c -o main && ./main"`;
    }

    try {
      // Execute with a 5 second timeout on the Node side
      // The process will be killed if it exceeds this
      const { stdout, stderr } = await execAsync(dockerCmd, { timeout: 5000 });
      return res.json({
        success: true,
        stdout,
        stderr,
        exitCode: 0,
        timedOut: false
      });
    } catch (execError: any) {
      // Handle timeout, compilation error, or runtime error
      const isTimeout = execError.killed && execError.signal === 'SIGTERM';
      
      // If it timed out, the docker process might still be lingering in the background depending on how it was killed, 
      // but --rm generally cleans it up eventually, or we could explicitly kill it. For this scope, the Node timeout handles the response.
      return res.json({
        success: false,
        stdout: execError.stdout || '',
        stderr: execError.stderr || execError.message || '',
        exitCode: execError.code || 1,
        timedOut: isTimeout
      });
    }

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred during execution.'
    });
  } finally {
    // Cleanup temporary directory
    if (tempDir) {
      try {
        // recursive rm is node 14.14+
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error('Failed to clean up temp dir:', cleanupErr);
      }
    }
  }
});

export default router;
