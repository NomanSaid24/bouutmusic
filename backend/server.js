const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const startupLogPath = path.join(__dirname, 'startup-error.log');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

function writeStartupLog(message) {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    console.error(line.trim());

    try {
        fs.appendFileSync(startupLogPath, line, 'utf8');
    } catch {
        // Ignore logging failures so the original startup error is preserved.
    }
}

process.on('uncaughtException', error => {
    writeStartupLog(`uncaughtException: ${error && error.stack ? error.stack : error}`);
    process.exit(1);
});

process.on('unhandledRejection', reason => {
    writeStartupLog(`unhandledRejection: ${reason && reason.stack ? reason.stack : reason}`);
    process.exit(1);
});

process.chdir(__dirname);
writeStartupLog(`server.js bootstrap starting. cwd=${process.cwd()} PORT=${process.env.PORT || '<unset>'}`);

function generatePrismaClient() {
    const prismaCliPath = require.resolve('prisma/build/index.js');
    writeStartupLog(`Attempting prisma generate using schema=${schemaPath}`);
    execFileSync(process.execPath, [prismaCliPath, 'generate', '--schema', schemaPath], {
        cwd: __dirname,
        env: process.env,
        stdio: 'pipe',
    });
    writeStartupLog('Prisma client generated successfully.');
}

function startApplication() {
    require('./dist/index.js');
}

try {
    startApplication();
} catch (error) {
    const message = error && error.stack ? error.stack : String(error);

    if (message.includes('@prisma/client did not initialize yet')) {
        try {
            generatePrismaClient();
            startApplication();
            return;
        } catch (generateError) {
            writeStartupLog(`prisma generate failure: ${generateError && generateError.stack ? generateError.stack : generateError}`);
        }
    }

    writeStartupLog(`startup failure: ${message}`);
    process.exit(1);
}
