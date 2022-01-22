const SCORE = {
  PERFECT: 10,
  CONNECTED: 5,
  COUNT: 1,
};

function findLawName(laws, name, limit) {
  const found = laws.filter((l) => {
    let score = 0;
    score += v.matches(l.Alias, `^${name}$`) ? SCORE.PERFECT : 0;
    score += v.matches(l.Alias, `${name}`) ? SCORE.CONNECTED : 0;
    score += regexCount(l.Alias.toString(), `[${name}]`) * SCORE.COUNT;
    l.Score = score;
    if (score === 0) return false;

    const regex = new RegExp(`[${v.chars(name)}]`, "g");
    l.LawNameResult = l.LawName.replace(
      regex,
      '<span class="color-fg-accent">$&</span>'
    );
    return true;
  });

  const sorted = _.orderBy(found, ["Score"], ["desc"]);
  limit = limit || 10;
  return sorted.slice(0, limit);
}

function findArticles(law, arg) {
  if (Array.isArray(arg)) {
    return findArticleRange(law, arg);
  } else if (arg !== null) {
    const found = findArticleNo(law, arg);
    return found ? [found] : [];
  } else {
    return law.LawArticles;
  }
}

function findArticleNo(law, no) {
  // no
  // 34-1,1234,234~234
  const lawArticles = law.LawArticles;
  return lawArticles.find((la) => la.ArticleNo === no);
}

function findArticleNoIndex(law, no) {
  const lawArticles = law.LawArticles;

  return lawArticles.findIndex((la) => la.ArticleNo === no);
}

function findArticleRange(law, [from, to]) {
  const lawArticles = law.LawArticles;

  // ~to
  if (from === null) {
    toIdx = findArticleNoIndex(law, to);
    if (toIdx === -1) {
      return [];
    }
    return lawArticles.slice(0, toIdx + 1);
  }

  // from~
  if (to === null) {
    fromIdx = findArticleNoIndex(law, from);
    if (fromIdx === -1) {
      return [];
    }
    return lawArticles.slice(fromIdx);
  }

  toIdx = findArticleNoIndex(law, to);
  fromIdx = findArticleNoIndex(law, from);
  if (fromIdx === -1 && toIdx === -1) {
    return [];
  }
  if (fromIdx === -1) {
    return lawArticles.slice(0, toIdx + 1);
  }
  if (toIdx === -1) {
    return lawArticles.slice(fromIdx);
  }
  return lawArticles.slice(fromIdx, toIdx + 1);
}
