// REWRITE EXAMPLE
const express = require('express');
const jsonServer = require('json-server');
const router = express.Router();

router.use(
    jsonServer.rewriter({
        '/courses': '/courses',
        '/courses/:id': '/courses/:id',
        '/courses/new': '/courses/new',
        '/courses/update': '/courses/update'
    })
);

module.exports = router;
