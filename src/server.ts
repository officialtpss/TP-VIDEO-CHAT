import App from './app';
import { ExitStatus } from './common/enum/Server';

const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

process.on('unhandledRejection', (reason, promise) => {
    console.error(`App exiting due to an unhandled promise: ${promise} and reason: ${reason}`);
    throw reason;
});

process.on('uncaughtException', error => {
    console.error(`App exiting due to an uncaught exception: ${error}`);
    process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {

    try {

        const server = new App();
        await server.initialize();
        server.start();

        for (const exitSignal of exitSignals) {
            process.on(exitSignal, async () => {
                try {
                    await server.disconnect();
                    console.log(`App exited with success`);
                    process.exit(ExitStatus.Success);
                } catch (error) {
                    console.error(`App exited with error: ${error}`);
                    process.exit(ExitStatus.Failure);
                }
            });
        }
    } catch (error) {
        console.error(`App exited with error: ${error}`);
        process.exit(ExitStatus.Failure);
    }
})();
