namespace Express {
  interface Request {
    context: {
      databasePool: import('../../db').DatabasePool
    }
  }
}