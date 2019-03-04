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

            jsonfile.readFile(coursesJsonDBFileName, function (err, coursesDb) {
                let courses =  coursesDb.courses;

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

    router.delete('/courses', (req, res, next) => {
		let url_parts = url.parse(req.originalUrl, true),
			query = url_parts.query,
            id = query.id;

            jsonfile.readFile(coursesJsonDBFileName, function (err, coursesDb) {
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

                    jsonfile.writeFile(coursesJsonDBFileName, coursesDb, function(err) {
                        if (err) {
                            res.sendStatus(500);
                        } else{
                            res.sendStatus(200);          
                        }
                    });
                }
              });
    })

    return router;
};
