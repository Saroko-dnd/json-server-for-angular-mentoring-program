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

            console.log('DELETE OPERATION');
            console.log(`ID: ${id}`);
            jsonfile.readFile(coursesJsonDBFileName, function (err, coursesDb) {
                let courseIndex;

                if (err) {
                    console.log('open courses error');
                    console.error(err);
                    res.sendStatus(500);
                } else {
                    console.log('open courses success');
                    // console.dir(coursesDb);
                    console.log(typeof coursesDb.courses[0].id);
                    console.log(typeof id);
                    courseIndex = coursesDb.courses.findIndex(
                        course => course.id + '' === id
                    );

                    if (courseIndex >= 0) {
                        console.log(coursesDb.courses.length);
                        coursesDb.courses.splice(courseIndex, 1);
                        console.log(coursesDb.courses.length);
                    }

                    jsonfile.writeFile(coursesJsonDBFileName, coursesDb, function(err) {
                        if (err) {
                            console.log(`courses save error`);
                            res.sendStatus(500);
                        } else{
                            console.log(`courses save success`); 
                            res.sendStatus(200);          
                        }
                    });
                }
              });

              console.log(__dirname);
    })

    return router;
};
