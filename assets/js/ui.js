function waitUntil(predicate, onReady, intervalMs, timeoutMs) {
    var startedAt = Date.now();
    var interval = setInterval(function () {
        if (predicate()) {
            console.log("waitUntil: condition met after " + (Date.now() - startedAt) + "ms");
            clearInterval(interval);
            onReady();
            return;
        }
        if (typeof timeoutMs === "number" && Date.now() - startedAt >= timeoutMs) {
            clearInterval(interval);
        }
    }, intervalMs || 50);

    if (predicate()) {
        clearInterval(interval);
        onReady();
    }
}

function loadScript(url, callback = null, id = null) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    if (id)
        script.id = id;

    if (script.readyState) {  // For old versions of IE
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                if (callback)
                    callback();
            }
        };
    } else {  // Other browsers
        script.onload = function () {
            if (callback)
                callback();
        };
    }

    script.src = url;
    document.body.appendChild(script);
    // document.getElementsByTagName("head")[0].appendChild(script);
    // console.log("Script loaded: " + url);
}

function loadCss(url) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;

    // 直接将<link>元素添加到<head>中
    document.head.appendChild(link);
}

function is_lower_than_ie9() {
    var userAgent = window.navigator.userAgent;
    var msie = userAgent.indexOf('MSIE ');
    var trident = !!userAgent.match(/Trident\/7\.0/); // IE11 has different userAgent string
    var rv = userAgent.indexOf('rv:');

    if (msie > -1 || (trident && rv > -1 && parseInt(userAgent.substring(rv + 3, userAgent.indexOf('.', rv)), 10) <= 11)) {
        // If IE (any version) is detected, check the version number
        var ieVersion = parseInt(userAgent.substring(msie + 5, userAgent.indexOf('.', msie)), 10);
        return ieVersion <= 8;
    }
    return false;
}

function load_scripts_and_csses() {
    loadCss("/static/bootstrap/3.4.1/css/bootstrap.css");
    loadCss("/static/animate/animate.css");
    loadCss("/assets/css/docs.min.css");
    loadCss("/assets/css/docs.navy.min.css");
    loadCss("/assets/css/patch.css");
    loadCss("https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.2/css/all.css");
    if (is_lower_than_ie9()) {
        loadScript("/static/jquery/jquery-1.12.4.min.js");
        loadScript("/static/ie8/html5shiv.min.js");
        loadScript("/static/ie8/respond.min.js");
        loadScript("/assets/js/ie8-responsive-file-warning.js");
    } else {
        // loadScript("/static/jquery/jquery-3.3.1.min.js");
        loadScript("/static/bootstrap/3.4.1/js/bootstrap.min.js");
        loadScript("/static/animate/pace.min.js");
        loadScript("/static/animate/wow.min.js");
        loadScript("/static/animate/classie.js");
        loadScript("/static/animate/cbpAnimatedHeader.min.js");
        loadScript("/static/jquery/jquery.placeholder.js");
        loadScript("/static/polyfill/polyfill.min.js?features=es6");
        loadScript("/static/animate/inspinia.js");
        loadScript("/assets/js/docs.min.js");
        loadScript("/assets/js/ie10-viewport-bug-workaround.min.js");
        loadScript("/assets/js/ie-emulation-modes-warning.min.js");
    }
    setTimeout(function () {
        if (window.location.hash) $("body,html").animate({scrollTop: $(window.location.hash).offset().top});
        $('a[href^="#"]').on('click', function (event) {
            event.preventDefault();
            var target = this.hash;
            $('body,html').animate({scrollTop: $(target).offset().top});
            window.location.hash = target;
        });
    }, 400);
}

function add_skippy() {
    var skippy = document.createElement("div");
    skippy.innerHTML = '<a href="#content" class="sr-only sr-only-focusable" id="skippy">Skip to main content</a>';
    document.body.insertBefore(skippy, document.body.firstChild);
}

