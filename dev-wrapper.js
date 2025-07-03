const { spawn } = require('child_process');

// Get arguments passed to this script, excluding 'node' and the script path
const args = process.argv.slice(2);

// Filter out the --hostname flag and its value
const filteredArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--hostname') {
    // Skip the flag and its value
    i++;
  } else {
    filteredArgs.push(args[i]);
  }
}

// Command to execute
const command = 'netlify';
const commandArgs = ['dev', ...filteredArgs];

console.log(`Executing: ${command} ${commandArgs.join(' ')}`);

// Spawn the netlify dev process
const netlifyProcess = spawn(command, commandArgs, {
  stdio: 'inherit', // 'inherit' means the child process uses the parent's stdio
  shell: true // Use shell to handle command resolution (e.g. finding `netlify` in PATH)
});

netlifyProcess.on('close', (code) => {
  console.log(`Netlify process exited with code ${code}`);
  process.exit(code);
});

netlifyProcess.on('error', (err) => {
  console.error('Failed to start Netlify process:', err);
  process.exit(1);
});
