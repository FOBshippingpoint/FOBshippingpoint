hotkeys.filter = function (event) {
  var tagName = (event.target || event.srcElement).tagName;
  hotkeys.setScope(
    /^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? "input" : "other"
  );
  return true;
};

$(function () {
  let laws = [];
  let lawFound = [];
  let lastVal = "";

  // $.getJSON("../law-data/ChLaw.json", function (data) {
  //   laws = lawsProcess(data);
  // });

  laws = lawsProcess(ChLaw);

  $("input#search").on(
    "keyup",
    throttle(function () {
      const val = $("input#search").val();
      if (lastVal === val) {
        return;
      } else {
        lastVal = val;
      }
      const { name, args } = queryProcess(val);
      $("#isValid").text("args:" + args + "; name:" + name);

      $("#list").empty();

      const start = performance.now();
      const found = findLawName(laws, name);
      console.log(found);
      // const args = argsProcess(val.match(regex)[0]);

      // append
      processLargeArrayAsync(found, (l) => {
        const found = args.map((arg) => findArticles(l, arg));
        const lawElement =
          $(`<div class="Box Box--condensed mt-3" id="list"><div class="Box-header"><h3 class="Box-title">${
            l.LawNameResult
          }</h3></div>
        ${found.reduce(
          (acc, f) =>
            acc + f.reduce((accc, ff) => accc + articleDisplay(ff), ""),
          ""
        )}
        </div>`);
        console.log(lawElement);

        $("#list").append(lawElement);
        $("#performance").text(performance.now() - start + "ms");
      });
    }, 50)
  );

  $("#list").on(
    {
      mouseenter: function () {
        //stuff to do on mouse enter
        $(this).toggleClass("box-shadow-l");
      },
      mouseleave: function () {
        //stuff to do on mouse leave
        $(this).toggleClass("box-shadow-l");
      },
    },
    ".article"
  );

  // $("#save").on("keydown", function (event) {
  //   if (event.key === "Enter") {

  //   }
  // });

  $("#save").on("click", function () {
    $("#save").addClass("spinner");
    const newAlias = $("input[name^=alias]")
      .map(function (idx, elem) {
        return $(elem).attr("id") + $(elem).val();
      })
      .get();

    newAlias.forEach((a) => {
      const found = _.find(lawFound, { LawName: a });
      if (found) {
        found.Alias = a.split(" ");
      }
    });
    $("#save").removeClass("spinner");
  });

  hotkeys("s", { scope: "other" }, function (event, handler) {
    event.preventDefault();
    const input = $("input#search").trigger("focus").get(0);
    input.setSelectionRange(0, input.value.length);
  });

  hotkeys("alt+a", { scope: "other" }, function (event, handler) {
    event.preventDefault();
    const input = $("input#search").trigger("focus").get(0);
    input.setSelectionRange(input.value.length, input.value.length);
  });

  hotkeys(
    "enter",
    { scope: "input", keyup: true, element: document.getElementById("search") },
    function (event, handler) {
      event.preventDefault();
      // $("#list").trigger("focus");
    }
  );

  const clipboard = new ClipboardJS(".copyArticle");

  clipboard.on("success", function (e) {
    $(e.trigger).addClass("tooltipped");
    $(e.trigger).one("mouseout", function (e) {
      $(this).removeClass("tooltipped");
    });
    console.log(e.text);
    e.text = "hello";
    e.clearSelection();
  });

  clipboard.on("error", function (e) {
    alert("error");
  });
});

// last two args are optional
function processLargeArrayAsync(array, fn, chunk, context) {
  context = context || window;
  chunk = chunk || 100;
  var index = 0;
  function doChunk() {
    var cnt = chunk;
    while (cnt-- && index < array.length) {
      // callback called with args (value, index, array)
      fn.call(context, array[index], index, array);
      ++index;
    }
    if (index < array.length) {
      // set Timeout for async iteration
      setTimeout(doChunk, 1);
    }
  }
  doChunk();
}

