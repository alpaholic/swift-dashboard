//////////////////////////////////////////////
// 공통 함수
//////////////////////////////////////////////

// 단위를 변환하는 함수
// type value => 0: 큰 화면용, 1: 작은 화면용
var convertBytesToX = function (data, type) {
    var bytes = parseInt(data);
    var s = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));

    if (e == "-Infinity") {
        switch (type) {
            case 0:
                return "0 " + s[0];
            case 1:
                return "-";
        }
    } else return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
}

// 공통 html text 추가 함수
var commonInsertHtml = function (selector, value) {
    $(selector).html(value);
    $(selector).show();
}

// 공통 helper 메시지 함수
var commonHelperMessage = function (value, isError) {
    var id = '#helperMessage';
    $(id).html(value);
    $(id).removeClass('bg-danger').removeClass('bg-success');

    if (isError) {
        $(id).addClass('bg-danger');
    } else {
        $(id).addClass('bg-success');
    }
    $(id).show();
    setTimeout(function() {
            $(id).fadeOut();
    }, 3000);
}

var confirmButton = function (selector, callback) {
    $(selector).css('transition', 'opacity 0.2s');
    $(selector).on('click', function () {
        var that = this;

        this.timer = null;

        if (this.isConfirm) {
            this.isConfirm = false;
            if (callback) {
                $('<span class="glyphicon glyphicon-refresh small-progress" style="display: inline-block;"></span>').insertBefore(this);
                $(this).hide();
                callback.call(this, function () {
                    that.isConfirm = false;
                    $(that).text(that.origin).val(that.origin);

                    $(that).prev().remove();
                    $(that).show();
                });
            }
        }
        else {
            this.origin = $(this).text() ? $(this).text() : $(this).val();
            $(this).css('opacity', '0');
            setTimeout(function () {
                that.isConfirm = true;
                $(that).css('opacity', '1').text('Confirm');

                setTimeout(function () {
                    that.isConfirm = false;
                    $(that).text(that.origin).val(that.origin);
                }, 3000);
            }, 300);
        }
    });
};

var commonAjaxLoader = function (el, options) {
    // Becomes this.options
    var defaults = {
        bgColor: '#fff',
        duration: 500,
        opacity: 1,
        classOveride: false
    }
    this.options = jQuery.extend(defaults, options);
    this.container = $(el);

    this.init = function () {
        var container = this.container;
        // Delete any other loaders
        this.remove();
        // Create the overlay 
        var overlay = $('<div></div>').css({
            'background-color': this.options.bgColor,
            'opacity': this.options.opacity,
            'width': container.width(),
            'height': container.height(),
            'position': 'absolute',
            'top': '0px',
            'left': '0px',
            'z-index': 99999
        }).addClass('ajax_overlay');
        // add an overiding class name to set new loader style 
        if (this.options.classOveride) {
            overlay.addClass(this.options.classOveride);
        }
        // insert overlay and loader into DOM 
        container.append(
            overlay.append(
                $('<div></div>').addClass('ajax_loader')
            ).fadeIn(this.options.duration)
        );
    };

    this.remove = function () {
        var overlay = this.container.children(".ajax_overlay");
        if (overlay.length) {
            overlay.fadeOut(this.options.classOveride, function () {
                overlay.remove();
            });
        }
    }

    this.init();
}

var commonErrorHandler = function (error) {
    commonHelperMessage(error.code + ': ' + error.message, true);
}

/**
 * 공통 ajax request
 */
var commonAjaxRequest = function (options, callback) {
    $.ajax({
        type: options.type,
        url: options.url,
        success: function (result) {
            callback(result, null);
        },
        error: function (xhr, status, error) {
            var message;
            if (xhr.responseText)
                message = xhr.responseText;
            
            switch (xhr.status)
            {
                case 404:
                    message = "the container does not exist.";
                    break;
                case 408:
                    message = "request times out error.";
                    break;
                case 409:
                    message = "Conflict error.";
                    break;
                case 411:
                    message = "a missing Transfer-Encoding or Content-Length request header.";
                    break;
                case 416:
                    message = "Range Not Satisfiable error.";
                    break;
                case 422:
                    message = "Unprocessable Entity error.";
                    break;
            }

            callback(null, {code: xhr.status, message: message});
        }
    });
}