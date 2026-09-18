-- 고정 공대원 8명. 색상은 docs/DESIGN.md §2 Member Colors.
insert into members (id, nickname, color, sort_order) values
  (1, '딘또썬',               '#1d4b99', 1),
  (2, '말랭짱',               '#38aefa', 2),
  (3, '흑마66',               '#6768f6', 3),
  (4, '고추좋아해요',         '#fa38ec', 4),
  (5, '항상그놈',             '#0e9aa7', 5),
  (6, '네이팜고스트',         '#8a5a3c', 6),
  (7, '슈레이드성',           '#e0609a', 7),
  (8, '골드내놔쉴드도유료야', '#7a8b2a', 8)
on conflict (id) do update
  set nickname   = excluded.nickname,
      color      = excluded.color,
      sort_order = excluded.sort_order;
