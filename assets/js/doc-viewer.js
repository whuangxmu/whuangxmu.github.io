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
                    // add Bootstrap table classes to any rendered tables for bordered/hover/striped styling
                    try {
                        container.find('table').addClass('table table-bordered table-hover table-striped');
                    } catch (e) {
                        console.error('[doc-viewer] add table classes failed', e);
                    }
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

    // Helper: append a "back to list" link to sidebar if present, otherwise to the content container
    function appendListLinkTo($content, pageKind, listHref, listText) {
        try {
            var finalHref = listHref || './';
            var finalText = listText || '返回列表';
            var dedup = pageKind ? ('a.back-to-top[data-kind="' + pageKind + '"]') : ('a.back-to-top[href="' + finalHref + '"]');
            var $sb = $('nav.bs-docs-sidebar');
            waitUntil(function () {
                return $sb && $sb.length > 0 && $sb.children().length >= 2;
            }, function () {
                var $link = $('<a class="back-to-top"' + (pageKind ? (' data-kind="' + pageKind + '"') : '') + ' href="' + finalHref + '">' + finalText + '</a>');
                $sb.append($link);
            });
        } catch
            (e) {
            console.error('[doc-viewer] appendListLinkTo error', e);
        }
    }

    function initDocViewer(options) {
        var opts = options || {};
        var idParam = opts.idParam || 'id';
        // relax default to accept one or more alphanumeric characters
        var idRegex = opts.idRegex || /^[0-9A-Za-z]+$/;
        var dataPath = opts.dataPath || null;
        var mdPathTemplate = opts.mdPathTemplate || './assignment/{id}.md';
        var containerSelector = opts.container || '#assignment-content';
        var headerPSelector = opts.headerPSelector || '.bs-docs-header .container p';
        var show404 = typeof opts.show404 === 'boolean' ? opts.show404 : true;
        // page kind handling: caller should provide explicit list link params
        // opts.pageKind: optional string used only as a data-kind attribute (for dedup)
        // opts.listHref: explicit href for the "back to list" link
        // opts.listText: explicit displayed text for the link
        // optional fallbacks:
        // opts.listCn / opts.listEn can be used to construct a default listText if listText not provided
        var pageKind = opts.pageKind || opts.kind || null;
        var listHref = typeof opts.listHref !== 'undefined' ? opts.listHref : null;
        var listText = typeof opts.listText !== 'undefined' ? opts.listText : null;
        var listCn = typeof opts.listCn !== 'undefined' ? opts.listCn : null;
        var listEn = typeof opts.listEn !== 'undefined' ? opts.listEn : null;
        // if no explicit href/text provided, try to infer reasonable defaults from mdPathTemplate and pageKind
        if (!listHref) {
            var inferredEn = listEn || (pageKind ? String(pageKind) : null);
            listHref = inferredEn ? ('./' + inferredEn + '.html') : null;
        }
        if (!listText) {
            var inferredCn = listCn || (pageKind ? String(pageKind) : null);
            listText = inferredCn ? ('返回' + inferredCn + '列表') : ('返回列表');
        }

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
            // still show a helpful message/modal if requested
            if (show404) defaultShowNotFound('未提供有效的ID号。');
            // ensure user can navigate back to the list even when id is missing/invalid
            appendListLinkTo($container, pageKind, listHref, listText);
            return;
        }

        var mdPath = mdPathTemplate.replace('{id}', id);
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
                    return document.querySelector('nav.bs-docs-sidenav') !== null;
                }, function () {
                    console.debug('[doc-viewer] no header found, creating one');
                    if (!document.querySelector('nav.bs-docs-sidenav')) ensureDocsHeaderExists(title);
                }, 100, 1000, false);
            }

            // load md
            // ensure we run post-render actions after the markdown is loaded
            loadMarkdown(mdPath, $container).then(function () {
                // after rendering, add page-specific link to sidebar (only on this page)
                // ensure sidebar exists then append. Use pageKinds/pageKind mapping to generate
                // simple flow: try sidebar within timeout, prepend to content container if sidebar not present
                var dedupSelector = pageKind ? ('a.back-to-top[data-kind="' + pageKind + '"]') : null;
                if (!dedupSelector && listHref) dedupSelector = 'a.back-to-top[href="' + listHref + '"]';
                var finalHref = listHref || './';
                var finalText = listText || '返回列表';

                // simplified insertion: append to sidebar if exists, otherwise prepend to content container
                (function () {
                    var $sb = $('.bs-docs-sidebar').first();
                    var dedup = dedupSelector;
                    var $link = $('<a class="back-to-top"' + (pageKind ? (' data-kind="' + pageKind + '"') : '') + ' href="' + finalHref + '">' + finalText + '</a>');
                    if ($sb.length) {
                        if (!dedup || $sb.find(dedup).length === 0) $sb.append($link);
                        return;
                    }
                    // fallback: prepend to content container
                    if ($container && $container.length) {
                        if (!dedup || $container.find(dedup).length === 0) $container.prepend($link);
                    }
                })();
                appendListLinkTo($container, pageKind, listHref, listText);
            }).catch(function (err) {
                console.error('loadMarkdown error', err);
                // on md load error, still display not-found and append list link so user can navigate
                if (show404) defaultShowNotFound('未找到对应文件：' + mdPath);
                appendListLinkTo($container, pageKind, listHref, listText);
            });
        });
    }

// export
    window.initDocViewer = initDocViewer;
    try {
        window.docViewerFetchTitle = fetchTitleFromData;
    } catch (e) { /* ignore */
    }

})
(window, jQuery);
