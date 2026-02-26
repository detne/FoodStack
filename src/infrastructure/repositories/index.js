/**
 * All Repositories Export
 */

const postgresRepositories = require('./postgres');
const mongodbRepositories = require('./mongodb');
const { BaseRepository } = require('./BaseRepository');

module.exports = {
  // Base
  BaseRepository,
  
  // PostgreSQL
  ...postgresRepositories,
  
  // MongoDB
  ...mongodbRepositories,
};
