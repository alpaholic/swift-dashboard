//////////////////////////////////////////////
// 파일 업로드 js
//////////////////////////////////////////////

// file upload 처리 함수
var uploadHandler = function () {
    var info = getAllSelectedAction();
    if (info.conName == '') {
        commonHelperMessage('You should select container on the container list.', true);
        return;
    }

    var form = $('form')[0];
    var formData = new FormData(form);
    var fileName = document.getElementById("uploadFile").files[0].name;
    
    if (fileName == '')
        return false;

    $('.progress-bar').css('width', '0%');
    $('.progress-bar').text('0%');

    var socket = io.connect();
    var socket_key;
    socket.emit('hsFromClient');
    socket.on('hsToClient', function (data) {
        socket_key = data.key;
    })
    socket.on('uploadProgress', function (data) {
        $('.progress.custom').show();
        if (data.percentage > 100) 
            data.percentage = 100;
        $('.progress-bar').css('width', parseInt(data.percentage)+'%');
        $('.progress-bar').text(parseInt(data.percentage)+'%');
    })

    setTimeout(function() {
        $.ajax({
            url: '/uploadObject?conName=' + info.conName + '&dirName=' + info.dirPath + '&socketKey=' + encodeURIComponent(socket_key),
            processData: false,
            contentType: false,
            data: formData,
            type: 'POST',
            success: function (result) {
                $('.progress.custom').hide();
                commonHelperMessage(fileName + ' is uploaded successfully', false);
                socket.disconnect();
                var isClick = (!info.dirPath) ? true : false;
                containerHandler(info.conName, isClick, function () {
                    if (!isClick) {
                        // var selector ;
                        // if (info.objectType == 'dir') {
                        //     selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-selected';
                        // } else {
                        //     var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                        // }
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
            }
        });
    }, 2000);
    

    $('#uploadFile').val('');
}

// drag and drop file downloader
var dragUploadHandler = function (file) {
    var info = getAllSelectedAction();
    if (info.conName == '') {
        commonHelperMessage('You should select container on the container list.', true);
        return;
    }

    var formData = new FormData($("form")[0]);
    var fileName = file.name;
    formData.append('file', file);

    $('.progress-bar').css('width', '0%');
    $('.progress-bar').text('0%');

    var socket = io.connect();
    var socket_key;
    socket.emit('hsFromClient');
    socket.on('hsToClient', function (data) {
        socket_key = data.key;
    })
    socket.on('uploadProgress', function (data) {
        $('.progress.custom').show();
        if (data.percentage > 100) data.percentage = 100;
        $('.progress-bar').css('width', parseInt(data.percentage)+'%');
        $('.progress-bar').text(parseInt(data.percentage)+'%');
    })

    setTimeout(function() {
        $.ajax({
            url: '/uploadObject?conName=' + info.conName + '&dirName=' + info.dirPath + '&socketKey=' + encodeURIComponent(socket_key),
            processData: false,
            contentType: false,
            data: formData,
            type: 'POST',
            success: function (result) {
                $('.progress.custom').hide();
                commonHelperMessage(fileName + ' is uploaded successfully', false);
                socket.disconnect();
                var isClick = (!info.dirPath) ? true : false;
                containerHandler(info.conName, isClick, function () {
                    if (!isClick) {
                        // var selector ;
                        // if (info.objectType == 'dir') {
                        //     selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-selected';
                        // } else {
                        //     var selector = '.object-depth-' + (_navigatorGlobal.currentDepth - 1) + '.file-old-selected';
                        // }
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
            }
        });
    }, 2000);
}