function queryProcess(query) {
  // 前面沒零的整數
  const g1str = "[1-9][0-9]*";
  // 第 x-x 條 or 第 x 條
  const g2str = `(?:${g1str}-${g1str}|${g1str})`;
  // 條~條 or 條~ or ~條 or 條
  const g3str = `(?:${g2str}~${g2str}|${g2str}~|~${g2str}|${g2str})`;
  const argsRegex = new RegExp(`${g3str}(?:,${g3str})*`);

  let name = "";
  let args = [null];
  let match = argsRegex.exec(query);
  if (match) {
    name = query.slice(0, match.index);
    args = query.slice(match.index);

    args = args.split(",").map((arg) => {
      // find range
      let range;
      if (v.matches(arg, `${g2str}~${g2str}`)) {
        range = arg.split("~").sort((a, b) => a - b);
      } else if (v.matches(arg, `~${g2str}`)) {
        range = [null, arg.slice(1)];
      } else if (v.matches(arg, `${g3str}~`)) {
        range = [arg.slice(0, -1), null];
      } else {
        // search spec no
        return arg;
      }
      // search range
      return range;
    });
  }

  return { name, args };
}

function lawsProcess(chLaw) {
  const alias = {
    中華民國憲法: ["const", "憲法", "醜逼"],
    民法: ["civil", "民"],
  };
  // 各法律
  const laws = chLaw.Laws;
  let rnMax = 0;
  let rnCount, rnMaxA;
  laws.forEach((l) => {
    // add alias
    l.Alias = alias[l.LawName] ? [l.LawName, ...alias[l.LawName]] : [l.LawName];

    // 第 xx 條 => xx
    const articles = l.LawArticles;

    articles.forEach((a) => {
      a.ArticleNo = v.substring(a.ArticleNo, 2, a.ArticleNo.length - 2);
      const regex =
        /\r\n(?![一二三四五六七八九十]{1,3}[、\s]|[┌┐├│]|(?:\s\s){0,1}第\s\d[\d\s]\s|（[一二三四五六七八九十]）|\s\s（[一二三四五六七八九十]）)/;
      a.ArticleContents = v.split(a.ArticleContent, regex);
      rnCount = (a.ArticleContent.match(new RegExp(regex, "g")) || []).length;
      // delete a.ArticleContent;
      if (rnCount > rnMax) {
        rnMaxA = a;
        rnMax = rnCount;
      }
    });
  });
  console.log("rnMax:", rnMax);
  console.log("rnMaxA:", rnMaxA);
  return laws;
}

function regexCount(str, pattern) {
  const re = new RegExp(pattern, "g");
  return ((str || "").match(re) || []).length;
}

function throttle(callback, limit) {
  var waiting = false; // Initially, we're not waiting
  return function () {
    // We return a throttled function
    if (!waiting) {
      // If we're not waiting
      callback.apply(this, arguments); // Execute users function
      waiting = true; // Prevent future invocations
      setTimeout(function () {
        // After a period of time
        waiting = false; // And allow future invocations
      }, limit);
    }
  };
}

function articleDisplay(article) {
  const { ArticleNo, ArticleContents, ArticleContent } = article;
  let elem;
  // is
  if (ArticleNo.length === 0) {
    elem = `<ul class="article Box-row Box-row--hover-blue"><span>${ArticleContent}</span></ul>`;
  } else {
    elem = `<ul class="article Box-row Box-row--hover-gray"><button data-clipboard-text="${ArticleContent}" class="copyArticle btn-link Link--primary no-underline tooltipped-e tooltipped-no-delay" aria-label="已複製">第<span class="px-1">${ArticleNo}</span>條
    </button>
    <ul class="ml-5">
    ${ArticleContents.reduce(
      (acc, curr) => acc + `<li class="paragraph">${curr}</li>`,
      ""
    )}</ul></ul>`;
  }
  return elem;
}
