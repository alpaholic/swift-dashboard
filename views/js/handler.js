
//////////////////////////////////////////////
// handler에서 공통으로 사용되는 js
//////////////////////////////////////////////

// global variable set
var _addActionType; // 좌측 Create 버튼의 Action type을 갖고 있는 global variable
var _deleteActionType = "container"; // Delete 버튼의 Action type을 갖고 있는 global variable

var _navigatorGlobal = 
{
    pathStack: [], // 현재 디렉토리 path 정보를 갖고 있는 배열
    currentDepth: 0, // 디렉토리 구조의 현재 depth 값.
    initializePathStack: function () 
    {
        this.pathStack = [];
        this.currentDepth = 0;
    },
    handlePathStack: function (depth, path) 
    {
        // 현재의 depth보다 더 낮은 depth의 패널을 누를 경우 pop을 해서 path를 제거한다.
        if (depth < this.currentDepth) {
            this.rearrangePathStack(this.currentDepth - depth);
        }

        if (this.currentDepth != 0) path = "/" + path;
        // path를 디렉토리 path정보에 push 한다.
        this.pathStack.push(path);
        this.currentDepth++;
    },
    rearrangePathStack: function (diff)
    {
        for (var i = 0; i < diff; i++) {
            this.pathStack.pop();
            this.currentDepth--;
        }
    }
};

var _isCopied = false; // 파일 복사 여부
var _isCut = false; // 파일 잘라내기 여부

// 파일 복사 source options
var _srcOptions = 
{
    srcConName: "", // 복사할 컨테이너의 이름
    srcDirName: "", // 복사할 디렉토리의 이름
    srcFileName: "", // 복사한 파일의 이름
    setSrcProp: function (type) // src* 전역 변수 설정
    {
        var successMsg = (type == 'copy') ? 'Your file has been copied.' : 'Your file has been cut.';
        var failMsg = 'You should select a file';
        var info = getAllSelectedAction();
        
        if (info.objectType == "file") {
            this.srcConName = info.conName;
            this.srcDirName = info.dirPath;
            this.srcFileName = info.objectName;
            commonHelperMessage(successMsg, false);
            return true;
        } else {
            commonHelperMessage(failMsg, false);
            return false;
        }
    }
};

// 파일 복사 destination options
var _destOptions =
{
    destConName: "", // 붙여넣기할 컨테이너의 이름
    destDirName: "", // 붙여넣기할 디렉토리의 이름
    destFileName: "", // 붙여넣기할 파일의 이름
    setDestProp: function () // dest* 전역 변수 설정
    {
        var info = getAllSelectedAction();
        this.destConName = info.conName;
        this.destDirName = info.dirPath;
        this.destFileName = _srcOptions.srcFileName;
    }
};

// modal 처리 함수
var modalHandler = function (target, action) {
    // action type을 전역 변수에 저장
    _addActionType = action;
    var modal = $(target);
    var text_element = $('.create-warning');
    text_element.hide();

    modal.find('.modal-title').text('Create a new ' + action);
}

// paste, create, delete action 이후의 처리 함수
// var reloadHandler = function (conName, isClick) {
//     containerHandler(conName, isClick, function () {
//         if (!isClick) {
//             var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
//             $(selector).trigger('click');
//         }
//     });
// }

// 파일 탐색기 패널에 object를 추가시키는 함수
var makeObject = function (depth, type, name, size) {
    var img = "glyphicon ";
    var dirPadding = "";
    if (type == "dir") {
        img += "glyphicon-folder-close color-blue";
        dirPadding = "directory-file-padding";
    } else if (type == "file") {
        img += "glyphicon-file color-gray";
    }

    var source   = $("#make-object").html();
    var template = Handlebars.compile(source);
    var data = {depth: depth, type: type, img: img, name: name, size: size, dirPadding: dirPadding};

    return template(data);
}

// 네비의 a 태그에서 해당 폴더로 옮기는 함수
var navigatorHandler = function (target) {
    var depth = $(target).attr('depth');
    if (depth == -1) {
        $('.left-container-body').each(function (i, e) {
            if ( $(this).hasClass('container-selected') ) 
                $(this).trigger('click');
        });
    } else {
        $('.object-depth-'+depth).each(function (i, e) {
            if ( $(this).hasClass('file-old-selected') ) 
                $(this).trigger('click');
        });
    }
}

