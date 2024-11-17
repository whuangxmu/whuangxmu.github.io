function loadScript(url, id = null, callback = null) {
    var script = document.createElement("script");
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

function load_scripts_and_csses() {
    loadCss("/static/bootstrap/3.4.1/css/bootstrap.css");
    loadCss("/static/animate/animate.css");
    loadCss("/assets/css/docs.min.css");
    loadCss("/assets/css/docs.navy.min.css");
    loadCss("/assets/css/patch.css");
    loadCss("//cdn.bootcdn.net/ajax/libs/font-awesome/6.4.2/css/all.css");
    loadScript("/static/jquery/jquery-3.3.1.min.js");
    loadScript("/static/bootstrap/3.4.1/js/bootstrap.min.js");
    loadScript("/static/animate/pace.min.js");
    loadScript("/static/animate/wow.min.js");
    loadScript("/static/animate/classie.js");
    loadScript("/static/animate/cbpAnimatedHeader.min.js");
    loadScript("/static/jquery/jquery.placeholder.js");
    loadScript("/static/polyfill/polyfill.min.js?features=es6");
    loadScript("/static/animate/inspinia.js");
    loadScript("/assets/js/docs.min.js");
    loadScript("/assets/js/footer.min.js");
    loadScript("/assets/js/ie10-viewport-bug-workaround.min.js");
    loadScript("/assets/js/ie-emulation-modes-warning.min.js");
}

// <script type="text/javascript" async="async" src="//cdn.bootcdn.net/ajax/libs/mathjax/3.1.2/es5/tex-chtml-full.min.js"></script>

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
                    @2014-2024 <a href="about.html">黄炜</a> 保留其自行研发部分的所有权利。
                </p>
            </div>
            <div class="col-sm-6  col-lg-5 col-lg-offset-1 hidden-print">
                <div class="row about">
                    <div class="col-xs-4">
                        <h4>
                            <i class="fa fa-question-circle"></i> 获取帮助
                        </h4>
                        <ul class="list-unstyled">
                            <li><a href="changelog.html">更新日志</a></li>
                            <li><a href="mailto:whuang@xmu.edu.cn">联系我</a></li>
                        </ul>
                    </div>
                    <div class="col-xs-4">
                        <h4>
                            <i class="fa fa-language"></i> 语言
                        </h4>
                        <ul class="list-unstyled">
                            <li><a href="/index.html">简体中文</a></li>
                            <li><a href="#">正體中文</a></li>
                            <li><a href="#">English</a></li>
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
    var scriptContent=mainScript.innerHTML;
    var mainTag = document.createElement("main");
    mainTag.innerHTML = scriptContent;
    if (typeof page_docs_header_title !== 'undefined') {
        mainTag.classList.add("container");
        mainTag.classList.add("bs-docs-container");
    }
    document.body.appendChild(mainTag);
}

function add_page_loader() {
    var page_loader = document.createElement("div");
    page_loader.innerHTML = `<div id="page-preloader"><div class="spinner"><div class="dot1"></div><div class="dot2"></div></div></div>`;
    document.body.appendChild(page_loader);
}

function load_page() {
    load_scripts_and_csses();
    add_page_loader();
    add_skippy();
    add_header();
    add_docs_header_after_header();
    add_main();
    add_footer();
    setTimeout(function () {
        $(document.body).scrollspy({target: ".bs-docs-sidebar"});
        $(document.body).scrollspy("refresh");
        $(document.body).scrollspy("activate");
    }, 1000);
}

load_page();
