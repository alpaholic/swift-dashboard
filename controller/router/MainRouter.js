
var request = require('request');
var urlencode = require('urlencode');
var multiparty = require("multiparty");
var fs = require('fs');
var progress = require('progress-stream');
var uuid = require('node-uuid');
var connections = {};

var Swift = require(_path.libs + '/Swift');

var getSwiftInstance = function (req) {
    var options = req.session.swiftOptions;
    return new Swift(options);
}

module.exports = function (app, io) {

    var credentialStore = {};

    app.post('/token', function (req, res, next) {
        var secret = req.body.secret;
        var credentials = req.body.credentials;
        var token = uuid.v4();

        //포탈서버에서 client 서버로 접속했을때 생기는 세션이다.
        if (!req.session.tokens)
            req.session.tokens = {};

        if (req.session.tokens[secret]) {
            res.end(req.session.tokens[secret]);
        }
        else {
            req.session.tokens[secret] = token;
            credentialStore[token] = credentials; //메모리에 토큰을 키로 크레덴셜 저장해 놓는다.
            res.end(token);
        }
    });



    app.get('/', function (req, res, next) {
        var params = req.query;
        var token = req.query.token;
        //이 세션은 브라우저와 client서버 사이에 생기는 세션. 즉 위에서 저장한 토큰은 못쓴다. 그러면 크레덴셜도 못쓴다.

        if (!req.session.credentials)
            req.session.credentials = {};

        var credentials = null;
        if (req.session.credentials[token]) {
            credentials = req.session.credentials[token] // 다시 접속하면 저장되어있는걸 쓴다.
        }
        else {
            credentials = req.session.credentials[token] = credentialStore[token]; //스토어에서 쓰고
            delete credentialStore[token]; // 지운다.
        }

        if (!credentials) {
            //잘못된 토큰으로 접속한경우.
            res.sendStatus(401);
            return;
        }
        if (req.session.swift)
            res.render('index');
        else {
            console.log(credentials);
            var swift = new Swift({
                userId: credentials.username,
                password: credentials.password,
                tenantName: credentials.tenantName,
                tenantId: credentials.tenantId,
                authUrl: credentials.auth_url + "/tokens/"
            });

            var done = function (result) {
                swift.options.token = result.access.token.id;
                req.session.swiftOptions = swift.getOptions();
                res.render('index');
            }

            swift.getTokens(done, function (err) {
                res.status(err.code).end(JSON.stringify(err.message));
            });
        }
    });

    app.get('/getContainerList', function (req, res, next) {
        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).getContainerList(done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/createContainer', function (req, res, next) {
        var container_name = req.query.conName;

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).createContainer(container_name, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/createDirectory', function (req, res, next) {
        var container_name = req.query.conName;
        var dir_name = req.query.dirName;

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).createDirectory(container_name, dir_name, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/getContainerInfo', function (req, res, next) {
        var container_name = req.query.conName;
        var path = req.query.path;

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).getContainerInfo(container_name, path, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/getObjectInfo', function (req, res, next) {
        var params = {
            'container': req.query.conName,
            'dir': req.query.dirName,
            'file': req.query.fileName
        };

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).getObjectInfo(params, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/getImageObjectInfo', function (req, res, next) {
        var params = {
            'container': req.query.conName,
            'dir': req.query.dirName,
            'file': req.query.fileName
        };

        var done = function (imageResponse, imageBody) {
            var imageType = imageResponse.headers['content-type'];
            var base64 = new Buffer(imageBody, 'binary').toString('base64');
            var dataURI     = 'data:' + imageType + ';base64,' + base64;
            var jsonString  = JSON.stringify({
                code: imageResponse.statusCode,
                type: imageType,
                data: dataURI
            });
            
            res.writeHead(imageResponse.statusCode, {'Content-Type': 'application/json'});
            res.write(jsonString);
            res.end();
        }

        getSwiftInstance(req).getImageObjectInfo(params, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/deleteContainer', function (req, res, next) {
        var container_name = req.query.conName;

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).deleteContainer(container_name, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/deleteObject', function (req, res, next) {
        var container_name = req.query.conName;
        var object_name = req.query.objectName;

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).deleteObject(container_name, object_name, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/copyObject', function (req, res, next) {
        var params = {
            'src_container': req.query.srcContainer,
            'src_dir': req.query.srcDir,
            'src_file': req.query.srcFile,
            'dest_container': req.query.destContainer,
            'dest_dir': req.query.destDir,
            'dest_file': req.query.destFile
        };

        var done = function (result) {
            res.send(result);
        }

        getSwiftInstance(req).copyObject(params, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/searchObject', function (req, res, next) {
        var container_name = req.query.conName;
        var search = req.query.search;

        var done = function (data) {
            var resultData = [];
            for (var i = 0; i < data.length; i++) {
                var item = {};

                var slashIndex = data[i].name.lastIndexOf('/');
                var fileName = data[i].name.substring(slashIndex + 1);
                var fileSize = data[i].bytes;
                var fileType = data[i]["content_type"];
                var lastModified = data[i]["last_modified"];

                if (fileName.indexOf(search) < 0) continue;

                item["path"] = data[i].name;
                item["objectName"] = fileName;
                item["objectSize"] = fileSize;
                item["objectType"] = fileType;
                item["lastModified"] = lastModified;

                resultData.push(item);
            }
            res.send(resultData);
        }

        getSwiftInstance(req).searchObject(container_name, done, function (err) {
            res.status(err.code).end(JSON.stringify(err.message));
        });
    })

    app.get('/downloadObject', function (req, res, next) {
        var params = {
            'container': req.query.conName,
            'dir': req.query.dirName,
            'file': req.query.fileName
        };

        getSwiftInstance(req).downloadObject(params, res);
    });

    // upload progress bar 용 socket.io
    io.sockets.on('connection', function (socket) {
        connections[socket.id] = socket;
        socket.on('hsFromClient', function () {
            socket.emit('hsToClient', { key: socket.id });
        })
        socket.on('disconnect', function () {
            console.log('user disconnect');
            connections[socket.id] = null;
        })
    });

    app.post('/uploadObject', function (req, res, next) {
        var multiparty = require("multiparty");
        var form = new multiparty.Form();
        form.uploadDir = _path.files;

        var container_name = req.query.conName;
        var dir_name = req.query.dirName;
        var socket_key = req.query.socketKey;
        var remoteSavedFileName;

        form.on('part', function (part) {
            var filename;
            var size;
            if (part.filename) {
                filename = part.filename;
                remoteSavedFileName = filename;
                size = part.byteCount;
            } else {
                part.resume();
            }
            try {
                var writeStream = fs.createWriteStream(_path.files + "/" + filename);
                writeStream.filename = filename;
                part.pipe(writeStream);
            } catch (error) {
                console.log(error.stack);
            }
            part.on('end', function () {
                writeStream.end();
            });
        });

        // all uploads are completed
        form.on('close', function () {
            var swift = getSwiftInstance(req);

            var path = _path.files + "/" + remoteSavedFileName;
            var stat = fs.statSync(path);
            var str = progress({
                length: stat.size,
                time: 100
            });

            str.on('progress', function (progress) {
                connections[socket_key].emit('uploadProgress', { percentage: progress.percentage });
            })

            swift.options.url = swift.options.endpoint + "v1/AUTH_" + swift.options.tenantId + "/" + urlencode(container_name) + "/";

            if (dir_name == '')
                swift.options.url += urlencode(remoteSavedFileName);
            else
                swift.options.url += urlencode(dir_name) + "/" + urlencode(remoteSavedFileName);

            var options = {
                method: 'PUT',
                url: swift.options.url,
                headers:
                {
                    'x-auth-token': swift.options.token,
                    'transfer-encoding': 'chunked',
                    'x-detect-content-type': true
                },
                json: true
            };

            var file = fs.createReadStream(path).pipe(str).pipe(request(options, function (err, response, body) {
                if (err) {
                    console.log('error', err);
                } else {
                    fs.unlink(path, function (err) {
                        if (err) throw err;
                    })
                    res.send(response);
                }
            }))
        });

        form.on("error", function (error) {
            console.log(error);
        })
        form.parse(req);
    });
}