// 검색 결과 화면에 object를 추가 시키는 함수
var makeSearchObject = function (type, name, path, modified, size) {
    var img = "glyphicon ";
    if (type == "dir") {
        img += "glyphicon-folder-open color-blue";
    } else if (type == "file") {
        img += "glyphicon-file color-gray";
    }

    var source   = $("#make-search-object").html();
    var template = Handlebars.compile(source);
    //var data = {img: img, name: name, path: path, modified: modified.substring(0, 10), size: convertBytesToX(size, 0)};
    var data = {img: img, name: name, path: path, modified: modified.substring(0, 10)};
    
    return template(data);
}

// 컨테이너 리스트 추가해주는 함수
var makeContainerObject = function (name, count, size) {
    var source   = $("#make-container-object").html();
    var template = Handlebars.compile(source);
    var data = {name: name, count: count, size: convertBytesToX(size, 0)};
    
    return template(data);
}
// 네비를 추가해주는 함수
var makeNavigatorObject = function (path, last, depth) {
    var source;
    var data;
    if (last)
    {
        source  = $("#make-navigator-object-last").html();
        data = {path: path};
    } else
    {
        source  = $("#make-navigator-object").html();
        data = {path: path, depth: depth};
    }
        
    var template = Handlebars.compile(source);
    return template(data);
} 

// 파일 탐색기 부분을 리셋하는 함수
var fileExplorerReset = function () {
    $('.explorer-panel').each(function (i, e) {
        if (i==0)
            $(this).children().remove();
        else
            $(this).parent().parent().parent().remove();
    });
}

// 현재 눌러진 패널 다음 패널만 나오도록 설정
var rearrangePanel = function (depth) {
    $('.explorer-panel').each(function (i, e) {
        if (i > (depth + 1)) {
            //$(this).children().remove();
            $(this).parent().parent().parent().remove();
            if (i >= 3) {
                $(this).parent().parent().parent().remove();
            }
        }
    })
}

// 현재 접근하고 있는 패널에 색상을 주는 함수
var filePanelSetting = function (depth) {
    $('.explorer-panel').each(function (i, e) {
        if ((i-1) < depth)
            $(this).parent().css('background-color', '#fafafa');
        else
            $(this).parent().css('background-color', '#fff');
    })
}

// swift object list를 directory 먼저 나올 수 있게 정렬해주는 함수
var sortObjectList = function (data) {
    var dataObject = {
        items: []
    };

    for (var i = 0; i < data.length; i++) {
        var slashIndex = data[i].name.lastIndexOf('/');
        var name = data[i].name.substring(slashIndex + 1);
        var size = data[i].bytes;
        var type = "file";
        var seq = 1;

        if (data[i].content_type == 'application/directory') {
            type = "dir";
            seq = 0;
        }
        dataObject.items.push (
            {
                'name': name,
                'size': size,
                'type': type,
                'seq': seq
            }
        );
    }

    dataObject.items.sort(function (a, b) {
        return a.seq < b.seq ? -1 : a.seq > b.seq ? 1 : 0;
    })

    return dataObject;
}

// swift object list를 directory 먼저 나올 수 있게 정렬해주는 함수 (검색용)
var sortSearchObjectList = function (data) {
    var dataObject = {
        items: []
    };

    for (var i = 0; i < data.length; i++) {
        var name = data[i].objectName;
        var path = data[i].path;
        var modified = data[i].lastModified;
        var size = data[i].objectSize;
        var type = "file";
        var seq = 1;

        if (data[i].objectType == 'application/directory') {
            type = "dir";
            seq = 0;
        }
        dataObject.items.push (
            {
                'objectName': name,
                'path': path,
                'lastModified': modified,
                'objectSize': size,
                'objectType': type,
                'seq': seq
            }
        );
    }

    dataObject.items.sort(function (a, b) {
        return a.seq < b.seq ? -1 : a.seq > b.seq ? 1 : 0;
    })

    return dataObject;
}

// 현재 선택된 container, directory path, object type, object name을 객체로 반환해주는 함수
var getAllSelectedAction = function () 
{
    var info = {};
    var selector = $('.explorer-panel > .file-selected').last();

    info.conName = $('.container-selected > .container-name').text();
    info.dirPath = _navigatorGlobal.pathStack.join('');
    info.objectType = $(selector).find('div').eq(0).attr('object-type');
    info.objectName = $(selector).find('.object-file-name').text();

    return info;
}