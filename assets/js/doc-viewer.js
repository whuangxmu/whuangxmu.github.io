(function (window, $) {
    'use strict';

    function getQueryParam(name) {
        var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
    }

    function defaultShowNotFound(msg) {
        if (typeof window.showNotFound === 'function') {
            window.showNotFound(msg);
            return;
        }
        var $modal = $('#not-found-modal');
        if ($modal && $modal.length && $.fn.modal) {
            $('#not-found-message').text(msg);
            $modal.modal('show');
            return;
        }
        alert(msg);
    }

    // internal waitUntil that respects global mode_async_json by default
    // signature: dv_waitUntil(condition, callback, interval, timeout, respectAsync)
    // respectAsync: when true (default) the callback runs only if !window.mode_async_json as well
    function dv_waitUntil(condition, callback, interval, timeout, respectAsync) {
        interval = interval || 100;
        timeout = timeout || 5000;
        if (typeof respectAsync === 'undefined') respectAsync = true;
        var start = Date.now();
        var timer = null;

        function tick() {
            try {
                var cond;
                try {
                    cond = !!condition();
                } catch (e) {
                    cond = false;
                }
                var asyncOk = true;
                if (respectAsync) asyncOk = !window.mode_async_json;
                if (cond && asyncOk) {
                    callback();
                } else if (Date.now() - start < timeout) {
                    timer = setTimeout(tick, interval);
                }
            } catch (e) {
                console.error('dv_waitUntil error', e);
            }
        }

        tick();
        return function cancel() {
            if (timer) clearTimeout(timer);
        };
    }

    // 导出到全局，供页面脚本等待 DOM 或其他全局条件
    try {
        window.dv_waitUntil = dv_waitUntil;
    } catch (e) { /* ignore in restricted env */
    }

    function fetchTitleFromData(dataPath, id) {
        return new Promise(function (resolve) {
            if (!dataPath) return resolve(null);
            $.getJSON(dataPath).done(function (json) {
                try {
                    var arr = null;
                    if (Array.isArray(json)) arr = json;
                    else if (json && Array.isArray(json.items)) arr = json.items;
                    if (arr) {
                        for (var i = 0; i < arr.length; i++) {
                            var it = arr[i];
                            var candidate = null;
                            if (it == null) continue;
                            if (typeof it.lesson !== 'undefined') candidate = String(it.lesson);
                            else if (typeof it.id !== 'undefined') candidate = String(it.id);
                            if (candidate === String(id)) {
                                if (it.title) {
                                    try {
                                        console.debug('[doc-viewer] found title for id', id, it.title);
                                    } catch (e) {
                                    }
                                    return resolve(it.title);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('parse data.json failed', e);
                }
                try {
                    console.debug('[doc-viewer] no title found for id', id);
                } catch (e) {
                }
                resolve(null);
            }).fail(function () {
                try {
                    console.warn('[doc-viewer] failed to fetch', dataPath);
                } catch (e) {
                }
                resolve(null);
            });
        });
    }

    // 同步导出 fetchTitleFromData 供控制台调试使用
    try {
        window.docViewerFetchTitle = fetchTitleFromData;
    } catch (e) { /* ignore */
    }

    function wrapSections(container) {
        // unwrap previous to avoid double wrap
        container.find('.bs-docs-section').each(function () {
            $(this).replaceWith($(this).contents());
        });
        var children = container.children().toArray();
        for (var i = 0; i < children.length; i++) {
            var $child = $(children[i]);
            if (!$child.is('h1') || $child.hasClass('big-title')) continue;
            var group = [children[i]];
            var j = i + 1;
            while (j < children.length && !$(children[j]).is('h1')) {
                group.push(children[j]);
                j++;
            }
            $(group).wrapAll('<div class="bs-docs-section"></div>');
            i = j - 1;
        }
    }

    function assignHeadingIds(container) {
        var $headings = container.find('h1').not('.big-title').addClass('page-header');
        $headings.each(function (index) {
            var num = String(index + 1).padStart(2, '0');
            $(this).attr('id', 'id' + num);
        });
    }

    function loadMarkdown(mdPath, container /* opts unused for now */) {
        return new Promise(function (resolve, reject) {
            if (!mdPath) return reject(new Error('no mdPath'));
            window.mode_async_json = true;
            $.get(mdPath).done(function (content) {
                if (window.marked) {
                    // preserve big-title if present
                    container.children().not('h1.big-title').remove();
                    container.append(window.marked.parse(content));
                    assignHeadingIds(container);
                    wrapSections(container);
                    load_mathjax();
                } else {
                    container.text(content);
                }
                window.mode_async_json = false;
                resolve();
            }).fail(function () {
                window.mode_async_json = false;
                reject(new Error('md_not_found'));
            });
        });
    }

    function trySetHeaderText(selector, id, text) {
        try {
            text = id + ': ' + text;
            var $el = $(selector);
            if ($el && $el.length) {
                $el.text(text);
                try {
                    console.debug('[doc-viewer] set header', selector, text);
                } catch (e) {
                }
                return true;
            }
        } catch (e) { /* ignore */
        }
        try {
            console.debug('[doc-viewer] header not found for selector', selector);
        } catch (e) {
        }
        return false;
    }

    function ensureDocsHeaderExists(title) {
        try {
            if (document.querySelector('.bs-docs-header')) return;
            var dh = document.createElement('div');
            dh.className = 'bs-docs-header';
            dh.setAttribute('id', 'content');
            dh.setAttribute('tabindex', '-1');
            var inner = document.createElement('div');
            inner.className = 'container';
            var h1 = document.createElement('h1');
            h1.textContent = title || '';
            var p = document.createElement('p');
            p.textContent = title || '';
            inner.appendChild(h1);
            inner.appendChild(p);
            dh.appendChild(inner);
            // insert after header if present, else at top of body
            var header = document.querySelector('header');
            if (header && header.parentNode) header.parentNode.insertBefore(dh, header.nextSibling);
            else document.body.insertBefore(dh, document.body.firstChild);
            return true;
        } catch (e) {
            return false;
        }
    }

    function initDocViewer(options) {
        var opts = options || {};
        var idParam = opts.idParam || 'id';
        var idRegex = opts.idRegex || /^[0-9A-Za-z]{2}$/;
        var dataPath = opts.dataPath || null;
        var mdPathTemplate = opts.mdPathTemplate || './assignment/{id}.md';
        var containerSelector = opts.container || '#assignment-content';
        var headerPSelector = opts.headerPSelector || '.bs-docs-header .container p';
        var headerH1Selector = opts.headerH1Selector || '.bs-docs-header .container h1';
        var show404 = typeof opts.show404 === 'boolean' ? opts.show404 : true;

        var id = getQueryParam(idParam);
        try {
            console.debug('[doc-viewer] init', {id: id, dataPath: dataPath});
        } catch (e) {
        }
        var $container = $(containerSelector);
        if (!$container || $container.length === 0) {
            console.warn('doc-viewer: container not found', containerSelector);
            return;
        }

        if (!id || !idRegex.test(id)) {
            if (show404) defaultShowNotFound('未提供有效的ID号。');
            return;
        }

        var mdPath = mdPathTemplate.replace('{id}', id);
        try {
            console.debug('[doc-viewer] mdPath', mdPath);
        } catch (e) {
        }
        var fetchedTitle = null;

        // fetch title from data.json then set header p/h1, document.title, then load md
        fetchTitleFromData(dataPath, id).then(function (title) {
            fetchedTitle = title;
            if (title) {
                // wait until header exists (do not wait for mode_async_json to be false)
                dv_waitUntil(function () {
                    return $(headerPSelector).length > 0;
                }, function () {
                    trySetHeaderText(headerPSelector, id, title);
                }, 100, 5000, false);

                // also set document.title to be helpful
                try {
                    document.title = title + ' - ' + (typeof myoj2_app_name !== 'undefined' ? myoj2_app_name : '');
                } catch (e) {
                }

                // if header still doesn't exist after short delay, create a simple one so the title is visible
                dv_waitUntil(function () {
                    return document.querySelector('.bs-docs-header') !== null;
                }, function () {
                }, 100, 1000, false);
                setTimeout(function () {
                    if (!document.querySelector('.bs-docs-header')) ensureDocsHeaderExists(title);
                }, 1200);
            }

            // load md
            loadMarkdown(mdPath, $container).catch(function (err) {
                console.error('loadMarkdown error', err);
                if (show404) defaultShowNotFound('未找到对应文件：' + mdPath);
            });
        });
    }

    // export
    window.initDocViewer = initDocViewer;
    try {
        window.docViewerFetchTitle = fetchTitleFromData;
    } catch (e) { /* ignore */
    }

})(window, jQuery);

