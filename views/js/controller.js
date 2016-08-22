

// Action 버튼 클릭
$(document).on('click', '#btnAction', function (e) {
    var target = e.target || e.srcElement || event.srcElement;
    actionHandler($(target).attr('data-cb'));
    e.preventDefault();
});

// 왼쪽 컨테이너 박스 선택
$(document).on('click', '.left-container-list', mainPageHandler);
$(document).on('click', '.left-container-info', function (e) {
    e.stopPropagation();
    leftContainerHandler(this);
});

// 컨테이너 or 디렉토리 생성
$(document).on('click', '#btnObjectCreate', function (e) {
    e.preventDefault();
    createHandler();
});

// 검색 버튼 클릭
$(document).on('click', '#btnFileSearch', searchHandler);

// object panel 항목의 파일 or 디렉토리 선택 이벤트
$(document).on('click', '.explorer-panel > .file-position', filePanelHander);

// upload 버튼
$(document).on('click', '#btnUpload', function (e) {
    e.preventDefault();
    $("input:file").click();
});

// 파일 선택
$(document).on('change', '#uploadFile', uploadHandler);

// create modal
$(document).on('show.bs.modal', '#createObject', function (e) {
    var button = $(e.relatedTarget);
    var action = button.data('whatever');
    if (!action) {
        var tmp = $('#createObject').attr('createAction');
        action = tmp;
    }
    modalHandler(this, action);
});

$(document).on('dragenter dragover drop', function (e) 
{
    e.stopPropagation();
    e.preventDefault();
});

$(document).on('click', '.disabled', function (e) {
    e.preventDefault();
    return false;
});

// file drag and drop upload
$(document).on('drag dragend dragenter dragleave dragover dragstart drop', '.file-explorer', function(e) {
    var files;
    var selectedIndex = $('.file-explorer').index($(this));
    e.preventDefault();

    if( e.type === "drop" && e.originalEvent.dataTransfer ) {
        files = e.originalEvent.dataTransfer.files;
    }
    

    if ( !files || !files.length ) return;
    if ( files.length > 1 ) return;
    
    if ( selectedIndex > _navigatorGlobal.currentDepth )
        return;
    _navigatorGlobal.rearrangePathStack(_navigatorGlobal.currentDepth - selectedIndex);
    dragUploadHandler(files[0]);
})

$(document).ready(function () {
    $('.first-panel').hide();
//     $('.content-scroll').css('height', $(window).height() - 200 );
    
//     $(window).resize(function() {
//         $('.content-main').css('height', $(window).height() - 200 );
//    //});

    containerHandler();
    // 삭제 버튼
    confirmButton($('#btnDelete'), function (done) {
        deleteHander(done);
    });

    // 우클릭 관련 함수
    $(function () {
        $('.explorer-panel > .file-position').contextPopup(
            {
                containerOuter: [
                    {
                        label: 'Create Container', action: function () {
                            $('#createObject').attr('createAction', 'container');
                            $('#createObject').modal('show');
                            $('#createObject').attr('createAction', '');
                        }
                    }
                ],
                containerInner: [
                    {
                        label: 'Delete Container', action: function (e, that) {
                            deleteHander(function () { })
                        }
                    }
                ],
                panelOuter: [
                    {
                        label: 'Create Directory', action: function (e, that) {
                            var currentDepth = $('.explorer-panel').index($(that));
                            _navigatorGlobal.rearrangePathStack(_navigatorGlobal.currentDepth - currentDepth);
                            $('#createObject').attr('createAction', 'directory');
                            $('#createObject').modal('show');
                            $('#createObject').attr('createAction', '');
                        }
                    },
                    {
                        label: 'Upload', action: function (e, that) {
                            var currentDepth = $('.explorer-panel').index($(that));
                            _navigatorGlobal.rearrangePathStack(_navigatorGlobal.currentDepth - currentDepth);
                            $('#btnUpload').trigger('click');
                        }
                    },
                    {
                        label: 'Paste', action: function () {
                            actionHandler('paste');
                        }
                    }
                ],
                panelInner: [
                    {
                        label: 'Copy', action: function (e, that) {
                            actionHandler('copy');
                        }
                    },
                    {
                        label: 'Cut', action: function (e, that) {
                            actionHandler('cut');
                        }
                    },
                    {
                        label: 'Paste', action: function (e, that) {
                            actionHandler('paste');
                        }
                    },
                    {
                        label: 'Delete Object', action: function (e, that) {
                            deleteHander(function () { });
                        }
                    },
                    {
                        label: 'Download', action: function (e, that) {
                            actionHandler('download');
                        }
                    }
                ]
            });
    });
});