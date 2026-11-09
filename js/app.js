"use strict";
/* 같이갈개 · 반려동물 동반 카페 찾기
 *
 * 데이터 : data/dog_cafes.json (카페), data/outdoor_facilities.json (관광/명소)
 *   두 파일은 같은 스키마를 쓴다.
 *   { id, name, location{sigungu,dong,roadAddress,jibunAddress,lat,lng}, contact{phone,homepage},
 *     hours{closedDays,text,byDay}, facility{parking,admissionFee,indoor,outdoor,petOnly,description},
 *     conditions{ size{small,medium,large}, leash, vaccinationDisease, ... (Y/N) }, originalText{...} }
 *   → normalize()에서 화면용 객체로 한 번 바꿔서 쓴다. (JSON 구조가 바뀌면 normalize()만 고치면 됨)
 *
 * 후기(reviews)는 데이터 파일과 분리된 별도 데이터. 지금은 메모리 샘플이고, 서버가 생기면 이 부분만 교체.
 * ※ fetch를 쓰므로 index.html을 더블클릭(file://)하지 말고 로컬 서버로 열어야 한다.
 */

const DATA_FILES = { cafes: "../data/dog_cafes.json", places: "../data/outdoor_facilities.json" };
const PAGE_SIZE = 20;

/* ---------- 필터 그룹 (필터 화면 / 와이어프레임 기준) ---------- */
const FILTER_GROUPS = [
  { key: "species",  title: "종",       items: ["개", "고양이"] },
  { key: "sizes",    title: "사이즈",    items: ["소형견", "중형견", "대형견"] },
  { key: "offers",   title: "편의 시설", items: ["주차 가능", "야외 공간", "오프리쉬"] },
  { key: "status",   title: "기타 조건", items: ["접종 완료", "공격성 없음", "중성화 완료", "맹견 아님"] }
];

/* ---------- 후기 (별도 데이터 · 샘플) ---------- */
let reviews = [
  { id: 1, cafeId: 1, author: "산책하는 강아지", rating: 5, content: "분위기가 좋고 직원분들이 친절해요.", image: "", date: "2026-07-02" },
  { id: 2, cafeId: 1, author: "똥풍이", rating: 5, content: "우리 아이가 너무 좋아했어요. 또 올게요!", image: "", date: "2026-07-15" },
  { id: 3, cafeId: 1, author: "커피산책", rating: 4, content: "주말에는 조금 붐벼요.", image: "", date: "2026-08-09" },
  { id: 4, cafeId: 2, author: "꼬리별", rating: 5, content: "고양이들이 순해서 편하게 쉬었어요.", image: "", date: "2026-09-21" },
  { id: 5, cafeId: 3, author: "산책친구", rating: 4, content: "대학로 구경하고 들르기 좋아요.", image: "", date: "2026-10-09" }
];

/* ---------- 상태 ---------- */
let cafes = [];
let places = [];
const state = {
  user: null,
  favorites: [],          // 카페 id
  recent: [],             // 카페 id
  filters: { region: "", dong: "", species: [], sizes: [], offers: [], status: [] },
  limit: { cafes: PAGE_SIZE, places: PAGE_SIZE },
  current: { view: "home", params: {} },
  tab: "home",
  filterFrom: "cafes",
  rating: 0,
  reviewTarget: null
};

/* ---------- 유틸 ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const koSort = (a, b) => a.localeCompare(b, "ko", { numeric: true });

function store(key, value) {
  try { if (value === undefined) { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장소 없음 */ }
  return null;
}
function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.style.display = "none"; }, 2300);
}
/* "9:00~18:00" → "09:00~18:00" (시/분 항상 두 자리) */
const padTimes = text => String(text ?? "").replace(/(^|[^\d])(\d):(\d{2})/g, "$10$2:$3");
function safeUrl(value) {
  if (!value) return "";
  let u = String(value).trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try { const url = new URL(u); return /^https?:$/.test(url.protocol) ? url.href : ""; } catch (e) { return ""; }
}
function distanceKm(a, b) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/* ---------- JSON → 화면용 객체 ---------- */
const isYes = v => v === "Y" || v === "변동";   // '변동'은 상황에 따라 가능 → 가능 쪽으로 취급

