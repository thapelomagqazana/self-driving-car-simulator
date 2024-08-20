class Logger {
    static log(message) {
        console.log(`[INFO] ${message}`);
    }

    static error(message) {
        console.error(`[ERROR] ${message}`);
    }
}

export default Logger;