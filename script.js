// 예시 데이터입니다. 실제 카페 정보로 교체해 주세요.
    const cafes = [
      {
        id: 1, name: "포근한 오후", region: "마포구", address: "서울 마포구 연남동",
        image: "", emoji: "🐕", description: "반려견과 함께 쉬어 가기 좋은 아늑한 카페예요.",
        businessHours: [
          {open:"09:00",close:"21:00"},{open:"09:00",close:"21:00"},
          {open:"09:00",close:"21:00"},{open:"09:00",close:"21:00"},
          {open:"09:00",close:"22:00"},{open:"10:00",close:"22:00"},null
        ],
        closedDays: ["일요일"], conditions: {indoor:true,outdoor:true,smallDog:true,largeDog:false},
        facilities: {parking:false,outdoorSpace:true,waterBowl:true},
        rating: 4.7, reviewCount: 2, tags: ["실내 동반","야외 공간"]
      },
      {
        id: 2, name: "꼬리살랑 커피", region: "성동구", address: "서울 성동구 성수동",
        image: "", emoji: "🐩", description: "산책하다 잠깐 들르기 좋은 밝은 분위기의 공간이에요.",
        businessHours: [
          {open:"10:00",close:"20:00"},{open:"10:00",close:"20:00"},
          {open:"10:00",close:"20:00"},{open:"10:00",close:"20:00"},
          {open:"10:00",close:"21:00"},{open:"10:00",close:"21:00"},null
        ],
        closedDays: ["일요일"], conditions: {indoor:true,outdoor:false,smallDog:true,largeDog:true},
        facilities: {parking:true,outdoorSpace:false,waterBowl:true},
        rating: 4.5, reviewCount: 1, tags: ["주차 가능","대형견 가능"]
      },
      {
        id: 3, name: "느긋한 발걸음", region: "종로구", address: "서울 종로구 삼청동",
        image: "", emoji: "🐶", description: "주변 산책 코스와 함께 방문하기 좋은 카페예요.",
        businessHours: [
          {open:"11:00",close:"19:00"},null,{open:"11:00",close:"19:00"},
          {open:"11:00",close:"19:00"},{open:"11:00",close:"20:00"},
          {open:"10:00",close:"20:00"},{open:"10:00",close:"18:00"}
        ],
        closedDays: ["화요일"], conditions: {indoor:false,outdoor:true,smallDog:true,largeDog:true},
        facilities: {parking:false,outdoorSpace:true,waterBowl:false},
        rating: 4.2, reviewCount: 1, tags: ["야외 동반","산책 추천"]
      },
      {
        id: 4, name: "댕댕 쉼터", region: "마포구", address: "서울 마포구 망원동",
        image: "", emoji: "🐕‍🦺", description: "넓은 야외 공간에서 반려동물과 여유를 즐겨 보세요.",
        businessHours: [
          {open:"10:00",close:"20:00"},{open:"10:00",close:"20:00"},
          {open:"10:00",close:"20:00"},{open:"10:00",close:"20:00"},
          {open:"10:00",close:"21:00"},{open:"10:00",close:"21:00"},{open:"10:00",close:"18:00"}
        ],
        closedDays: [], conditions: {indoor:false,outdoor:true,smallDog:true,largeDog:false},
        facilities: {parking:true,outdoorSpace:true,waterBowl:true},
        rating: 4.8, reviewCount: 3, tags: ["야외 공간","물그릇 제공"]
      },
      {
        id: 5, name: "오늘도 함께", region: "성동구", address: "서울 성동구 서울숲 인근",
        image: "", emoji: "🐾", description: "반려동물과 함께 가볍게 쉬어 갈 수 있는 공간이에요.",
        businessHours: [
          {open:"08:30",close:"20:00"},{open:"08:30",close:"20:00"},
          {open:"08:30",close:"20:00"},{open:"08:30",close:"20:00"},
          {open:"08:30",close:"21:00"},{open:"09:00",close:"21:00"},{open:"09:00",close:"19:00"}
        ],
        closedDays: [], conditions: {indoor:true,outdoor:true,smallDog:true,largeDog:true},
        facilities: {parking:true,outdoorSpace:true,waterBowl:true},
        rating: 4.6, reviewCount: 4, tags: ["실내 동반","주차 가능"]
      }
    ];
    const attractions = [
      {id:1,region:"마포구",name:"경의선숲길",emoji:"🌳",description:"도심 속에서 산책과 휴식을 즐길 수 있는 산책로예요."},
      {id:2,region:"마포구",name:"홍대거리",emoji:"🎨",description:"다양한 상점과 문화 공간이 모여 있는 활기찬 거리예요."},
      {id:3,region:"종로구",name:"북촌한옥마을",emoji:"🏘️",description:"전통 한옥이 이어지는 골목 풍경을 둘러볼 수 있어요."},
      {id:4,region:"종로구",name:"경복궁 주변",emoji:"🏯",description:"역사적인 건축물과 주변 거리를 함께 둘러보기 좋아요."},
      {id:5,region:"성동구",name:"서울숲",emoji:"🌿",description:"산책과 휴식을 즐기기 좋은 넓은 도심 공원이에요."}
    ];
    let reviews = [
      {id:1,cafeId:1,author:"산책하는 강아지",rating:5,content:"실내외 공간이 있어 좋았고 물그릇도 편리했어요.",date:"2026-10-01"},
      {id:2,cafeId:1,author:"커피산책",rating:4,content:"분위기가 편안해요. 주말에는 조금 붐볐어요.",date:"2026-10-04"},
      {id:3,cafeId:2,author:"꼬리별",rating:5,content:"주차가 가능해서 방문하기 편했어요.",date:"2026-10-07"},
      {id:4,cafeId:3,author:"산책친구",rating:4,content:"야외에서 함께 시간을 보내기 좋았어요.",date:"2026-10-09"}
    ];
    let favoriteCafeIds = [];
    let recentCafeIds = [];
    let currentCafeId = 1;
    let currentView = "home";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const dayNames = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
    const weekdayIndex = () => (new Date().getDay() + 6) % 7; // 월요일=0 ... 일요일=6
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[ch]));
    const averageRating = (cafe) => {
      const list = reviews.filter(r => r.cafeId === cafe.id);
      return list.length ? (list.reduce((sum,r)=>sum + Number(r.rating),0)/list.length).toFixed(1) : Number(cafe.rating).toFixed(1);
    };
    const reviewCount = (cafe) => reviews.filter(r => r.cafeId === cafe.id).length;
    function toast(message) {
      const node = $("#toast");
      node.textContent = message;
      node.style.display = "block";
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => node.style.display = "none", 2300);
    }
    function showView(viewId) {
      if (!$("#" + viewId)) viewId = "home";
      currentView = viewId;
      $$(".view").forEach(view => view.classList.toggle("active", view.id === viewId));
      $$(".nav-btn, .bottom-nav button").forEach(button => button.classList.toggle("active", button.dataset.view === viewId));
      window.scrollTo({top:0,behavior:"smooth"});
      if (viewId === "list") renderCafeList();
      if (viewId === "recent") renderIdList("recentCards", recentCafeIds, "최근 본 매장이 없습니다.");
      if (viewId === "favorites") renderIdList("favoriteCards", favoriteCafeIds, "찜한 매장이 없습니다.");
    }
    function photoMarkup(cafe, className) {
      if (cafe.image) return `<div class="${className}" style="background-image:url('${escapeHtml(cafe.image)}');background-size:cover;background-position:center" role="img" aria-label="${escapeHtml(cafe.name)}"></div>`;
      return `<div class="${className}" aria-label="${escapeHtml(cafe.name)}">${cafe.emoji || "☕"}</div>`;
    }
    function cafeCard(cafe, compact = false) {
      return `<article class="${compact ? "cafe-card" : "list-card"}">
        ${photoMarkup(cafe, compact ? "cafe-photo" : "list-photo")}
        <div class="${compact ? "cafe-info" : "list-info"}">
          <div class="tag-row">${(cafe.tags || []).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          <div class="cafe-title-row"><h3>${escapeHtml(cafe.name)}</h3><span class="rating">★ ${averageRating(cafe)}</span></div>
          <p>📍 ${escapeHtml(cafe.address)} · 후기 ${reviewCount(cafe)}개</p>
          <p>${escapeHtml(cafe.description)}</p>
          <div class="card-actions">
            <button class="primary-btn" data-open-cafe="${cafe.id}">상세 보기</button>
            <button class="outline-btn ${favoriteCafeIds.includes(cafe.id) ? "saved" : ""}" data-favorite="${cafe.id}">${favoriteCafeIds.includes(cafe.id) ? "♥ 찜함" : "♡ 찜하기"}</button>
          </div>
        </div>
      </article>`;
    }
    function renderHome() {
      $("#recommendedCards").innerHTML = [...cafes].sort((a,b)=>Number(averageRating(b))-Number(averageRating(a))).slice(0,3).map(c=>cafeCard(c,true)).join("");
    }
    function getFilteredCafes() {
      const region = $("#regionFilter").value;
      const time = $("#timeFilter").value;
      const checks = [
        ["indoorFilter",c=>c.conditions.indoor],
        ["outdoorFilter",c=>c.conditions.outdoor],
        ["smallDogFilter",c=>c.conditions.smallDog],
        ["largeDogFilter",c=>c.conditions.largeDog],
        ["parkingFilter",c=>c.facilities.parking],
        ["outdoorSpaceFilter",c=>c.facilities.outdoorSpace],
        ["waterBowlFilter",c=>c.facilities.waterBowl]
      ];
      let result = cafes.filter(cafe => {
        if (region && cafe.region !== region) return false;
        for (const [id, test] of checks) if ($("#"+id).checked && !test(cafe)) return false;
        if (time) {
          const hours = cafe.businessHours[weekdayIndex()];
          if (!hours || time < hours.open || time >= hours.close) return false;
        }
        return true;
      });
      const sort = $("#sortFilter").value;
      if (sort === "rating") result.sort((a,b)=>Number(averageRating(b))-Number(averageRating(a)));
      else if (sort === "name") result.sort((a,b)=>a.name.localeCompare(b.name,"ko"));
      else result.sort((a,b)=>Number(averageRating(b))-Number(averageRating(a)));
      return result;
    }
    function renderCafeList() {
      const result = getFilteredCafes();
      $("#resultCount").textContent = `총 ${result.length}개의 카페`;
      $("#cafeResults").innerHTML = result.length ? result.map(c=>cafeCard(c,false)).join("") : `<div class="empty">조건에 맞는 카페가 없어요. 필터를 바꿔 보세요.</div>`;
    }
    function renderIdList(containerId, ids, emptyText) {
      const result = ids.map(id=>cafes.find(c=>c.id===id)).filter(Boolean);
      $("#"+containerId).innerHTML = result.length ? result.map(c=>cafeCard(c,false)).join("") : `<div class="empty">${emptyText}</div>`;
    }
    function renderAttractions() {
      $("#attractionCards").innerHTML = attractions.map(a=>`<article class="attraction-card"><div class="attraction-photo">${a.emoji}</div><div><span class="tag">${escapeHtml(a.region)}</span><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.description)}</p></div></article>`).join("");
    }
    function openCafe(id) {
      const cafe = cafes.find(c=>c.id===Number(id));
      if (!cafe) return;
      currentCafeId = cafe.id;
      recentCafeIds = [cafe.id, ...recentCafeIds.filter(n=>n!==cafe.id)].slice(0,10);
      const list = reviews.filter(r=>r.cafeId===cafe.id);
      const hoursHtml = cafe.businessHours.map((h,i)=>`<dt>${["월요일","화요일","수요일","목요일","금요일","토요일","일요일"][i]}</dt><dd>${h ? `${h.open}–${h.close}` : "휴무"}</dd>`).join("");
      $("#detailContent").innerHTML = `
        <div class="detail-grid">
          <div>${photoMarkup(cafe,"detail-photo")}</div>
          <div><div class="tag-row">${(cafe.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
            <h1>${escapeHtml(cafe.name)}</h1><div class="rating">★ ${averageRating(cafe)} · 후기 ${reviewCount(cafe)}개</div>
            <p class="detail-description">${escapeHtml(cafe.description)}</p>
            <div class="panel"><dl class="detail-facts">
              <dt>주소</dt><dd>${escapeHtml(cafe.address)}</dd>
              <dt>정기 휴무</dt><dd>${cafe.closedDays.length ? cafe.closedDays.join(", ") : "정기 휴무 없음"}</dd>
              <dt>동반 조건</dt><dd>${Object.entries(cafe.conditions).filter(([,v])=>v).map(([k])=>({indoor:"실내",outdoor:"야외",smallDog:"소형견",largeDog:"대형견"}[k])).join(", ") || "정보 없음"}</dd>
              <dt>편의 시설</dt><dd>${Object.entries(cafe.facilities).filter(([,v])=>v).map(([k])=>({parking:"주차",outdoorSpace:"야외 공간",waterBowl:"물그릇"}[k])).join(", ") || "정보 없음"}</dd>
            </dl></div>
          </div>
        </div>
        <div class="panel"><h3>영업시간</h3><dl class="detail-facts">${hoursHtml}</dl></div>
        <div class="panel"><div class="section-head" style="margin-top:0"><div><h3 style="margin:0">방문 후기</h3><p>이용자의 경험을 확인해 보세요.</p></div><button class="primary-btn" data-write-review="${cafe.id}">후기 작성</button></div>
          ${list.length ? list.map(r=>`<div class="review"><div class="cafe-title-row"><strong>${escapeHtml(r.author||"사용자")}</strong><span class="rating">★ ${Number(r.rating).toFixed(1)}</span></div><small style="color:var(--muted)">${escapeHtml(r.date)}</small><p>${escapeHtml(r.content)}</p>${r.image ? `<p><a href="${escapeHtml(r.image)}" target="_blank" rel="noopener">리뷰 사진 보기</a></p>` : ""}</div>`).join("") : `<div class="empty">아직 등록된 후기가 없습니다.</div>`}
        </div>`;
      showView("detail");
    }
    function resetFilters() {
      ["indoorFilter","outdoorFilter","smallDogFilter","largeDogFilter","parkingFilter","outdoorSpaceFilter","waterBowlFilter"].forEach(id=>$("#"+id).checked=false);
      $("#regionFilter").value=""; $("#timeFilter").value=""; $("#sortFilter").value="recommended";
      renderCafeList();
    }
    document.addEventListener("click", event => {
      const viewButton = event.target.closest("[data-view]");
      if (viewButton) {
        if (viewButton.id === "bottomReviewButton") {
          showView("list");
          toast("후기를 작성할 카페를 선택한 뒤 상세 화면에서 ‘후기 작성’을 눌러 주세요.");
          return;
        }
        showView(viewButton.dataset.view);
        return;
      }
      const openButton = event.target.closest("[data-open-cafe]");
      if (openButton) { openCafe(openButton.dataset.openCafe); return; }
      const favoriteButton = event.target.closest("[data-favorite]");
      if (favoriteButton) {
        const id = Number(favoriteButton.dataset.favorite);
        favoriteCafeIds = favoriteCafeIds.includes(id) ? favoriteCafeIds.filter(n=>n!==id) : [...favoriteCafeIds,id];
        renderHome(); renderCafeList();
        if (currentView==="favorites") renderIdList("favoriteCards",favoriteCafeIds,"찜한 매장이 없습니다.");
        toast(favoriteCafeIds.includes(id) ? "찜한 매장에 추가했어요." : "찜한 매장에서 삭제했어요.");
        return;
      }
      const reviewButton = event.target.closest("[data-write-review]");
      if (reviewButton) {
        currentCafeId = Number(reviewButton.dataset.writeReview);
        showView("reviewFormView");
      }
    });
    $("#homeSearchBtn").addEventListener("click", () => {
      const q = $("#homeSearch").value.trim().toLowerCase();
      showView("list");
      $("#regionFilter").value="";
      renderCafeList();
      if (q) {
        const result = cafes.filter(c => `${c.name} ${c.region} ${c.address} ${c.description}`.toLowerCase().includes(q));
        $("#resultCount").textContent = `검색어 "${q}" · ${result.length}개의 카페`;
        $("#cafeResults").innerHTML = result.length ? result.map(c=>cafeCard(c,false)).join("") : `<div class="empty">검색 결과가 없습니다.</div>`;
      }
    });
    $("#homeSearch").addEventListener("keydown", e => { if(e.key==="Enter") $("#homeSearchBtn").click(); });
    ["regionFilter","timeFilter","sortFilter","indoorFilter","outdoorFilter","smallDogFilter","largeDogFilter","parkingFilter","outdoorSpaceFilter","waterBowlFilter"].forEach(id => {
      $("#"+id).addEventListener("change", renderCafeList);
    });
    $("#resetFilters").addEventListener("click", resetFilters);
    $("#backToDetail").addEventListener("click", () => openCafe(currentCafeId));
    $("#reviewForm").addEventListener("submit", event => {
      event.preventDefault();
      const content = $("#reviewContent").value.trim();
      if (!content) return;
      const image = $("#reviewImage").value.trim();
      reviews.push({
        id: reviews.length ? Math.max(...reviews.map(r=>r.id))+1 : 1,
        cafeId: currentCafeId, author: "방문자", rating: Number($("#reviewRating").value),
        content, image, date: new Date().toISOString().slice(0,10)
      });
      $("#reviewForm").reset();
      toast("후기가 등록되었어요. (현재 브라우저 화면의 임시 데이터)");
      openCafe(currentCafeId);
    });
    $("#loginForm").addEventListener("submit", event => {
      event.preventDefault();
      toast("로그인 기능은 서버 연결 후 사용할 수 있어요.");
    });
    $("#signupForm").addEventListener("submit", event => {
      event.preventDefault();
      if ($("#signupPassword").value !== $("#signupPasswordConfirm").value) {
        toast("비밀번호가 일치하지 않아요."); return;
      }
      toast("회원가입 기능은 서버 연결 후 사용할 수 있어요.");
    });

    renderHome();
    renderCafeList();
    renderAttractions();


// 필터 패널 열기/닫기
const filterToggle = document.querySelector("#filterToggle");
const filterContent = document.querySelector("#filterContent");
if (filterToggle && filterContent) {
  filterToggle.addEventListener("click", () => {
    const isExpanded = filterToggle.getAttribute("aria-expanded") === "true";
    filterToggle.setAttribute("aria-expanded", String(!isExpanded));
    filterContent.hidden = isExpanded;
    filterToggle.querySelector(".filter-toggle-icon").textContent = isExpanded ? "+" : "−";
  });
}