function speciesOf(raw) {
  const desc = raw.facility?.description || "";
  const cat = /고양이|캣/.test(desc) || /고양이|캣|cats?\b/i.test(raw.name || "");
  const dog = /애견|강아지|도그/.test(desc) || !cat;
  return [dog ? "개" : null, cat ? "고양이" : null].filter(Boolean);
}

function normalize(raw, kind) {
  const c = raw.conditions || {}, f = raw.facility || {}, l = raw.location || {}, h = raw.hours || {};
  const sizes = [["small", "소형견"], ["medium", "중형견"], ["large", "대형견"]].filter(([k]) => isYes(c.size?.[k])).map(([, t]) => t);
  const offers = [];
  if (f.parking === "Y") offers.push("주차 가능");
  if (f.outdoor === "Y") offers.push("야외 공간");
  if (c.leash === "N") offers.push("오프리쉬");                 // 목줄 의무가 없는 곳
  const requires = [];                                           // 입장하려면 반려동물이 갖춰야 하는 조건
  if (c.vaccinationDisease === "Y") requires.push("접종 완료");
  if (c.aggressionBarking === "Y") requires.push("공격성 없음");
  if (c.estrusRestriction === "Y") requires.push("중성화 완료");
  if (c.dangerousBreedBan === "Y") requires.push("맹견 아님");

  const tags = [];
  tags.push(sizes.length === 3 ? "모든 크기" : sizes.join("·") || "크기 확인 필요");
  if (f.parking === "Y") tags.push("주차 가능");
  if (c.outdoorOnly === "Y") tags.push("야외만 가능");
  else if (f.indoor === "Y") tags.push("실내 가능");
  else if (f.outdoor === "Y") tags.push("야외");
  if (f.petOnly && f.petOnly !== "해당없음") tags.push(f.petOnly);

  return {
    kind, id: raw.id, uid: `${kind}:${raw.id}`, name: raw.name,
    region: l.sigungu || "", dong: l.dong || "",
    address: l.roadAddress || l.jibunAddress || (l.sigungu ? `서울특별시 ${l.sigungu}` : ""),
    lat: l.lat ?? null, lng: l.lng ?? null,
    phone: raw.contact?.phone || "", homepage: safeUrl(raw.contact?.homepage),
    closedDays: h.closedDays || "정보없음", hoursText: padTimes(h.text || "정보없음"),
    category: f.description || "", fee: f.admissionFee || "",
    restriction: raw.originalText?.restrictions || "",
    species: kind === "cafe" ? speciesOf(raw) : ["개"],
    sizes, offers, requires, tags
  };
}

/* ---------- 후기 / 평점 ---------- */
function ratingOf(cafe) {
  const list = reviews.filter(r => r.cafeId === cafe.id);
  return { count: list.length, avg: list.length ? list.reduce((s, r) => s + Number(r.rating), 0) / list.length : null };
}
const ratingText = cafe => { const { avg } = ratingOf(cafe); return avg == null ? "★ -" : `★ ${avg.toFixed(1)}`; };

/* ---------- 필터 ---------- */
function matches(item) {
  const f = state.filters;
  if (f.region && item.region !== f.region) return false;
  if (f.dong && item.dong !== f.dong) return false;
  if (!f.species.every(s => item.species.includes(s))) return false;
  if (!f.sizes.every(s => item.sizes.includes(s))) return false;
  if (!f.offers.every(o => item.offers.includes(o))) return false;
  // 기타 조건 : '내 아이에게 해당하는 항목'을 고르면, 그 외 조건을 요구하는 곳은 제외
  if (f.status.length && item.requires.some(r => !f.status.includes(r))) return false;
  return true;
}
const filterCount = () => ["species", "sizes", "offers", "status"].reduce((n, k) => n + state.filters[k].length, 0) + (state.filters.dong ? 1 : 0);
function resetFilters() { state.filters = { region: "", dong: "", species: [], sizes: [], offers: [], status: [] }; }
function onFilterChange() {
  state.limit = { cafes: PAGE_SIZE, places: PAGE_SIZE };
  dropdowns.forEach(d => d.render());
  renderView(state.current.view, state.current.params, false);
}

