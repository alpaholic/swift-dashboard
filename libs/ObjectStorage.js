// var request = require('request');
// var Promise = require('bluebird');
// var urlencode = require('urlencode');
// var exports = module.exports = {};
// var http = require('http');


// var AUTH_URL = 'http://119.81.236.106:5000/v2.0/tokens/';
// var ENDPOINT = 'http://10.111.140.70:8080/';

// exports.ObjectStorage = function (userId, password, tenantName, tenantId) {
//         this.userId = userId;
//         this.password = password;
//         this.tenantName = tenantName;
//         this.tenantId = tenantId;
//         this.endpoint = ENDPOINT;
//         this.url = null;
//         this.token = null;

//         return {
//             userId: this.userId,
//             password: this.password,
//             tenantName: this.tenantName,
//             tenantId: this.tenantId,
//             endpoint: this.endpoint,
//             url: this.url,
//             token: this.token
//         };
// }
// // auth
// exports.GetToken = function (obj) {
//     var options = { method: 'POST',
//         url: AUTH_URL,
//         body:
//         { auth: 
//             { 
//                 passwordCredentials: 
//                 { 
//                     password: obj.password, 
//                     username: obj.userId 
//                 },
//                 tenantName: obj.tenantName 
//             } 
//         },
//         json: true 
//     };

//     return new Promise(function(resolve, reject) {
//         request(options, function (error, response, body) {
//             if (error) {
//                 throw new Error(error);
//                 reject({error: error});
//             } else {
//                 resolve(body);
//             }
//             obj.token = body.access.token.id;
//         });
//     })
// }

// // 전체 컨테이너 정보
// exports.GetContainerList = function (obj, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId;

//     var options = { method: 'GET',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }

// // 특정 컨테이너 정보
// exports.GetContainerInfo = function (obj, container, path, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container) + "?path=" + urlencode(path);

//     var options = { method: 'GET',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };
//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }

// // 컨테이너 생성
// exports.CreateContainer =  function (obj, container, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container);
    
//     var options = { method: 'PUT',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }

// // 컨테이너 삭제
// exports.DeleteContainer = function (obj, container, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container);
    
//     var options = { method: 'DELETE',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// };

// // 디렉터리 생성
// exports.CreateDirectory =  function (obj, container, dir, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container) + "/" + urlencode(dir);

//     var options = { method: 'PUT',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token,
//             'content-type' : 'application/directory',
//             'content-length' : 0 },
//             json: true
//     };

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }

// // OBJECT 삭제
// exports.DeleteObject = function (obj, container, dir, file, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container) + "/" + urlencode(dir);

//     if (dir == "" && file != "") {
//         obj.url += urlencode(file);
//     } else if (dir != "" && file != "") {
//         obj.url += "/" + urlencode(file);
//     }
//     var options = { method: 'DELETE',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }

// // 파일 정보 가져오기 (디렉터리,파일명)
// exports.GetObjectInfo = function (obj, container, dir, file, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container) + "/";

//     if (dir == '')
//         obj.url += urlencode(file);
//     else
//         obj.url += urlencode(dir) + "/" + urlencode(file);

//     var options = { method: 'GET',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };
//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(response.headers);
//     });
// }

// // Object 복사 
// exports.CopyObject = function (obj, src_container, src_dir, src_file, dest_container, dest_dir, dest_file, callback) {
//     var destination = dest_container + "/";
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(src_container) + "/";

//     if (src_dir == '')
//         obj.url += urlencode(src_file);
//     else
//         obj.url += urlencode(src_dir) + "/" + urlencode(src_file);
    
//     if (dest_dir == '')
//         destination += urlencode(dest_file);
//     else
//         destination += urlencode(dest_dir) + "/" + urlencode(dest_file);

//     var options = { method: 'COPY',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token,
//               'Destination' :  destination},
//             json: true
//     };

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }

// // 오브젝트 검색
// exports.SearchObject = function (obj, container, callback) {
//     obj.url = obj.endpoint + "v1/AUTH_" + obj.tenantId + "/" + urlencode(container) + "?delimeter=/";

//     var options = { method: 'GET',
//             url: obj.url,
//             headers:
//             { 'x-auth-token' : obj.token },
//             json: true
//     };
    
//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         callback(body);
//     });
// }