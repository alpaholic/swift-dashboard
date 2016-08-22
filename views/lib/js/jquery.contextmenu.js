/**
 * jQuery plugin for Pretty looking right click context menu.
 *
 * Requires popup.js and popup.css to be included in your page. And jQuery, obviously.
 *
 * Usage:
 *
 *   $('.something').contextPopup({
 *     title: 'Some title',
 *     items: [
 *       {label:'My Item', icon:'/some/icon1.png', action:function() { alert('hi'); }},
 *       {label:'Item #2', icon:'/some/icon2.png', action:function() { alert('yo'); }},
 *       null, // divider
 *       {label:'Blahhhh', icon:'/some/icon3.png', action:function() { alert('bye'); }, isEnabled: function() { return false; }},
 *     ]
 *   });
 *
 * Icon needs to be 16x16. I recommend the Fugue icon set from: http://p.yusukekamiyamane.com/ 
 *
 * - Joe Walnes, 2011 http://joewalnes.com/
 *   https://github.com/joewalnes/jquery-simple-context-menu
 *
 * MIT License: https://github.com/joewalnes/jquery-simple-context-menu/blob/master/LICENSE.txt
 */
jQuery.fn.contextPopup = function (menuData) {
  // Define default settings
  var settings = {
    contextMenuClass: 'contextMenuPlugin',
    linkClickerClass: 'contextMenuLink',
    gutterLineClass: 'gutterLine',
    headerClass: 'header',
    seperatorClass: 'divider',
    title: '',
    containerOuter: [],
    containerInner: [],
    panelOuter: [],
    panelInner: []
  };

  // merge them
  $.extend(settings, menuData);

  function createContainerOuterMenu(e, that) {
    var menu = $('<ul class="' + settings.contextMenuClass + '"></ul>')
      .appendTo(document.body);
    if (settings.title) {
      $('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
    }
    settings.containerOuter.forEach(function (item) {
      if (item) {
        var rowCode = '<li><a href="#" class="' + settings.linkClickerClass + '"><span class="itemTitle"></span></a></li>';
        // if(item.icon)
        //   rowCode += '<img>';
        // rowCode +=  '<span></span></a></li>';
        var row = $(rowCode).appendTo(menu);
        if (item.icon) {
          var icon = $('<img>');
          icon.attr('src', item.icon);
          icon.insertBefore(row.find('.itemTitle'));
        }
        row.find('.itemTitle').text(item.label);
        row.find('.' + settings.linkClickerClass).click(function () { item.action(e, that); });
      } else {
        $('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
      }
    });
    menu.find('.' + settings.headerClass).text(settings.title);
    return menu;
  }

  function createContainerInnerMenu(e, that) {
    var menu = $('<ul class="' + settings.contextMenuClass + '"></ul>')
      .appendTo(document.body);
    if (settings.title) {
      $('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
    }
    settings.containerInner.forEach(function (item) {
      if (item) {
        var rowCode = '<li><a href="#" class="' + settings.linkClickerClass + '"><span class="itemTitle"></span></a></li>';
        // if(item.icon)
        //   rowCode += '<img>';
        // rowCode +=  '<span></span></a></li>';
        var row = $(rowCode).appendTo(menu);
        if (item.icon) {
          var icon = $('<img>');
          icon.attr('src', item.icon);
          icon.insertBefore(row.find('.itemTitle'));
        }
        row.find('.itemTitle').text(item.label);
        row.find('.' + settings.linkClickerClass).click(function () { item.action(e, that); });
      } else {
        $('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
      }
    });
    menu.find('.' + settings.headerClass).text(settings.title);
    return menu;
  }

  function createPanelOuterMenu(e, that) {
    var menu = $('<ul class="' + settings.contextMenuClass + '"></ul>').appendTo(document.body);
    if (settings.title) {
      $('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
    }
    settings.panelOuter.forEach(function (item) {
      if (item) {
        var rowCode = '<li><a href="#" class="' + settings.linkClickerClass + '"><span class="itemTitle"></span></a></li>';
        // if(item.icon)
        //   rowCode += '<img>';
        // rowCode +=  '<span></span></a></li>';
        var row = $(rowCode).appendTo(menu);
        if (item.icon) {
          var icon = $('<img>');
          icon.attr('src', item.icon);
          icon.insertBefore(row.find('.itemTitle'));
        }
        if (item.label == 'Paste' && !_isCut && !_isCopied) {
          row.addClass('disabled');
        }
        row.find('.itemTitle').text(item.label);
        row.find('.' + settings.linkClickerClass).click(function () { item.action(e, that); });
      } else {
        $('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
      }
    });
    menu.find('.' + settings.headerClass).text(settings.title);
    return menu;
  }

  // Build popup menu HTML
  function createPanelInnerMenu(e, that) {
    var menu = $('<ul class="' + settings.contextMenuClass + '"></ul>').appendTo(document.body);
    if (settings.title) {
      $('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
    }
    settings.panelInner.forEach(function (item) {
      if (item) {
        var info = getAllSelectedAction();
        if (info.objectType == 'dir' && (item.label == 'Download' || item.label == 'Copy' || item.label == 'Cut')) 
          return;

        var rowCode = '<li class=' + item.labevl + '><a href="#" class="' + settings.linkClickerClass + '"><span class="itemTitle"></span></a></li>';
        // if(item.icon)
        //   rowCode += '<img>';
        // rowCode +=  '<span></span></a></li>';
        var row = $(rowCode).appendTo(menu);
        if (item.icon) {
          var icon = $('<img>');
          icon.attr('src', item.icon);
          icon.insertBefore(row.find('.itemTitle'));
        }
        if (item.label == 'Paste' && !_isCut && !_isCopied) {
          row.addClass('disabled');
        }

        row.find('.itemTitle').text(item.label);
        row.find('.' + settings.linkClickerClass).click(function () { item.action(e, that); });
      } else {
        $('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
      }
    });
    menu.find('.' + settings.headerClass).text(settings.title);
    return menu;
  }

  // On contextmenu event (right click)
  $(document).on('contextmenu', '.explorer-panel > .file-position', function (e) {
    if (!($(this).hasClass('file-selected')))
      $(this).trigger('click');
    var menu = createPanelInnerMenu(e, this).show();

    var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
      top = e.pageY;
    if (top + menu.height() >= $(window).height()) {
      top -= menu.height();
    }
    if (left + menu.width() >= $(window).width()) {
      left -= menu.width();
    }

    // Create and show menu
    menu.css({ zIndex: 1000001, left: left, top: top })
      .on('contextmenu', function () { return false; });

    // Cover rest of page with invisible div that when clicked will cancel the popup.
    var bg = $('<div></div>')
      .css({ left: 0, top: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1000000 })
      .appendTo(document.body)
      .on('contextmenu click', function () {
        // If click or right click anywhere else on page: remove clean up.
        bg.remove();
        menu.remove();
        return false;
      });


    // When clicking on a link in menu: clean up (in addition to handlers on link already)
    menu.find('a').click(function () {
      bg.remove();
      menu.remove();
    });

    // Cancel event, so real browser popup doesn't appear.
    return false;
  });

  $(document).on('contextmenu', '.explorer-panel', function (e) {
    var menu = createPanelOuterMenu(e, this).show();

    var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
      top = e.pageY;
    if (top + menu.height() >= $(window).height()) {
      top -= menu.height();
    }
    if (left + menu.width() >= $(window).width()) {
      left -= menu.width();
    }

    // Create and show menu
    menu.css({ zIndex: 1000001, left: left, top: top })
      .on('contextmenu', function () { return false; });

    // Cover rest of page with invisible div that when clicked will cancel the popup.
    var bg = $('<div></div>')
      .css({ left: 0, top: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1000000 })
      .appendTo(document.body)
      .on('contextmenu click', function () {
        // If click or right click anywhere else on page: remove clean up.
        bg.remove();
        menu.remove();
        return false;
      });


    // When clicking on a link in menu: clean up (in addition to handlers on link already)
    menu.find('a').click(function () {
      bg.remove();
      menu.remove();
    });

    // Cancel event, so real browser popup doesn't appear.
    return false;
  });

  $(document).on('contextmenu', '.left-container-body', function (e) {
    if (!($(this).hasClass('container-selected')))
      $(this).trigger('click');
    var menu = createContainerInnerMenu(e, this).show();

    var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
      top = e.pageY;
    if (top + menu.height() >= $(window).height()) {
      top -= menu.height();
    }
    if (left + menu.width() >= $(window).width()) {
      left -= menu.width();
    }

    // Create and show menu
    menu.css({ zIndex: 1000001, left: left, top: top })
      .on('contextmenu', function () { return false; });

    // Cover rest of page with invisible div that when clicked will cancel the popup.
    var bg = $('<div></div>')
      .css({ left: 0, top: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1000000 })
      .appendTo(document.body)
      .on('contextmenu click', function () {
        // If click or right click anywhere else on page: remove clean up.
        bg.remove();
        menu.remove();
        return false;
      });


    // When clicking on a link in menu: clean up (in addition to handlers on link already)
    menu.find('a').click(function () {
      bg.remove();
      menu.remove();
    });

    // Cancel event, so real browser popup doesn't appear.
    return false;
  });

  $(document).on('contextmenu', '.left-container-list', function (e) {
    var menu = createContainerOuterMenu(e, this).show();

    var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
      top = e.pageY;
    if (top + menu.height() >= $(window).height()) {
      top -= menu.height();
    }
    if (left + menu.width() >= $(window).width()) {
      left -= menu.width();
    }

    // Create and show menu
    menu.css({ zIndex: 1000001, left: left, top: top })
      .on('contextmenu', function () { return false; });

    // Cover rest of page with invisible div that when clicked will cancel the popup.
    var bg = $('<div></div>')
      .css({ left: 0, top: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1000000 })
      .appendTo(document.body)
      .on('contextmenu click', function () {
        // If click or right click anywhere else on page: remove clean up.
        bg.remove();
        menu.remove();
        return false;
      });


    // When clicking on a link in menu: clean up (in addition to handlers on link already)
    menu.find('a').click(function () {
      bg.remove();
      menu.remove();
    });

    // Cancel event, so real browser popup doesn't appear.
    return false;
  });

  return this;
};

