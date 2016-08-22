//////////////////////////////////////////////
// 파일 탐색기 js
//////////////////////////////////////////////

// 파일 탐색기 처리 함수
var filePanelHander = function () {
    var loader = new commonAjaxLoader($('#displayFileExplorer'));
    _deleteActionType = "object"; // 현재 object를 누르고 있는 상태

    // 부모 패널의 인덱스 번호
    var parentDepth = $('.explorer-panel').index($(this).parent());
    // 부모 패널에 있는 object들의 css class name (ex.. depth0: object-depth-0..)
    var childClassName = '.object-depth-' + parentDepth;
    // 파일 탐색기 항목에 클릭된 인덱스 번호
    var selectedIndex = $(childClassName).index($(this));

    // 현재 depth 다음 패널의 object 항목들을 제거한다.
    $('.explorer-panel').eq(parentDepth + 1).children().remove();
    if (parentDepth <= 2) {
        $('.explorer-panel').eq(2).parent().parent().parent().addClass('last-panel');
    }

    for (var i=0; i<parentDepth; i++)
    {
        var className = '.object-depth-'+i+'.file-selected';
        $(className).removeClass('file-selected').addClass('file-old-selected');
    }

    // 현재 선택된 object 항목들에 file-selcted class 적용
    $(childClassName).each(function (i, e) {
        var selectedObjectType = $(this).find('div').eq(0).attr('object-type');

        $(this).removeClass('file-selected').removeClass('file-old-selected');
        if (selectedObjectType == 'dir')
            $(this).find('.object-file-type').removeClass('glyphicon-folder-open').addClass('glyphicon-folder-close');
        
        if (i == selectedIndex) {
            $(this).addClass('file-selected');
            var objectName = $(this).find('.object-file-name').text();

            if (selectedObjectType == 'dir') // 파일타입이 디렉토리 인경우에만 path stack을 push한다.
            {
                $(this).find('.object-file-type').removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');
                _navigatorGlobal.handlePathStack(parentDepth, objectName);
            }
                
        }
    });

    rearrangePanel(parentDepth);

    var info = getAllSelectedAction();
    var service = new Service();

    switch (info.objectType) {
        case 'file':
            // 디렉터리 누른 후 같은 depth에서 파일을 다시 누른 경우 -> depth를 1 줄여줘야 한다.
            if (parentDepth < _navigatorGlobal.currentDepth) {
                _navigatorGlobal.rearrangePathStack(_navigatorGlobal.currentDepth - parentDepth);
                info = getAllSelectedAction();
            }

            $('.breadcrumb > li').each(function (i, e) {
                $(this).remove(); 
            });
            
            if (parentDepth == 0)
                $('.breadcrumb').append(makeNavigatorObject(info.conName, true));
            else
                $('.breadcrumb').append(makeNavigatorObject(info.conName, false, -1));

            for (var i=0; i<_navigatorGlobal.pathStack.length; i++)
            {
                var last = false;
                if (i == _navigatorGlobal.pathStack.length - 1)
                    last = true;

                $('.breadcrumb').append(makeNavigatorObject(_navigatorGlobal.pathStack[i].replace('/', ''), last, i));
            }

            service.getObjectInfo(info.conName, info.dirPath, info.objectName, function (data, error) {
                if (error) 
                    commonErrorHandler(error);
                else {
                    // 파일 정보 표시
                    commonInsertHtml('#infoFileName', info.objectName);
                    commonInsertHtml('#infoFilePath', info.dirPath + "/" + info.objectName);
                    commonInsertHtml('#infoFileType', data["content-type"]);
                    commonInsertHtml('#infoFileSize', convertBytesToX(data["content-length"], 1));
                    commonInsertHtml('#infoFileModified', data["last-modified"]);
                    
                    // var slashIndex = data["content-type"].lastIndexOf("/");
                    // var fileOrgType = data["content-type"];
                    // var fileType = data["content-type"].substring(slashIndex+1).toLowerCase();

                    // if (fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "jpeg")
                    // {
                    //     service.getImageObjectInfo(info.conName, info.dirPath, info.objectName, function (data, error) {
                    //         if (error) 
                    //             commonErrorHandler(error);
                    //         else {
                    //             //$("#previewImageObject").attr('src', 'data:image/png;base64,' + base64Encode(data));
                    //             var rawRes = data;
                    //             //var b64Res = btoa(unescape(encodeURIComponent(rawRes)))
                    //             var b64Res = btoa(rawRes);//window.btoa(unescape(encodeURIComponent(rawRes)));
                    //             $("#previewImageObject").attr('src', 'data:image/jpg;base64,' + b64Res);
                    //             //alert(base64Encode(rawRes));
                    //             //console.log(base64Encode(rawRes))
                    //             //$("#previewImageObject").attr('src', 'data:image/png;base64,' + base64Encode(data));
                    //             /*
                    //             var rawRes = data;
                    //             var b64Res = window.btoa(unescape(encodeURIComponent(rawRes)));
                    //             //alert(b64Res);
                    //             //alert('data:'+fileOrgType+';base64,'+b64Res);
                    //             //$('#previewImageObject').attr('src', 'data:image/svg+xml;base64,'+b64Res);
                    //             var outputImg = document.createElement('img');
                    //             outputImg.src = 'data:image/png;base64,'+atob(b64Res);
                    //             document.body.appendChild(outputImg);
                    //             */
                    //         }
                    //     });
                    // }

                    $('.display-file-information').show();
                    //$('#fileDetailInfo').show();
                }
                
                loader.remove();
            });
            break;

        case 'dir':
            //$('#fileDetailInfo').hide();
            $('.display-file-information').hide();

            var source   = $("#make-file-panel").html();
            var template = Handlebars.compile(source);

            if (parentDepth == 0) {
                var data = {last: ''};
                $('.panel-border').append(template(data));
            } else if (parentDepth == 1) {
                var data = {last: 'last-panel'};
                $('.panel-border').append(template(data));
            } else {
                var lastPanel = $('.last-panel');
                lastPanel.removeAttr('tabindex');
                lastPanel.removeClass('last-panel');

                var data = {last: 'last-panel'};
                $('.panel-border').append(template(data));
                // 마지막 focusing
                var newLastPanel = $('.last-panel');
                newLastPanel.attr("tabindex", -1).focus();
            }

             $('.breadcrumb > li').each(function (i, e) {
                $(this).remove(); 
            });

            $('.breadcrumb').append(makeNavigatorObject(info.conName, false, -1));

            for (var i=0; i<_navigatorGlobal.pathStack.length; i++)
            {
                var last = false;
                if (i == _navigatorGlobal.pathStack.length - 1)
                    last = true;

                $('.breadcrumb').append(makeNavigatorObject(_navigatorGlobal.pathStack[i].replace('/', ''), last, i));
            }

            // 다음 패널에 파일 목록 추가
            service.getContainerInfo(info.conName, info.dirPath, function (data, error) {
                if (error) 
                    commonErrorHandler(error);
                else  {
                    var dataObject = sortObjectList(data);
                    for (var i=0; i<dataObject.items.length; i++) {
                        $('.explorer-panel').eq(parentDepth + 1).append(makeObject(parentDepth + 1, dataObject.items[i].type, 
                            dataObject.items[i].name, convertBytesToX(dataObject.items[i].size, 1)));
                    }
                }
                loader.remove();
            });
            break;
    }

    filePanelSetting(_navigatorGlobal.currentDepth);
    rearrangePanel(_navigatorGlobal.currentDepth-1);
}
