$(function () {
  let laws = [];
  let lawFound = [];

  $.getJSON("../law-data/ChLaw.json", function (data) {
    laws = lawsProcess(data);
    //   laws.forEach((l) => {
    //     const lawElement = $(`<div class="group group-m">
    //     <ul>
    //       <li>${l.LawName}</li>
    //       <li><input type="text"></li>
    //     </ul>
    // </div>`);
    //     $("#list").append(lawElement);
    //   });
  });

  $("input#search").on(
    "keydown",
    throttle(function () {
      const val = $("input#search").val();
      // const found = val.match(/^\D+/);
      $("#isValid").text(val);

      $("#list").empty();

      const start = performance.now();
      const found = findLawName(laws, val);
      $("#performance").text(performance.now() - start + "ms");

      // append
      found.forEach((l) => {
        const lawElement = $(`<div class="group group-m">
      <ul>
        <li>${l.LawNameResult}</li>
        <li><input type="text" id="${
          l.Alias[0]
        }" name="alias[]" value="${l.Alias.slice(1).join(" ")}"></li>
      </ul>
  </div>`);
        $("#list").append(lawElement);
      });
    }, 20)
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

function lawsProcess(chLaw) {
  const alias = {
    中華民國憲法: ["const", "憲法"],
    民法: ["civil", "民"],
  };
  // 各法律
  const laws = chLaw.Laws;
  laws.forEach((l) => {
    // add alias
    l.Alias = alias[l.LawName] ? [l.LawName, ...alias[l.LawName]] : [l.LawName];

    // 第 xx 條 => xx
    const articles = l.LawArticles;
    articles.forEach((a) => {
      a.ArticleNo = v.substring(a.ArticleNo, 2, a.ArticleNo.length - 2);
      a.ArticleContents = v.split(a.ArticleContent, /\r\n/);
      delete a.ArticleContent;
    });
  });
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

// console.log("hello");
// const url = "https://law.moj.gov.tw/api/Ch/Law/JSON";
// fetch(url).then((response) => {
//   response.blob().then((blob) => {
//     readBlob(blob);
//   });
// });

// async function readBlob(content) {
//   var new_zip = new JSZip();
//   new_zip.loadAsync(content).then(function (zip) {
//     // you now have every files contained in the loaded zip
//     zip
//       .file("ChLaw.json")
//       .async("string")
//       .then(function (jsonStr) {
//         const trimmed = v.trim(jsonStr);
//         const chLaw = JSON.parse(trimmed);
//         browser.storage.local.set({ chLaw }).then(
//           () => {
//             console.log("OK");
//             browser.storage.local.get("chLaw", (item) => {
//               console.log(item.chLaw);
//             });
//           },
//           (error) => {
//             console.log(error);
//           }
//         );
//       });
//   });
// }
