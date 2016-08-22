
var request = require('request');
var urlencode = require('urlencode');
var multiparty = require("multiparty");
var fs = require('fs');

module.exports = function(app, objectStorage)
{
	app.get('/', function(req, res, next)
	{
        var params = req.query;
        
		if (req.session.swift)
			params = req.session.swift;
		else {
            var swift = new objectStorage.ObjectStorage(params.userId, params.password, params.tenantName, params.tenantId);
            req.session.swift = swift;
            params = swift;
        }

		res.render('index', params);
	});

	app.get('/getContainerList', function(req, res, next)
	{
        var swift = req.session.swift;
        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.GetContainerList(swift, function(data) {
				res.send(data);
			});
		})
	})

    app.get('/createContainer', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.CreateContainer(swift, container_name, function(data) {
                res.send(data);
			});
		})
	})

    app.get('/createDirectory', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var dir_name = req.query.dirName;
        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.CreateDirectory(swift, container_name, dir_name, function(data) {
                res.send(data);
			});
		})
	})

    app.get('/getContainerInfo', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var path = req.query.path;
        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.GetContainerInfo(swift, container_name, path, function(data) {
                //console.log(data);
                res.send(data);
			});
		})
	})

    app.get('/getObjectInfo', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var dir_name = req.query.dirName;
        var file_name = req.query.fileName;

        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.GetObjectInfo(swift, container_name, dir_name, file_name, function(data) {
                res.send(data);
			});
		})
	})

    app.get('/deleteContainer', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;

        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.DeleteContainer(swift, container_name, function(data) {
                res.send(data);
			});
		})
	})

    app.get('/deleteObject', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var dir_name = req.query.dirName;
        var file_name = req.query.fileName;

        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.DeleteObject(swift, container_name, dir_name, file_name, function(data) {
                res.send(data);
			});
		})
	})

    app.get('/copyObject', function(req, res, next)
	{
        var swift = req.session.swift;
        var src_container = req.query.srcContainer;
        var src_dir = req.query.srcDir;
        var src_file = req.query.srcFile;
        var dest_container = req.query.destContainer;
        var dest_dir = req.query.destDir;
        var dest_file = req.query.destFile;

        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.CopyObject(swift, src_container, src_dir, src_file, dest_container, 
                dest_dir, dest_file, function(data) {
                    res.send(data);
			});
		})
	})

    app.get('/searchObject', function(req, res, next)
	{
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var search = req.query.search;

        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
			objectStorage.SearchObject(swift, container_name, function(data) {
                var resultData = [];
                for (var i=0; i<data.length; i++) {
                    var item = {};

                    var slashIndex = data[i].name.lastIndexOf('/');
                    var fileName = data[i].name.substring(slashIndex+1);
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
			});
		})
	})

    app.get('/downloadObject', function (req, res, next) {
        var swift = req.session.swift;
        var container_name = req.query.conName;
        var dir_name = req.query.dirName;
        var file_name = req.query.fileName;

        var Q = objectStorage.GetToken(swift);
        Q.then(function () {
            swift.url = swift.endpoint + "v1/AUTH_" + swift.tenantId + "/" + urlencode(container_name) + "/";
       
            if (dir_name == '')
                swift.url += urlencode(file_name);
            else
                swift.url += urlencode(dir_name) + "/" + urlencode(file_name);

            var options = { method: 'GET',
                    url: swift.url,
                    headers:
                    { 'x-auth-token' : swift.token },
                    json: true
            };
            
            res.setHeader("Content-Description", "File Transfer");
            res.setHeader("Content-Disposition", "attachment; filename="+urlencode(file_name));
            request(options).pipe(res);
        });
    });

    app.post('/uploadObject', function (req, res, next) {
        var multiparty = require("multiparty");
        var form = new multiparty.Form();
        var container_name = req.query.conName;
        var dir_name = req.query.dirName;
        var fileName;

        form.on('part', function(part) {
            var filename;
            var size;
            if (part.filename) {
                    filename = part.filename;
                    fileName = filename;
                    size = part.byteCount;
            }else{
                    part.resume();
            
            }    
            var writeStream = fs.createWriteStream(_path.files+"/"+filename);
            writeStream.filename = filename;
            part.pipe(writeStream);

            part.on('end',function(){
                    writeStream.end();
            });
        });

        // all uploads are completed
        form.on('close', function() {
            var swift = req.session.swift;
            var Q = objectStorage.GetToken(swift);

            var path = _path.files + "/" + fileName;
            var stat = fs.statSync(path);

            Q.then(function () {
                swift.url = swift.endpoint + "v1/AUTH_" + swift.tenantId + "/" + urlencode(container_name) + "/";

                if (dir_name == '')
                    swift.url += urlencode(fileName);
                else
                    swift.url += urlencode(dir_name) + "/" +urlencode(fileName);
                    
                var options = { method: 'PUT',
                        url: swift.url,
                        headers:
                        { 'x-auth-token' : swift.token,
                            'transfer-encoding': 'chunked',
                            'x-detect-content-type': true },
                        json: true
                };

                var file = fs.createReadStream(path).pipe(request(options, function(err, response, body) {
                    if(err) {
                        console.log('error', err);
                    } else {
                        fs.unlink(path, function (err) {
                            if (err) throw err;
                            console.log('deleted ' + path);
                        })
                        res.send(response);
                    }
                }))
            });
            
        });
                
        form.on("error", function(error){
            console.log(error);
        })

        form.parse(req);
        
    });
}