/* ---------- 드롭다운 ---------- */
const dropdowns = [];
function createDropdown(root, cfg) {
  root.innerHTML = `<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false"><span class="dd-label"></span>${cfg.caret ? '<span class="dd-caret" aria-hidden="true">▼</span>' : ""}</button><ul class="dd-list" role="listbox" hidden></ul>`;
  const btn = $(".dd-btn", root), label = $(".dd-label", root), list = $(".dd-list", root);
  const api = {
    root,
    render() {
      label.textContent = cfg.label();
      btn.disabled = !!(cfg.disabled && cfg.disabled());
      const cur = cfg.value();
      list.innerHTML = cfg.options().map(o => `<li role="option" tabindex="0" data-value="${esc(o.value)}" aria-selected="${o.value === cur}">${esc(o.text)}</li>`).join("");
    },
    close() { list.hidden = true; btn.setAttribute("aria-expanded", "false"); },
    open() { dropdowns.forEach(d => d !== api && d.close()); list.hidden = false; btn.setAttribute("aria-expanded", "true"); }
  };
  btn.addEventListener("click", () => (list.hidden ? api.open() : api.close()));
  const choose = li => { api.close(); cfg.onSelect(li.dataset.value); btn.focus(); };
  list.addEventListener("click", e => { const li = e.target.closest("li"); if (li) choose(li); });
  list.addEventListener("keydown", e => {
    const li = e.target.closest("li"); if (!li) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(li); }
    else if (e.key === "ArrowDown") { e.preventDefault(); li.nextElementSibling?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); li.previousElementSibling?.focus(); }
  });
  root.addEventListener("keydown", e => { if (e.key === "Escape") { api.close(); btn.focus(); } });
  dropdowns.push(api);
  api.render();
  return api;
}
const closeDropdowns = () => dropdowns.forEach(d => d.close());

let regionList = [], dongMap = {};
function buildRegionData() {
  const all = [...cafes, ...places];
  regionList = [...new Set(all.map(i => i.region).filter(Boolean))].sort(koSort);
  dongMap = {};
  all.forEach(i => { if (i.region && i.dong) (dongMap[i.region] ||= new Set()).add(i.dong); });
}
const regionOptions = () => [{ value: "", text: "전체 지역" }, ...regionList.map(r => ({ value: r, text: "서울 " + r }))];
const dongOptions = () => [{ value: "", text: "전체 지역" }, ...[...(dongMap[state.filters.region] || [])].sort(koSort).map(d => ({ value: d, text: d }))];
function regionDropdown(id, caret) {
  createDropdown($(id), {
    caret,
    label: () => state.filters.region ? "서울 " + state.filters.region : "지역 선택",
    value: () => state.filters.region,
    options: regionOptions,
    onSelect: v => { state.filters.region = v; state.filters.dong = ""; onFilterChange(); }
  });
}

/* ---------- 카드 ---------- */
function photo(item, cls) {
  return `<div class="ph ${cls}" role="img" aria-label="${esc(item.name)} 사진 자리"></div>`;
}
const chipRow = item => `<div class="chip-row">${item.tags.slice(0, 2).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>`;
const regionLine = item => `서울 ${item.region}${item.dong ? " " + item.dong : ""}`;
const favButton = cafe => {
  const on = state.favorites.includes(cafe.id);
  return `<button type="button" class="btn ${on ? "saved" : ""}" data-fav="${cafe.id}" aria-pressed="${on}">${on ? "♥ 찜함" : "찜하기"}</button>`;
};

