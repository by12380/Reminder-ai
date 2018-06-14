'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/reminder-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-reminder-app';
exports.PORT = process.env.PORT || 8080;
exports.GMAIL_USERNAME = process.env.GMAIL_USERNAME;
exports.GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;