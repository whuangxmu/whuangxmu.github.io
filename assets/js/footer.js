var MathJax = {
    tex: {inlineMath: [["$", "$"]]},
    svg: {fontCache: "global"},
    loader: {load: ["input/tex-base", "output/svg", "ui/menu", "[tex]/require"]}
};

var title_selectors = [
    ".bs-docs-header h1#title",
    ".bs-docs-header h1",
    "h1.page-header",
    "h2.page-header"
];

for (var i = 0; i < title_selectors.length; i++) {
    if ($(title_selectors[i]).length) {
        $("title").text(myoj2_app_name + ": " + $(title_selectors[i]).text());
        break;
    }
}

function render_docs_sidebar() {
    $(".bs-docs-sidebar").html(
        '<ul class="nav bs-docs-sidenav"></ul>' +
        '<a class="back-to-top" href="#top"> 返回顶部 </a>' +
        '<a class="back-to-top" href="./"> 返回上一级 </a>'
    );

    var $nav = $("ul.bs-docs-sidenav");
    var currentH1List = null;

    $(".bs-docs-section").each(function () {
        var $headers = $(this).find(".page-header");
        for (var $hi = 0; $hi < $headers.length; $hi++) {
            var $header = $($headers[$hi]);
            var headerId = $header.attr("id");
            var headerText = $header.text().trim();

            if ($header.is("h1")) {
                var $h1Item = $(
                    '<li><a href="#' + headerId + '">' + headerText + "</a></li>"
                );
                var $h1Ul = $('<ul class="nav"></ul>');
                $h1Item.append($h1Ul);
                $nav.append($h1Item);
                currentH1List = $h1Ul;
            } else if ($header.is("h2") && currentH1List) {
                var $h2Item = $(
                    '<li><a href="#' + headerId + '">' + headerText + "</a></li>"
                );
                currentH1List.append($h2Item);
            }
        }
    });

    $(".nav.bs-docs-sidenav ul:empty").remove();
    setTimeout(function () {
        $(".bs-docs-sidebar").scroll();
    }, 100);
}

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

waitUntil(
    function () {
        return !mode_async_json;
    },
    function () {
        $(".bs-docs-sidebar").ready(function () {
            render_docs_sidebar();
        });
        $(document).ready(function () {
            $("#page-preloader").fadeOut(800);
        });
    }
);