function placeCard(item) {            // 세로 카드 : 홈 / 목록 / 명소
  const isCafe = item.kind === "cafe";
  return `<article class="pcard">
    ${photo(item, "")}
    <div class="pcard-body">
      ${chipRow(item)}
      <h3>${esc(item.name)}</h3>
      <p class="addr">${esc(regionLine(item))}</p>
      <p class="mini">${esc(item.restriction || item.category)}</p>
      <div class="btn-row">
        <button type="button" class="btn" data-open="${item.uid}">상세보기</button>
        ${isCafe ? favButton(item) : ""}
      </div>
    </div>
  </article>`;
}
function rowCard(cafe, ad = false) {  // 가로 카드 : 최근 본 / 찜 / 맞춤 추천
  return `<article class="rcard">
    ${photo(cafe, "")}
    <div class="rcard-body">
      ${chipRow(cafe)}
      <div class="rcard-title"><h3>${esc(cafe.name)}</h3><span class="rate">${ratingText(cafe)}</span></div>
      <p class="addr">${esc(regionLine(cafe))}</p>
      <p class="mini">${esc(cafe.restriction || cafe.category)}</p>
      <div class="btn-row"><button type="button" class="btn" data-open="${cafe.uid}">상세보기</button>${favButton(cafe)}</div>
      ${ad ? '<span class="ad-mark">AD</span>' : ""}
    </div>
  </article>`;
}
const emptyPage = () => `<div class="empty-page"><div class="ph" aria-hidden="true"></div><p>결과가 없어요</p><button type="button" class="link-btn" data-go="home">홈으로</button></div>`;
const emptyBox = text => `<div class="empty-box">${esc(text)}</div>`;

/* ---------- 화면 렌더 ---------- */
function setHeaderAction(html) { $("#headerSlot").innerHTML = html || ""; }

function renderHome() {
  const day = Math.floor(Date.now() / 864e5), n = 4;
  const start = cafes.length ? (day * n) % cafes.length : 0;
  const picks = cafes.length ? Array.from({ length: Math.min(n, cafes.length) }, (_, i) => cafes[(start + i) % cafes.length]) : [];
  $("#homeCards").innerHTML = picks.map(placeCard).join("");
}

function renderList(kind) {
  const isCafe = kind === "cafes";
  const source = isCafe ? cafes : places;
  let result = source.filter(matches);
  if (isCafe) result = result.sort((a, b) => (ratingOf(b).avg ?? -1) - (ratingOf(a).avg ?? -1) || a.id - b.id);
  const shown = result.slice(0, state.limit[kind]);
  const target = $(isCafe ? "#cafeResults" : "#placeResults");
  $(isCafe ? "#cafeCount" : "#placeCount").textContent = `총 ${result.length}곳`;
  target.innerHTML = result.length
    ? shown.map(placeCard).join("") + (result.length > shown.length ? `<button type="button" class="btn wide" data-more="${kind}">더 보기 (${result.length - shown.length}곳 남음)</button>` : "")
    : emptyPage();
  $$("[data-filter-count]").forEach(b => { const n = filterCount(); b.hidden = !n; b.textContent = n; });
}

function renderFilter() {
  $("#filterGroups").innerHTML = FILTER_GROUPS.map(g => `
    <div class="fgroup"><h3>${g.title}</h3>
      ${g.items.map(it => `<label class="check"><input type="checkbox" data-group="${g.key}" value="${esc(it)}" ${state.filters[g.key].includes(it) ? "checked" : ""}> ${esc(it)}</label>`).join("")}
    </div>`).join("");
}

