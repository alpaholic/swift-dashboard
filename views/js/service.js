//////////////////////////////////////////////
// client -> service로 서비스를 처리해주는 객체
//////////////////////////////////////////////
var Service = function()
{
    this.options = {
        type: '',
        url: ''
    }
};

// 컨테이너 목록 가져오기
Service.prototype.getContainerList = function (callback) {
    this.options.type = "GET";
    this.options.url = "/getContainerList";

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// container의 dir 구조 가져오기
Service.prototype.getContainerInfo = function (container, path, callback) {
    this.options.type = "GET";
    this.options.url = "/getContainerInfo?conName=" + container + "&path=" + path;

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// 파일 정보 가져오기
Service.prototype.getObjectInfo = function (container, dir, file, callback) {
    this.options.type = "GET";
    this.options.url = "/getObjectInfo?conName=" + container + "&dirName=" + dir + "&fileName=" + file;
    
    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// 이미지 데이터 가져오기
Service.prototype.getImageObjectInfo = function (container, dir, file, callback) {
    this.options.type = "GET";
    this.options.url = "/getImageObjectInfo?conName=" + container + "&dirName=" + dir + "&fileName=" + file;

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// 컨테이너 삭제
Service.prototype.deleteContainer = function (container, callback) {
    this.options.type = "GET";
    this.options.url = "/deleteContainer?conName=" + container;

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// 오브젝트 삭제
Service.prototype.deleteObject = function (container, dir, file, callback) {
    var self = this;
    var startPoint;
    this.options.type = "GET";

    if (dir == "" && file != "") 
        startPoint = file; // 루트 바로 밑의 파일들
    else if (dir != "" && file != "") 
        startPoint = dir + "/" + file; // 일반적인 상황
    else 
        startPoint = dir;

    this.traverseObject(container, startPoint, function (error, results) {
        if (error)
            callback(null, error);
        else {
            results.reverse();
            if (startPoint) 
                results.push(startPoint);

            for (var i = 0; i < results.length; i++) {
                self.options.url = "/deleteObject?conName=" + container + "&objectName=" + results[i];
                commonAjaxRequest(self.options, function (result, error) {
                    if (error)
                        callback(result, error);
                });
            }

            callback("done", null);
        }
    })
}

// 하위 오브젝트를 탐색
Service.prototype.traverseObject = function (container, source, callback) {
    var R = [];
    var self = this;

    this.getContainerInfo(container, source, function (result) {
        var pending = result.length;
        if (!pending) { 
            return callback(null, R); 
        }

        for (var i = 0; i < result.length; i++) {
            var slashIndex = result[i].name.lastIndexOf('/');
            var name = result[i].name.substring(slashIndex + 1);
            var type = "file";
            var insert;

            if (source) 
                insert = source + "/" + name;
            else 
                insert = name;

            if (result[i].content_type == 'application/directory') 
                type = "dir";

            if (type == "dir") {
                R.push(insert);
                self.traverseObject(container, insert, function (err, res) {
                    R = R.concat(res);
                    if (!--pending) {
                        callback(null, R);
                    }
                })
            } else {
                R.push(insert);
                if (!--pending) { 
                        callback(null, R); 
                }
            }
        }
    })
}

// 컨테이너 or 디렉토리 생성
Service.prototype.createRequest = function (container, dir, callback) {
    this.options.type = "GET";

    if (dir == "") 
        this.options.url = "/createContainer?conName=" + container;
    else 
        this.options.url = "/createDirectory?conName=" + container + "&dirName=" + dir;

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// 오브젝트 복사
Service.prototype.copyObject = function (reqParam, callback) {
    this.options.type = "GET";
    this.options.url = "/copyObject?srcContainer=" + reqParam.src_container + "&srcDir=" + reqParam.src_dir +
        "&srcFile=" + reqParam.src_file + "&destContainer=" + reqParam.dest_container + "&destDir=" + reqParam.dest_dir + "&destFile=" + reqParam.dest_file;

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}

// 오브젝트 검색
Service.prototype.searchObject = function (container, search, callback) {
    this.options.type = "GET";
    this.options.url = "/searchObject?conName=" + container + "&search=" + search;

    commonAjaxRequest(this.options, function (result, error) {
        callback(result, error);
    });
}