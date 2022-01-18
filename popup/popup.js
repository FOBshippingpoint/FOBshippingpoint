$(function () {
  let laws = [];
  let lawFound = [];

  $.getJSON("../law-data/ChLaw.json", function (data) {
    laws = lawsProcess(data);
  });

  $("input#search").on(
    "keyup",
    throttle(function () {
      const val = $("input#search").val();
      // const found = val.match(/^\D+/);
      const g1str = "[1-9][0-9]*";
      const g2str = `(?:${g1str}-${g1str}|${g1str})`;
      const g3str = `(?:${g2str}~${g2str}|${g2str}~|~${g2str}|${g2str})`;
      const regex = new RegExp(`${g3str}(?:,${g3str})*`);
      const name = val.replace(regex, "");
      $("#isValid").text("match:" + val.match(regex) + "; name:" + name);

      $("#list").empty();

      const start = performance.now();
      const found = findLawName(laws, name);
      console.log(found);
      const args = argsProcess(val.match(regex)[0]);

      // append
      processLargeArrayAsync(found, (l) => {
        const found = args.map((arg) => findArticles(l, arg));
        const lawElement = $(`<div class="group group-m">
        <ul>
        <li>${l.LawNameResult}
        <ul>${found.reduce((acc, f) => {
          return (
            acc +
            `<li>${f.reduce(
              (acc, ff) =>
                acc + `<li>${ff.ArticleNo}${ff.ArticleContents}</li>`,
              ""
            )}</li>`
          );
        }, "")}</ul></li>
            </ul>
            </div>`);
        $("#list").append(lawElement);
        $("#performance").text(performance.now() - start + "ms");
      });
    }, 50)
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
        /\r\n(?![一二三四五六七八九十]{1,3}、|[┌┐├│]|(?:\s\s){0,1}第\s\d[\d\s]\s|（[一二三四五六七八九十]）|\s\s（[一二三四五六七八九十]）)/;
      a.ArticleContents = v.split(a.ArticleContent, regex);
      rnCount = (a.ArticleContent.match(new RegExp(regex, "g")) || []).length;
      delete a.ArticleContent;
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

function argsProcess(args) {
  const g1str = "[1-9][0-9]*";
  const g2str = `(?:${g1str}|${g1str}-${g1str})`;
  const g3str = `(?:${g2str}~${g2str}|${g2str}~|~${g2str}|${g2str})`;
  const regex = new RegExp(`${g3str}(,${g3str})*`);
  if (v.matches(args, regex)) {
    args = args.split(",");

    const result = args.map((arg) => {
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

    return result;
  }

  return [null];
}
