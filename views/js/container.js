//////////////////////////////////////////////
// 좌측 컨테이너 js
//////////////////////////////////////////////

// 컨테이너 전체 목록을 처리해주는 함수
// conName -> 어떤 이벤트 후 conName에 해당하는 컨테이너에 클릭 이벤트를 줄때 사용
var containerHandler = function (conName, isClick, callback) {
    // 컨테이너 리스트 전체 삭제
    $('#containerList').empty();

    var loader = new commonAjaxLoader($('.left-container-list'));
    var service = new Service();

    service.getContainerList(function (result, error) {
        if (error) 
            commonErrorHandler(error);
        else {
            var containerCount = result.length; // 총 컨테이너 수
            var totalFiles = 0; // 총 파일 수
            var consumed = 0; // 총 사용 용량

            for (var i = 0; i < result.length; i++) {
                totalFiles += result[i].count;
                consumed += result[i].bytes;

                var name = result[i].name;
                var count = result[i].count;
                var size = result[i].bytes;

                $('#containerList').first().append(makeContainerObject(name, count, size));

                if (conName) {
                    if (name == conName) {
                        if (isClick) 
                            $('.left-container-info').eq(i).trigger('click');
                        else 
                            $('.left-container-info').eq(i).find('.left-container-body').addClass('container-selected');
                    }
                }

            }
            commonInsertHtml('#totalContainers', '<strong>' + containerCount + '</strong>');
            commonInsertHtml('#totalFiles', '<strong>' + totalFiles + '</strong>');
            commonInsertHtml('#totalConsumed', '<strong>' + convertBytesToX(consumed, 0) + '</strong>');
        }
        loader.remove();
        if (callback) callback();
    })
}

// 왼쪽 컨테이너 박스를 선택을 처리해주는 함수
var leftContainerHandler = function (target) {
    // 검색화면 숨기고 파일 탐색기 보여짐
    $('#displaySeachResult').hide();
    $('#displayFileExplorer').show();
    $('.header-swift-info').hide();
    $('.first-panel').show();
    $('.header-navigator').show();
    
    var containerLoader = new commonAjaxLoader($('.left-container-list'));

    // path를 다시 초기화
    _navigatorGlobal.initializePathStack();
    _deleteActionType = "container"; // 현재 container를 누르고 있는 상태

    var selectedIndex = $('.left-container-info').index($(target)); // 현재 왼쪽 컨테이너 박스에서 선택된 순서

    // 선택된 컨테이너만 container-selected class 적용
    $('.left-container-info').each(function (i, e) {
        $(this).find('.left-container-body').removeClass('container-selected');
        if (i == selectedIndex) {
            $(this).find('.left-container-body').addClass('container-selected');
        }
    });

    // file explorer panel 제거
    fileExplorerReset();

    // 새로운 컨테이너에 대한 디렉토리 구조 추가
    var info = getAllSelectedAction();
    var service = new Service();

    $('.breadcrumb > li').each(function (i, e) {
        $(this).remove(); 
    });

    $('.breadcrumb').append(makeNavigatorObject(info.conName, true));

    // 현재 선택된 컨테이너의 하위 디렉토리 구조를 가져온다.
    service.getContainerInfo(info.conName, '', function (data, error) {
        containerLoader.remove();
        var exploerLoader = new commonAjaxLoader($('#displayFileExplorer'));

        if (error) 
            commonErrorHandler(error);
        else {
            var dataObject = sortObjectList(data);
            for (var i=0; i<dataObject.items.length; i++) {
                $('.explorer-panel').first().append(makeObject(0, dataObject.items[i].type, 
                    dataObject.items[i].name, convertBytesToX(dataObject.items[i].size, 1)));
            }
        }
        exploerLoader.remove();
    });
    
    filePanelSetting(_navigatorGlobal.currentDepth);
    $('.display-file-information').hide();
}

var mainPageHandler = function () {
    $('.left-container-info').each(function (i, e) {
        $(this).find('.left-container-body').removeClass('container-selected');
    });
    $('#displayFileExplorer').hide();
    $('#displaySeachResult').hide();
    $('.header-swift-info').show();
    $('.breadcrumb > li').each(function (i, e) {
        $(this).remove(); 
    });
    //$('.header-navigator').hide();
}