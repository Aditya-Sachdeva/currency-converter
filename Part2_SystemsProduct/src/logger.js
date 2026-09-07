// Session Logger to simulate app.log in the browser and console
class AppLogger {
    constructor() {
        this.logs = [];
    }

    log(level, message, details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message} ${Object.keys(details).length ? JSON.stringify(details) : ''}`;
        
        this.logs.push(logEntry);
        console.log(logEntry);
    }

    info(msg, details) { this.log("INFO", msg, details); }
    warn(msg, details) { this.log("WARN", msg, details); }
    error(msg, details) { this.log("ERROR", msg, details); }

    getLogs() {
        return this.logs.join('\n');
    }
}

export const logger = new AppLogger();