const express = require('express');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json());

const logFile = path.join(__dirname, '../server.log');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMsg = `${timestamp} - ${message}\n`;
    fs.appendFile(logFile, logMsg, (err) => {
        if (err) process.stderr.write('Log failed: ' + err + '\n');
    });
    // Still log to console for manual runs
    process.stdout.write(logMsg);
}

// Helper to get local IP
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if ('IPv4' !== iface.family || iface.internal) {
                continue;
            }
            return iface.address;
        }
    }
    return 'localhost';
}

// Status tracking
let notificationStatus = {
    state: 'idle', // idle, sending, sent, acknowledged, dismissed, timeout
    lastUpdated: Date.now()
};

app.post('/api/shutdown', (req, res) => {
    log('正在关机...');
    // Windows shutdown command: /s (shutdown) /t 5 (time 5s)
    exec('shutdown /s /t 5', (error, stdout, stderr) => {
        if (error) {
            log(`exec error: ${error}`);
            return res.status(500).json({ error: '发送关机命令失败' });
        }
        res.json({ message: '关机命令已发送' });
    });
});

app.get('/api/status', (req, res) => {
    res.json(notificationStatus);
});

app.post('/api/notify', (req, res) => {
    log('正在发送警告...');
    notificationStatus = {
        state: 'sent',
        lastUpdated: Date.now()
    };

    // Use PowerShell to show a Modal Message Box.
    // This blocks the node process thread slightly (async exec), ensuring visibility.
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('再不睡关电脑了 :)', '⚠️⚠️⚠️该睡觉了⚠️⚠️⚠️', 'YesNo', 'Warning')"`;

    exec(psCommand, (error, stdout, stderr) => {
        log('DEBUG: PowerShell callback triggered');

        if (error) {
            log('PowerShell error: ' + error);
        }

        const output = stdout.trim();
        log('DEBUG: Output: ' + output);

        if (output === 'Yes') {
            notificationStatus = { state: 'acknowledged', lastUpdated: Date.now() };
            log('DEBUG: State set to acknowledged');

        } else if (output === 'No') {
            notificationStatus = { state: 'dismissed', lastUpdated: Date.now() };
            log('DEBUG: State set to dismissed (No)');
        } else {
            // Closed window/Other
            notificationStatus = { state: 'dismissed', lastUpdated: Date.now() };
            log('DEBUG: State set to dismissed (Window Closed)');
        }
    });

    res.json({ message: '警告已发送，等待回复...' });
});

app.listen(port, '0.0.0.0', () => {
    const ip = getLocalIp();
    log(`Server running at http://localhost:${port}`);
    log(`Access from other devices at http://${ip}:${port}`);
});