function renderDetail({ kind, id }, fresh) {
  const isCafe = kind === "cafe";
  const item = (isCafe ? cafes : places).find(x => x.id === Number(id));
  if (!item) { navigate("home"); return; }
  if (isCafe && fresh) { state.recent = [item.id, ...state.recent.filter(n => n !== item.id)].slice(0, 10); store("recent", state.recent); }

  const link = (href, text) => href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>` : "";
  const phoneHref = "tel:" + item.phone.replace(/[^\d+-]/g, "");
  const facts = [
    ["주소", esc(item.address)],
    item.phone ? ["전화", `<a href="${esc(phoneHref)}">${esc(item.phone)}</a>`] : null,
    item.homepage ? ["홈페이지", link(item.homepage, item.homepage.replace(/^https?:\/\//, ""))] : null,
    item.fee && item.fee !== "없음" ? [isCafe ? "이용료" : "입장료", esc(item.fee)] : null
  ].filter(Boolean);

  let reviewBlock = "", nearbyBlock = "", rateLine = "";
  if (isCafe) {
    const { avg, count } = ratingOf(item);
    rateLine = `<p>${avg == null ? "평점 없음" : avg.toFixed(1)} | 후기 ${count}개</p>`;
    const list = reviews.filter(r => r.cafeId === item.id).sort((a, b) => b.date.localeCompare(a.date));
    reviewBlock = `<div class="info-card">
      <div class="review-head"><h3>방문후기</h3><button type="button" class="btn dark" data-write-review="${item.id}">후기작성</button></div>
      <p class="sub">이용자들의 솔직한 방문 후기예요.</p>
      <div class="review-list">${list.length ? list.map(r => `<div class="review"><strong>${esc(r.author)}</strong><small>${esc(r.date)} · ★ ${Number(r.rating)}</small><p>${esc(r.content)}</p>${r.image ? `<img class="review-img" src="${esc(r.image)}" alt="방문 사진">` : ""}</div>`).join("") : `<div class="review"><p>아직 등록된 후기가 없어요. 첫 후기를 남겨 주세요.</p></div>`}</div>
    </div>`;
    if (item.lat != null) {
      const near = places.filter(p => p.lat != null).map(p => ({ p, d: distanceKm(item, p) })).filter(x => x.d <= 5).sort((a, b) => a.d - b.d).slice(0, 2);
      if (near.length) nearbyBlock = `<div class="info-card"><h3>주변 명소</h3>${near.map(({ p, d }) => `<button type="button" class="nearby-row" data-open="${p.uid}"><span>${esc(p.name)}</span><small>${d.toFixed(1)}km</small></button>`).join("")}</div>`;
    }
  }

  $("#detailContent").innerHTML = `
    ${photo(item, "detail-photo")}
    <div class="detail-chips">${item.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
    <div class="info-card">
      <h2>${esc(item.name)}</h2>
      ${rateLine}
      <p>${esc([item.category, item.restriction].filter(Boolean).join(" · "))}</p>
      ${item.requires.length ? `<p class="sub">입장 조건 : ${esc(item.requires.join(", "))}</p>` : ""}
      <dl class="facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    </div>
    <div class="info-card"><h3>영업시간</h3><p>${esc(item.closedDays)}</p><p>${esc(item.hoursText)}</p></div>
    ${nearbyBlock}${reviewBlock}`;

  setHeaderAction(isCafe ? `<button type="button" class="btn dark" data-fav="${item.id}" aria-pressed="${state.favorites.includes(item.id)}">${state.favorites.includes(item.id) ? "♥ 찜함" : "찜하기"}</button>` : "");
}

function renderIdList(containerId, ids, emptyText) {
  const list = ids.map(id => cafes.find(c => c.id === id)).filter(Boolean);
  $("#" + containerId).innerHTML = list.length ? list.map(c => rowCard(c)).join("") : emptyBox(emptyText);
}

function renderProfile() {
  const u = state.user;
  const large = cafes.filter(c => c.sizes.includes("대형견"));
  const rec = large.filter(c => c.region === u.region).sort((a, b) => (ratingOf(b).avg ?? -1) - (ratingOf(a).avg ?? -1))[0] || large[0] || cafes[0];
  const recent = state.recent.map(id => cafes.find(c => c.id === id)).filter(Boolean).slice(0, 2);
  $("#profileContent").innerHTML = `
    <div class="profile-row"><div class="ph" aria-hidden="true"></div><div><strong>${esc(u.name)}님</strong><small>${esc(u.pet)}주, 서울 ${esc(u.region)}</small></div><span class="arrow" aria-hidden="true">&gt;</span></div>
    <div class="profile-section"><button type="button" class="section-link" data-go="cafes">맞춤 추천 &gt;</button>${rec ? rowCard(rec, true) : ""}</div>
    <div class="profile-section"><button type="button" class="section-link" data-go="recent">최근 본 매장 &gt;</button>
      <div class="stack">${recent.length ? recent.map(c => rowCard(c)).join("") : emptyBox("최근 본 매장이 없어요")}</div></div>`;
}

/* ---------- 별점 / 후기 폼 ---------- */
function renderStars() {
  $("#starList").innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${state.rating === n}" aria-label="${n}점" data-star="${n}" class="${n <= state.rating ? "on" : ""}">★</button>`).join("");
  $("#starText").textContent = state.rating ? "★".repeat(state.rating) + "☆".repeat(5 - state.rating) + ` (${state.rating}점)` : "";
}
function setStarOpen(open) {
  $("#starList").hidden = !open;
  $("#starToggle").setAttribute("aria-expanded", String(open));
  $("#starToggle .dd-caret").textContent = open ? "▲" : "▼";
}
function resetReviewForm() {
  $("#reviewFormEl").reset();
  state.rating = 0; renderStars(); setStarOpen(false);
}

