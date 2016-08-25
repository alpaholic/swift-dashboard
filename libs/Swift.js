var request = require('request');
var Promise = require('bluebird');
var urlencode = require('urlencode');
var http = require('http');
var env = require('node-env-file');
env(_path.home + '/swift.properties');

var AUTH_URL = process.env.AUTHURL;//'http://object-storage.ghama.io:5000/v2.0/tokens/';//
var ENDPOINT = process.env.ENDPOINT;


module.exports = (function()
{
    var Swift = function(options)
    {
        this.options = extend({
            userId: '',
            password: '',
            tenantName: '',
            tenantId: '',
            endpoint: ENDPOINT,
            url: '',
            token: ''
        }, options);
    };

    // 인증 관련
    Swift.prototype.getTokens = function(callback, error)
    {
        var that = this;
        var param = {
            method: 'POST',
            url: AUTH_URL,
            body:
            {
                auth:
                {
                    passwordCredentials:
                    {
                        password: this.options.password,
                        username: this.options.userId
                    },
                    tenantName: this.options.tenantName
                }
            },
            json: true
        };
        console.log("[CALL] name: getTokens, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if (err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }
            if (!body.access) //statusCode 처리
            {
                if(error)
                    error({code: 401, message: 'token is not found.'});
                else
                    cosnole.log('token; is not found.');

                return;
            }
            // endpoint 주소를 동적으로 가져오는 소스
            // 우선 대기........
            // var serviceCatalog = body.access.serviceCatalog;
            // for (var i=0; i<serviceCatalog.length; i++) 
            // {
            //     var info = serviceCatalog[i];
            //     if (info.type == "object-store" && info.name == "swift") 
            //     {
            //         var publicurl = info.endpoints[0].publicURL;
            //         var temp = 'http://' + publicurl.replace('http://', '').split('/')[0] + '/';
            //         that.options.endpoint =  temp;
            //         break;
            //     }
            // }
            
            callback(body);
        });
    };
    // options 반환
    Swift.prototype.getOptions = function()
    {
        return this.options;
    };
    // 컨테이너 리스트 반환
    Swift.prototype.getContainerList = function(callback, error)
    {
        var param = {
            method: 'GET',
            url: this.options.endpoint + "v1/AUTH_" + this.options.tenantId,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: getContainerList, method: " + param.method + "url: " + param.url, "token: " + this.options.token);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 200 || response.statusCode == 204)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 컨테이너 생성
    Swift.prototype.createContainer = function(container, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(container);

        var param = {
            method: 'PUT',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: createContainer, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 201 || response.statusCode == 204)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 디렉토리 생성
    Swift.prototype.createDirectory = function(container, dir, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(container) + "/" + urlencode(dir);

        var param = {
            method: 'PUT',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token,
                'content-type': 'application/directory',
                'content-length': 0
            },
            json: true
        };
        console.log("[CALL] name: createDirectory, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 201)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 컨테이너 내부 파일 정보
    Swift.prototype.getContainerInfo = function(container, path, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(container) + "?path=" + urlencode(path);

        var param = {
            method: 'GET',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: getContainerInfo, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 200 || response.statusCode == 204)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 파일 상세 정보
    Swift.prototype.getObjectInfo = function(reqParam, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(reqParam.container) + "/";

        if (reqParam.dir == '')
            this.options.url += urlencode(reqParam.file);
        else
            this.options.url += urlencode(reqParam.dir) + "/" + urlencode(reqParam.file);

        var param = {
            method: 'GET',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: getObjectInfo, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 200)
            {
                if(callback)
                    callback(response.headers);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 이미지 파일 데이터
    Swift.prototype.getImageObjectInfo = function(reqParam, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(reqParam.container) + "/";

        if (reqParam.dir == '')
            this.options.url += urlencode(reqParam.file);
        else
            this.options.url += urlencode(reqParam.dir) + "/" + urlencode(reqParam.file);

        var param = {
            method: 'GET',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            encoding: 'binary',
            json: true
        };
        console.log("[CALL] name: getImageObjectInfo, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 200)
            {
                if(callback)
                    callback(response, body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 컨테이너 삭제
    Swift.prototype.deleteContainer = function(container, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(container);

        var param = {
            method: 'DELETE',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: deleteContainer, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 204)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 파일 삭제
    Swift.prototype.deleteObject = function(container, object, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(container) + "/" + urlencode(object);

        var param = {
            method: 'DELETE',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: deleteObject, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 204)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 파일 복사
    Swift.prototype.copyObject = function(reqParam, callback, error)
    {
        var destination = reqParam.dest_container + "/";
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(reqParam.src_container) + "/";

        if (reqParam.src_dir == '')
            this.options.url += urlencode(reqParam.src_file);
        else
            this.options.url += urlencode(reqParam.src_dir) + "/" + urlencode(reqParam.src_file);

        if (reqParam.dest_dir == '')
            destination += urlencode(reqParam.dest_file);
        else
            destination += urlencode(reqParam.dest_dir) + "/" + urlencode(reqParam.dest_file);

        var param = {
            method: 'COPY',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token,
                'Destination': destination
            },
            json: true
        };
        console.log("[CALL] name: copyObject, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 201)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 파일 검색
    Swift.prototype.searchObject = function(container, callback, error)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(container) + "?delimeter=/";

        var param = {
            method: 'GET',
            url: this.options.url,
            headers: {
                'x-auth-token': this.options.token
            },
            json: true
        };
        console.log("[CALL] name: searchObject, method: " + param.method + "url: " + param.url);
        request(param, function(err, response, body)
        {
            if(err)
            {
                if(error)
                    error({code : 404, message : err});
                else
                    throw new Error(err);

                return;
            }

            if(response.statusCode == 200)
            {
                if(callback)
                    callback(body);
            }
            else
            {
                if(error)
                    error({code : response.statusCode});
            }
        });
    };
    // 파일 다운로드
    Swift.prototype.downloadObject = function(reqParam, res)
    {
        this.options.url = this.options.endpoint + "v1/AUTH_" + this.options.tenantId + "/" + urlencode(reqParam.container) + "/";

        if (reqParam.dir == '')
            this.options.url += urlencode(reqParam.file);
        else
            this.options.url += urlencode(reqParam.dir) + "/" + urlencode(reqParam.file);

        var param = {
            method: 'GET',
            url: this.options.url,
            headers:
            { 'x-auth-token': this.options.token },
            json: true
        };
        console.log("[CALL] name: downloadObject, method: " + param.method + "url: " + param.url);
        res.setHeader("Content-Descrgiption", "File Transfer");
        res.setHeader("Content-Disposition", "attachment; filename=" + urlencode(reqParam.file));
        request(param).pipe(res);
    };

    return Swift;
})();

function extend(destination, source) 
{
    for (var property in source)
        destination[property] = source[property];

    return destination;
}