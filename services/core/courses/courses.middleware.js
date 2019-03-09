const express = require('express');
const jsonfile = require('jsonfile');
const path = require('path');

const coursesJsonDBFileName = path.resolve(__dirname, 'courses.db.json');

const router = express.Router();
const url = require('url');

module.exports = server => {
    router.get('/courses', (req, res, next) => {
        let url_parts = url.parse(req.originalUrl, true),
            query = url_parts.query,
            from = query.start || 0,
            to = +query.start + +query.count,
            sort = query.sort,
            queryStr = query.query,
            length;

        jsonfile.readFile(coursesJsonDBFileName, function(err, coursesDb) {
            let courses = coursesDb.courses;

            if (!!query.textFragment) {
                courses = courses.filter(
                    course =>
                        course.name
                            .concat(` ${course.description}`)
                            .toUpperCase()
                            .indexOf(query.textFragment.toUpperCase()) >= 0
                );
            }
            length = courses.length;

            if (courses.length < to || !to) {
                to = courses.length;
            }
            courses = courses.slice(from, to);

            res.json({ courses, length });
        });
    });

    router.get('/courses/:id', (req, res, next) => {
        let id = req.params.id;

        jsonfile.readFile(coursesJsonDBFileName, function(err, coursesDb) {
            let course = coursesDb.courses.find(foundCourse => {
                return foundCourse.id + '' === id + '';
            });

            res.json(course);
        });
    });

    router.delete('/courses', (req, res, next) => {
        let url_parts = url.parse(req.originalUrl, true),
            query = url_parts.query,
            id = query.id;

        jsonfile.readFile(coursesJsonDBFileName, function(err, coursesDb) {
            let courseIndex;

            if (err) {
                res.sendStatus(500);
            } else {
                courseIndex = coursesDb.courses.findIndex(
                    course => course.id + '' === id
                );

                if (courseIndex >= 0) {
                    coursesDb.courses.splice(courseIndex, 1);
                }

                jsonfile.writeFile(coursesJsonDBFileName, coursesDb, function(
                    err
                ) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        });
    });

    router.post('/courses/new', (req, res, next) => {
        jsonfile.readFile(coursesJsonDBFileName, function(err, coursesDb) {
            coursesDb.courses.push(req.body);

            jsonfile.writeFile(coursesJsonDBFileName, coursesDb, () => {
                res.sendStatus(200);
            });
        });
    });

    router.post('/courses/update', (req, res, next) => {
        jsonfile.readFile(coursesJsonDBFileName, function(err, coursesDb) {
            let courseIndex = coursesDb.courses.findIndex(
                course => course.id === req.body.id
            );

            coursesDb.courses[courseIndex] = req.body;

            jsonfile.writeFile(coursesJsonDBFileName, coursesDb, () => {
                res.sendStatus(200);
            });
        });
    });

    return router;
};
