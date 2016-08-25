//////////////////////////////////////////////
// 파일 복사, 다운로드
// create, delete, search 등의 action js
//////////////////////////////////////////////

// 각 action type별 분기 함수
var actionHandler = function (target) {
    switch (target) {
        case 'copy':
            _isCut = false;
            if (_srcOptions.setSrcProp('copy')) {
                _isCopied = true;
                $('#btnPaste').removeClass('disabled');
            }
            break;

        case 'cut':
            _isCopied = false;
            if (_srcOptions.setSrcProp('cut')) {
                _isCut = true;
                $('#btnPaste').removeClass('disabled');
            }
            break;

        case 'paste':
            _destOptions.setDestProp();
            var isClick = (_destOptions.destDirName == '') ? true : false;
            var service = new Service();
            var params = {
                'src_container': _srcOptions.srcConName,
                'src_dir': _srcOptions.srcDirName,
                'src_file': _srcOptions.srcFileName,
                'dest_container': _destOptions.destConName,
                'dest_dir': _destOptions.destDirName,
                'dest_file': _destOptions.destFileName
            };

            if (_isCopied) {
                // object copy
                service.copyObject(params, function (result, error) {
                        if (error)
                            commonErrorHandler(error);
                        else 
                        {
                            containerHandler(_destOptions.destConName, isClick, function () {
                                if (!isClick) {
                                    // var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-selected';
                                    // $(selector).trigger('click');
                                    var selector ;
                                    var lastPanelIndex = $('.panel-border > .col-lg-4th-panel').length - 1;
                                    if (lastPanelIndex == _navigatorGlobal.currentDepth) // 최상위에서 만든 경우
                                    {
                                        selector = '.object-depth-' + (lastPanelIndex - 1) + '.file-selected';
                                    } else // 그 외
                                    {
                                        selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                                    }
                                    $(selector).trigger('click');
                                }
                            });
                            commonHelperMessage('Copy & Paste Success.', false);
                        }
                        
                    });
                
            } else if (_isCut) {
                // object copy & delete
                service.copyObject(params, function (result) {
                        service.deleteObject(_srcOptions.srcConName, _srcOptions.srcDirName, _srcOptions.srcFileName, function (result, error) {
                            _isCut = false;
                            $('#btnPaste').addClass('disabled');

                            if (error)
                                commonErrorHandler(error);
                            else 
                            {
                                containerHandler(_destOptions.destConName, true, function () {
                                    if (!isClick) {
                                        // var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-selected';
                                        // $(selector).trigger('click');
                                        var selector ;
                                        var lastPanelIndex = $('.panel-border > .col-lg-4th-panel').length - 1;
                                        if (lastPanelIndex == _navigatorGlobal.currentDepth) // 최상위에서 만든 경우
                                        {
                                            selector = '.object-depth-' + (lastPanelIndex - 1) + '.file-selected';
                                        } else // 그 외
                                        {
                                            selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                                        }
                                        $(selector).trigger('click');
                                    }
                                });
                                commonHelperMessage('Cut & Paste Success.', false);
                            }
                        });
                    });
            } 
            break;

        case 'download':
            var info = getAllSelectedAction();
            if (info.objectName == '' || info.objectType != 'file') {
                commonHelperMessage('You should select a file.', false);
                return false;
            }
            document.location.href = '/downloadObject?conName=' + info.conName + '&dirName=' + info.dirPath + '&fileName=' + info.objectName;
            break;
    }
}

