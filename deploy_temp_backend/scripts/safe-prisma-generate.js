const { execFileSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');

try {
    const prismaCliPath = require.resolve('prisma/build/index.js', { paths: [projectRoot] });
    execFileSync(process.execPath, [prismaCliPath, 'generate', '--schema', schemaPath], {
        cwd: projectRoot,
        env: process.env,
        stdio: 'inherit',
    });
} catch (error) {
    console.warn('Prisma generate was skipped during postinstall. The backend will retry on first startup.');
    if (error && error.message) {
        console.warn(error.message);
    }
    process.exit(0);
}
