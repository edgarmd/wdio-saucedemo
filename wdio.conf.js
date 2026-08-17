exports.config = {
    runner: 'local',
    specs: ['./test/specs/**/*.js'],
    maxInstances: 3,

    capabilities: [{
        browserName: 'chrome'
    },
    {
        browserName: 'firefox'
    },
    {
        browserName: 'edge'
    },
    ],

    logLevel: 'warn',
    baseUrl: 'https://www.saucedemo.com',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};