// Create 버튼을 눌렀을 때 처리해주는 함수
var createHandler = function () {
    var objectName = $('#object-name').val();
    var info = getAllSelectedAction();
    var service = new Service();
    var special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if (objectName == '') {
        commonInsertHtml('.create-warning', 'You should write container/directory name.');
        return;
    }

    if( special_pattern.test(objectName) == true ){
        commonInsertHtml('.create-warning', 'Special letters are forbidden.');
        return;
    }

    if (_addActionType == 'directory' && info.conName == '') {
        commonInsertHtml('.create-warning', 'You should select container on the container list.');
        return;
    }

    switch (_addActionType) {
        case 'container':
            info.conName = objectName;
            objectName = '';
            break;

        case 'directory':
            if (info.dirPath != '')
                objectName = info.dirPath + '/' + objectName;
            break;
    }

    service.createRequest(info.conName, objectName, function (result, error) {
        if (error)
            commonErrorHandler(error);
        else {
            if (objectName && _navigatorGlobal.currentDepth > 0) {
                var isClick = false;
                containerHandler(info.conName, isClick, function () {
                    if (!isClick) {
                        var selector ;
                        var lastPanelIndex = $('.panel-border > .col-lg-4th-panel').length - 1;
                        if (lastPanelIndex == _navigatorGlobal.currentDepth) // 최상위에서 만든 경우
                        {
                            selector = '.object-depth-' + (lastPanelIndex - 1) + '.file-selected';
                        } else // 그 외
                        {
                            selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                        }
                        $(selector).trigger('click');
                    }
                });
            }
            else 
                containerHandler(info.conName, true);
        }
    });

    $('#object-name').val('');
    $('#createObject').modal('toggle');
}

// Delete handler..
var deleteHander = function (done) {
    var info = getAllSelectedAction();
    var service = new Service();

    switch (_deleteActionType) {
        case 'container':
            // 컨테이너의 루트에 해당하는 파일들을 우선 모두 삭제.
            service.deleteObject(info.conName, '', '', function (result, error) {
                fileExplorerReset();
                if (error)
                    commonErrorHandler(error);
                else {
                    setTimeout(function () {
                        service.deleteContainer(info.conName, function (result, error) {
                            if (error)
                                commonErrorHandler(error);

                            done();
                            filePanelSetting(-1);
                            containerHandler();
                            $('#displayFileExplorer').hide();
                            $('.header-swift-info').show();
                            $('.breadcrumb > li').each(function (i, e) {
                                $(this).remove(); 
                            });
                            $('.first-panel').hide();
                        });
                        
                    }, 5000);
                }
            })
            break;

        case 'object':
            switch (info.objectType) {
                case 'file':
                    service.deleteObject(info.conName, info.dirPath, info.objectName, function (result) {
                        var isClick = (!info.dirPath) ? true : false;
                        done();
                        containerHandler(info.conName, isClick, function () {
                            if (!isClick) {
                                var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                                $(selector).trigger('click');
                            }
                        });
                    });
                    break;

                case 'dir':
                    service.deleteObject(info.conName, info.dirPath, "", function (result) {
                        _navigatorGlobal.rearrangePathStack(1);
                        var isClick = (_navigatorGlobal.currentDepth == 0) ? true : false;
                        done();
                        containerHandler(info.conName, isClick, function () {
                            if (!isClick) {
                                var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                                $(selector).trigger('click');
                            }
                        });
                    });
                    break;
            }
            break;
    }
}

// 검색 처리 함수
var searchHandler = function () {
    var search = $('#searchValue').val();
    var info = getAllSelectedAction();
    var service = new Service();

    // 이전 결과화면 지우기
    $('#displaySeachResult > div').each(function (i, e) {
        $(this).children().remove();
        $(this).remove();
    });

    $('.breadcrumb > li').each(function (i, e) {
        $(this).remove(); 
    });

    if (info.conName == "")
    {
        commonHelperMessage('You should select container on the container list.', true);
        return;
    }

    service.searchObject(info.conName, search, function (data, error) {

        if (error) 
            commonErrorHandler(error);
        else
        {
            var result = sortSearchObjectList(data);
            for (var i = 0; i < result.items.length; i++) {
                var name = result.items[i].objectName;
                var path = result.items[i].path;
                var modified = result.items[i].lastModified;
                var size = result.items[i].objectSize;
                var type = result.items[i].objectType;
                $('#displaySeachResult').first().append(makeSearchObject(type, name, path, modified, size));
            }
        }
    });

    $('#displaySeachResult').show();
    $('#displayFileExplorer').hide();
}