function add_header() {
    var header = document.createElement("header");
    header.innerHTML = `
        <header class="navbar navbar-default navbar-static-top bs-docs-nav" id="top" role="banner">
        <div class="container">
            <div class="navbar-header">
                <button class="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target="#bs-navbar" aria-controls="bs-navbar" aria-expanded="false">
                    <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="/"></a>
            </div>
            <nav id="bs-navbar" class="collapse navbar-collapse">
                <ul class="nav navbar-nav" id="navbar"></ul>
            </nav>
        </div>
    </header>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    <!-- Docs master nav -->
    $(document).ready(function () {
        // 动态生成菜单HTML
        var navbar = $('#navbar');
        menuConfig.forEach(function (item) {
            var li;
            if (item.dropdown) {
                // 下拉菜单项
                li = $('<li>').addClass('dropdown').attr('id', item.id);
                var a = $('<a>').addClass('dropdown-toggle').attr({
                    href: '#',
                    'data-toggle': 'dropdown',
                    role: 'button',
                    'aria-haspopup': 'true',
                    'aria-expanded': 'false'
                }).html('<i class="' + item.icon + '"></i> ' + item.text + ' <span class="caret"></span>');

                var dropdownMenu = $('<ul>').addClass('dropdown-menu').attr({role: 'menu'});
                item.dropdown.forEach(function (subItem) {
                    $('<li>').append($('<a>').attr('href', subItem.link).text(subItem.text)).appendTo(dropdownMenu);
                });

                a.appendTo(li);
                dropdownMenu.appendTo(li);
            } else {
                // 普通菜单项
                li = $('<li>').attr('id', item.id);
                $('<a>').attr('href', item.link).html('<i class="' + item.icon + '"></i> ' + item.text).appendTo(li);
            }

            li.appendTo(navbar);
        });
    });
}

function add_footer() {
    var footer = document.createElement("footer");
    footer.innerHTML = `
    <footer class="bs-docs-footer" role="contentinfo">
    <div class="container">
        <div class="row footer-top text-justify">
            <div class="col-sm-6 col-lg-6">
                <h4>厦门大学黄老师</h4>
                <p>
                    @2014-2025 <a href="about.html">黄炜</a> 保留其自行研发部分的所有权利。
                </p>
            </div>
            <div class="col-sm-6  col-lg-5 col-lg-offset-1 hidden-print">
                <div class="row about">
                    <div class="col-xs-4">
                        <h4>
                            <i class="fa fa-question-circle"></i> 获取帮助
                        </h4>
                        <ul class="list-unstyled">
                            <li><a href="/changelog.html">更新日志</a></li>
                            <li><a href="mailto:whuang@xmu.edu.cn">联系我</a></li>
                        </ul>
                    </div>
                    <div class="col-xs-4">
                        <h4>
                            <i class="fa fa-language"></i> 语言
                        </h4>
                        <ul class="list-unstyled">
                            <li><a href="/">简体中文</a></li>
                            <li><a href="#">正體中文</a></li>
                            <li><a href="/en/">English</a></li>
                        </ul>
                    </div>
                    <div class="col-xs-4">
                        <h4>
                            <i class="fa fa-external-link"></i> 链接
                        </h4>
                        <ul class="list-unstyled">
                            <li><a href="https://www.xmu.edu.cn/" target="_blank">厦门大学</a></li>
                            <li>
                                <a href="https://informatics.xmu.edu.cn/"
                                   target="_blank">厦门大学信息学院</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>`;
    document.body.appendChild(footer);
}

function add_docs_header_after_header() {
    if (typeof page_docs_header_title === 'undefined')
        return;
    var docs_header = document.createElement("div");
    docs_header.innerHTML = `
    <div class="bs-docs-header" id="content" tabindex="-1">
        <div class="container">
            <h1>---</h1>
            <p>---</p>
        </div>
    </div>`;
    // append child just after <header>
    var header = document.querySelector("header");
    header.parentNode.insertBefore(docs_header, header.nextSibling);
    if (page_docs_header_title)
        $(".bs-docs-header h1").text(page_docs_header_title);
    if (page_docs_header_desc)
        $(".bs-docs-header p").text(page_docs_header_desc);
}

function add_main() {
    var mainScript = document.getElementById('main');
    if (!mainScript)
        return;
    var scriptContent = mainScript.innerHTML;
    var mainTag = document.createElement("main");
    var config_page_style = 'doc';
    if (typeof page_style !== 'undefined')
        config_page_style = page_style;
    if (config_page_style !== 'home') {
        mainTag.classList.add("container");
        mainTag.classList.add("bs-docs-container");
    }
    if (config_page_style === 'doc-menu') {
        const row = document.createElement("div");
        row.className = "row";
        const colMain = document.createElement("div");
        colMain.className = "col-md-9";
        colMain.setAttribute("role", "main");
        colMain.innerHTML = scriptContent; // 设置innerHTML
        const colComplementary = document.createElement("div");
        colComplementary.className = "col-md-3";
        colComplementary.setAttribute("role", "complementary");
        const nav = document.createElement("nav");
        nav.className = "bs-docs-sidebar hidden-print hidden-xs hidden-sm affix-top";
        colComplementary.appendChild(nav);
        row.appendChild(colMain);
        row.appendChild(colComplementary);
        mainTag.appendChild(row);
    } else {
        mainTag.innerHTML = scriptContent;
    }
    document.body.appendChild(mainTag);
    loadScript("/assets/js/footer.js");
}

function add_page_loader() {
    var page_loader = document.createElement("div");
    page_loader.innerHTML = `
<style>
@media screen {
    #page-preloader {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        background: #fff;
        z-index: 99999;
        text-align: center
    }
}
</style>
<div id="page-preloader"><div class="spinner"><div class="dot1"></div><div class="dot2"></div></div></div>`;
    document.body.appendChild(page_loader);
}

function add_title() {
    var title = document.createElement("title");
    if (typeof myoj2_app_name === 'undefined')
        return;
    title.innerHTML = myoj2_app_name;
    document.head.appendChild(title);
}

function load_mathjax() {
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']]
        },
        startup: {
            pageReady: function () {
                return MathJax.startup.defaultPageReady().then(function () {
                    // 初始化完成后的操作（可选）
                });
            }
        }
    };
    loadScript('/static/MathJax/3.1.2/es5/tex-chtml-full.js');
}

function load_page() {
    add_page_loader();
    add_title();
    add_skippy();
    add_header();
    add_docs_header_after_header();
    add_main();
    setTimeout('load_scripts_and_csses()', 50);

    // 异步加载通用文档查看器并在需要时自动初始化（避免页面时序问题）
    setTimeout(function () {
        loadScript('/assets/js/doc-viewer.js', function () {
            try {
                if (document.querySelector('#assignment-content') && typeof initDocViewer === 'function') {
                    initDocViewer({
                        idParam: 'id',
                        idRegex: /^[0-9A-Za-z]{2}$/, // 两位数字/字母
                        dataPath: '/teaching/cni/assignment/data.json',
                        mdPathTemplate: '/teaching/cni/assignment/{id}.md',
                        container: '#assignment-content',
                        headerPSelector: '.bs-docs-header .container p',
                        show404: true
                    });
                }
                // 如果后续需要自动初始化 experiment/project，可以在此添加相应检测
            } catch (e) { /* ignore */ }
        }, 'doc-viewer-js');
    }, 200);

    add_footer();
}

load_page();