/* ---------- 라우팅 ---------- */
const VIEW_TAB = { home: "home", cafes: "cafes", attractions: "attractions", favorites: "favorites", profile: "profile", login: "profile", signup: "profile", recent: "profile" };
function tabFor(view, params) {
  if (VIEW_TAB[view]) return VIEW_TAB[view];
  if (view === "filter") return params.from === "attractions" ? "attractions" : "cafes";
  return params.tab || (params.kind === "place" ? "attractions" : "cafes");
}

function renderView(view, params, fresh) {
  closeDropdowns();
  setHeaderAction("");
  switch (view) {
    case "home": renderHome(); break;
    case "cafes": renderList("cafes"); break;
    case "attractions": renderList("places"); break;
    case "filter": renderFilter(); break;
    case "detail": renderDetail(params, fresh); break;
    case "reviewForm": if (fresh) resetReviewForm(); break;
    case "recent": renderIdList("recentCards", state.recent, "최근 본 매장이 없어요"); break;
    case "favorites": renderIdList("favoriteCards", state.favorites, "찜한 매장 없음"); break;
    case "profile": renderProfile(); break;
  }
}

function navigate(view, params = {}, opts = {}) {
  if (view === "profile" && !state.user) view = "login";
  if (!$("#" + view)) view = "home";
  state.current = { view, params };
  state.tab = tabFor(view, params);
  if (view === "filter") state.filterFrom = params.from || state.filterFrom;
  if (view === "reviewForm") state.reviewTarget = params.id;
  $$(".view").forEach(v => v.classList.toggle("active", v.id === view));
  $$(".bottom-nav button").forEach(b => { const on = b.dataset.tab === state.tab; b.classList.toggle("active", on); on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"); });
  renderView(view, params, true);
  if (!opts.fromPop) { try { history[opts.replace ? "replaceState" : "pushState"]({ view, params }, ""); } catch (e) { /* 무시 */ } }
  window.scrollTo(0, 0);
}
window.addEventListener("popstate", e => { const s = e.state || { view: "home", params: {} }; navigate(s.view, s.params, { fromPop: true }); });

/* ---------- 이벤트 ---------- */
document.addEventListener("click", e => {
  const t = e.target;
  if (!t.closest(".dd")) closeDropdowns();
  if (!t.closest(".star-select")) setStarOpen(false);

  const go = t.closest("[data-go]");
  if (go) { navigate(go.dataset.go, go.dataset.from ? { from: go.dataset.from } : {}); return; }

  const open = t.closest("[data-open]");
  if (open) { const [kind, id] = open.dataset.open.split(":"); navigate("detail", { kind, id: Number(id), tab: state.tab }); return; }

  const fav = t.closest("[data-fav]");
  if (fav) {
    const id = Number(fav.dataset.fav);
    state.favorites = state.favorites.includes(id) ? state.favorites.filter(n => n !== id) : [...state.favorites, id];
    store("favorites", state.favorites);
    toast(state.favorites.includes(id) ? "찜한 매장에 추가했어요." : "찜한 매장에서 삭제했어요.");
    renderView(state.current.view, state.current.params, false);
    return;
  }

  const write = t.closest("[data-write-review]");
  if (write) { navigate("reviewForm", { id: Number(write.dataset.writeReview), tab: state.tab }); return; }

  if (t.closest("[data-reset]")) { resetFilters(); onFilterChange(); return; }

  const more = t.closest("[data-more]");
  if (more) { state.limit[more.dataset.more] += PAGE_SIZE; renderView(state.current.view, state.current.params, false); return; }

  const star = t.closest("[data-star]");
  if (star) { state.rating = Number(star.dataset.star); renderStars(); setStarOpen(false); return; }
  if (t.closest("#starToggle")) { setStarOpen($("#starList").hidden); }
});

$("#filterGroups").addEventListener("change", e => {
  const box = e.target.closest("input[data-group]"); if (!box) return;
  const arr = state.filters[box.dataset.group];
  state.filters[box.dataset.group] = box.checked ? [...arr, box.value] : arr.filter(v => v !== box.value);
  state.limit = { cafes: PAGE_SIZE, places: PAGE_SIZE };
});
$("#filterApply").addEventListener("click", () => navigate(state.filterFrom));

$("#reviewFormEl").addEventListener("submit", async e => {
  e.preventDefault();
  if (!state.rating) { toast("별점을 선택해 주세요."); return; }
  const content = $("#reviewContent").value.trim();
  if (!content) { toast("후기 내용을 입력해 주세요."); return; }
  let image = "";
  const file = $("#reviewImage").files[0];
  if (file) {
    if (!file.type.startsWith("image/")) { toast("사진 파일만 올릴 수 있어요."); return; }
    if (file.size > 5 * 1024 * 1024) { toast("사진은 5MB 이하만 올릴 수 있어요."); return; }
    image = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(file); });
  }
  reviews.push({ id: Math.max(0, ...reviews.map(r => r.id)) + 1, cafeId: state.reviewTarget, author: state.user?.name || "방문자", rating: state.rating, content, image, date: new Date().toISOString().slice(0, 10) });
  toast("후기가 등록되었어요. (현재 화면의 임시 데이터)");
  navigate("detail", { kind: "cafe", id: state.reviewTarget, tab: state.current.params.tab });
});

$("#loginForm").addEventListener("submit", e => {
  e.preventDefault();
  // 데모 로그인 : 서버 인증 없이 입력한 아이디로 로그인 상태를 만든다.
  state.user = { name: $("#loginId").value.trim(), pet: "대형견", region: "양천구" };
  $("#loginForm").reset();
  toast("로그인되었어요. (데모)");
  navigate("profile");
});
$("#signupForm").addEventListener("submit", e => {
  e.preventDefault();
  if ($("#signupPassword").value !== $("#signupPasswordConfirm").value) { toast("비밀번호가 일치하지 않아요."); return; }
  $("#signupForm").reset();
  toast("회원가입이 완료되었어요. 로그인해 주세요. (데모)");
  navigate("login");
});

/* ---------- 시작 ---------- */
async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} (${res.status})`);
  return res.json();
}
async function init() {
  try {
    const [rawCafes, rawPlaces] = await Promise.all([loadJson(DATA_FILES.cafes), loadJson(DATA_FILES.places)]);
    cafes = rawCafes.map(r => normalize(r, "cafe"));
    places = rawPlaces.map(r => normalize(r, "place"));
  } catch (err) {
    $("main").innerHTML = `<div class="error-box"><strong>데이터를 불러오지 못했어요.</strong><p>index.html을 더블클릭해서 열면 JSON을 읽을 수 없어요. 프로젝트 폴더에서 로컬 서버로 열어 주세요.</p><code>python -m http.server 8000</code><p>그 뒤 <code>http://localhost:8000</code> 으로 접속하세요. (VS Code Live Server도 가능)</p></div>`;
    console.error(err);
    return;
  }
  state.favorites = (store("favorites") || []).filter(id => cafes.some(c => c.id === id));
  state.recent = (store("recent") || []).filter(id => cafes.some(c => c.id === id));

  buildRegionData();
  regionDropdown("#ddCafeRegion", false);
  regionDropdown("#ddPlaceRegion", false);
  regionDropdown("#ddFilterRegion", true);
  createDropdown($("#ddFilterDong"), {
    caret: true,
    label: () => state.filters.dong || "세부 지역",
    value: () => state.filters.dong,
    options: dongOptions,
    disabled: () => !state.filters.region,
    onSelect: v => { state.filters.dong = v; onFilterChange(); }
  });
  renderStars();
  history.scrollRestoration = "manual";
  navigate("home", {}, { replace: true });
}
init();
