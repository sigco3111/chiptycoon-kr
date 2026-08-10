/* park.js: the layout of the fab park.
   Routes the wafer cart drives, the stops it halts at, the buildings, and the
   scenery. Everything here is static data plus one painter per building. */
(function (global) {
  'use strict';

  var Iso = global.Iso;

  /* ---- routes ------------------------------------------------------------ */

  function makeRoute(raw) {
    var pts = raw.map(function (p) { return { x: p[0], y: p[1], z: p[2] || 0 }; });
    var segs = [], total = 0, cum = [0];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var len = Math.hypot(b.x - a.x, b.y - a.y) || 0.001;
      segs.push({ a: a, b: b, len: len, cum: total });
      total += len;
      cum.push(total);
    }
    return {
      pts: pts, segs: segs, total: total, cum: cum,
      at: function (d) {
        var s;
        if (d <= 0) {
          s = segs[0];
          return { x: s.a.x, y: s.a.y, z: s.a.z, dx: (s.b.x - s.a.x) / s.len, dy: (s.b.y - s.a.y) / s.len };
        }
        if (d >= total) {
          s = segs[segs.length - 1];
          return { x: s.b.x, y: s.b.y, z: s.b.z, dx: (s.b.x - s.a.x) / s.len, dy: (s.b.y - s.a.y) / s.len };
        }
        for (var i = 0; i < segs.length; i++) {
          s = segs[i];
          if (d <= s.cum + s.len) {
            var t = (d - s.cum) / s.len;
            return {
              x: s.a.x + (s.b.x - s.a.x) * t,
              y: s.a.y + (s.b.y - s.a.y) * t,
              z: s.a.z + (s.b.z - s.a.z) * t,
              dx: (s.b.x - s.a.x) / s.len, dy: (s.b.y - s.a.y) / s.len
            };
          }
        }
      }
    };
  }

  /* Act 1 along the top, then Act 2 back along the second row. */
  var INTAKE = makeRoute([
    [-1, 10],      //  0 the park gate
    [ 6, 10],      //  1 sand pit
    [15, 10],      //  2 furnace
    [24, 10],      //  3 purifier
    [33, 10],      //  4 crystal puller
    [42, 10],      //  5 wire saw
    [51, 10],      //  6 polisher
    [57, 10],      //  7 corner
    [57, 15],      //  8
    [53, 17.5],    //  9
    [46, 17.5],    // 10 design lab
    [36, 17.5],    // 11 mask shop
    [26, 17.5],    // 12 cleanroom gate
    [20, 17.5],    // 13
    [16, 21]       // 14 into the loop
  ]);

  /* The photolithography ring. Every lap is one more layer on the wafer. */
  var LOOP = makeRoute([
    [16, 21],      //  0 entry
    [23, 22.5],    //  1 layer tube
    [31, 22.5],    //  2 spin coater
    [39, 22.5],    //  3 the printer
    [45, 23],      //  4
    [48, 26],      //  5
    [47, 30],      //  6
    [43, 33],      //  7
    [36, 33],      //  8 etch bay
    [28, 33],      //  9 ion gun
    [21, 33],      // 10 wire floor
    [16, 32],      // 11
    [13, 29],      // 12
    [13, 25],      // 13 the loop counter
    [16, 21]       // 14 back to the entry
  ]);

  var EXIT = makeRoute([
    [13, 25],      //  0 off the counter
    [ 9, 29],
    [ 9, 35],
    [13, 39],
    [22, 39],      //  4 test bay
    [31, 39],      //  5 dicing saw
    [40, 39],      //  6 packaging
    [49, 39],      //  7 shipping gate
    [56, 39]       //  8 loading dock
  ]);

  /* The delivery run. The chips leave the fab on a lorry and are driven to the
     data centre off the east side of the park, which is where they go to work. */
  var DELIVER = makeRoute([
    [56, 39],      //  0 out of the loading dock
    [62, 38.5],
    [66, 35.5],
    [66.5, 31],
    [64.5, 28.5],
    [59.2, 27.6]   //  5 the data centre bay
  ]);

  /* The empty lorry drives back round the outside of the park for the next batch. */
  var RETURN = makeRoute([
    [59.2, 27.6], [64.5, 28.5], [66.5, 31], [66, 35.5], [64, 42], [59, 47],
    [6, 47], [1, 42], [1, 14], [-1, 11.5], [-1, 10]
  ]);

  var ROUTES = { intake: INTAKE, loop: LOOP, exit: EXIT, deliver: DELIVER, ret: RETURN };

  /* `dwell` is the pause once you have already read a stop. The much longer
     first visit is derived from how much there is to read; see readSeconds. */
  function station(route, idx, id, dwell) {
    return { dist: route.cum[idx], id: id, dwell: dwell == null ? 0.9 : dwell };
  }

  var STATIONS = {
    intake: [
      station(INTAKE, 1, 'sand', 1.5), station(INTAKE, 2, 'furnace', 1.5),
      station(INTAKE, 3, 'purify', 1.5), station(INTAKE, 4, 'crystal', 2.2),
      station(INTAKE, 5, 'saw', 1.5), station(INTAKE, 6, 'polish', 1.5),
      station(INTAKE, 10, 'design', 1.3), station(INTAKE, 11, 'mask', 1.3),
      station(INTAKE, 12, 'cleanroom', 1.3)
    ],
    loop: [
      station(LOOP, 1, 'layer', 1.1), station(LOOP, 2, 'resist', 1.1),
      station(LOOP, 3, 'litho', 2.6), station(LOOP, 8, 'etch', 1.2),
      station(LOOP, 9, 'dope', 1.2), station(LOOP, 10, 'wiring', 1.2),
      station(LOOP, 13, 'loopct', 1.4)
    ],
    exit: [
      station(EXIT, 4, 'test', 1.6), station(EXIT, 5, 'dice', 1.5),
      station(EXIT, 6, 'pack', 1.5), station(EXIT, 7, 'ship', 2.0),
      station(EXIT, 8, 'dock', 1.8)
    ],
    deliver: [ station(DELIVER, 5, 'datacenter', 2.6) ],
    ret: [ station(RETURN, 7, 'newbatch', 1.0) ]
  };

  /* ---- palette ----------------------------------------------------------- */

  var C = {
    grass:    '#5d9c3f',
    grassAlt: '#569439',
    path:     '#cbb68e',
    pathEdge: '#b09a72',
    slab:     '#9aa4ae',
    floor:    '#d8e2ea',
    sand:     '#dcc487',
    steel:    '#b9c3cd',
    steelDk:  '#7f8b98',
    dark:     '#5b6470',
    white:    '#eef3f7',
    teal:     '#3fb5a0',
    copper:   '#c9793f',
    gold:     '#f2c14e',
    red:      '#c8453a',
    blue:     '#3f7fd4',
    violet:   '#9a5fd0',
    brick:    '#a2402f',
    wood:     '#6b4a2b',
    hot:      '#ff9a3c'
  };

  /* ---- the twenty two stops -------------------------------------------------- */

  var STOPS = [
    { id: 'sand', name: '모래 채굴장', act: 1, tag: '원료', x: 6, y: 10, r: 5,
      short: '칩은 보통 모래로 시작합니다.',
      body: '해변 모래가 아닙니다. 공장들은 석영 모래를 쓰는데, 이는 실리카라는 광물이 매우 많이 들어 있는 모래입니다. 실리카는 산소에 붙잡혀 있는 실리콘입니다. 지구 지각의 약 4분의 1이 실리콘이라 절대 떨어지지 않습니다. 최고의 석영은 손에 꼽는 광산에서 나오며, 우리가 손대기도 전에 이미 희고 유리처럼 빛납니다.',
      tip: '이 공원 전체에서 모래가 가장 쌉니다. 칩 가격의 거의 전부는 원료값이 아니라 다음 19개 건물값입니다.' },

    { id: 'furnace', name: '용광로', act: 1, tag: '원료', x: 15, y: 10, r: 5,
      short: '모래를 탄소와 함께 가열하면 거친 실리콘이 남습니다.',
      body: '석영 모래와 탄소를 약 2000℃의 거대한 전기로에 넣습니다. 탄소는 산소를 탐욕스럽게 잡아채서 모래에서 산소를 빼앗고 가스로 빠져나갑니다. 바닥에서 흘러나오는 것은 약 99% 순도의 용융 실리콘입니다.',
      tip: '99%라면 훌륭해 보이지만, 목표는 99.9999999%입니다. 남은 1%를 처리하는 게 다음 건물의 전부입니다.' },

    { id: 'purify', name: '정제탑', act: 1, tag: '원료', x: 24, y: 10, r: 5,
      short: '실리콘을 기체로 바꾸고, 기체를 정제하고, 다시 고체로 되돌립니다.',
      body: '고체는 정제하기 어렵고 기체는 쉽습니다. 그래서 거친 실리콘을 실리콘 기체와 반응시키고, 더러움이 없어질 때까지 반복해서 끓입니다. 깨끗한 기체는 뜨거운 막대 위로 흘려보내고, 그 표면에 실리콘이 고체 crust로 내려앉습니다. 그 결과가 다결정 실리콘입니다. 9-nines 순도라, 수영장에 채운 설탕에서 단 한 알갱이만 다른 것입니다.',
      tip: '왜 이렇게까지 까다로울까요? 잘못된 종류의 떠돌이 원자 하나가 잘못된 자리에 앉기만 해도 스위치가 스위칭을 멈춥니다. 그 스위치가 수십억 개 있습니다.' },

    { id: 'crystal', name: '단결정 인발기', act: 1, tag: '원료', x: 33, y: 10, r: 5,
      short: '다결정 실리콘을 녹이고, 그 안에서 완전한 결정 하나를 천천히 끌어올립니다.',
      body: '다결정 실리콘은 사방으로 향한 작은 결정의 혼돈이지만, 칩은 모든 원자가 하나의 반복 격자에 줄지어 있어야 합니다. 그래서 용광로에서 녹이고, 작은 씨결정을 담갔다가, 회전시키며 위로 끌어올립니다. 실리콘이 씨결정에 얼어붙으며 그 정확한 배열을 그대로 복제합니다. 하루 이틀이 지나면, 길이 2미터, 무게 200kg 가량의 은빛 원기둥이 끝에서 끝까지 하나의 결정으로 자라납니다.',
      tip: '이 공원에서 가장 만족스러운 구간입니다. 너무 빨리 잡아당기면 결정이 울퉁불퉁해집니다. 인내 자체가 곧 공정입니다.' },

    { id: 'saw', name: '와이어 쏘', act: 1, tag: '원료', x: 42, y: 10, r: 5,
      short: '결정통을 살라미처럼 얇은 원형 판으로 잘라냅니다.',
      body: '다이아몬드 입자를 입힌 길고 가는 와이어로 만든 톱이 한 번에 수백 장을 잘라냅니다. 각 조각이 웨이퍼이고, 1mm 미만 두께이며, 칙칙한 회색 접시처럼 보입니다. 일부러 필요한 것보다 두껍게 잘라낸 것은, 여분의 실리콘이 로봇이 옮기는 동안 깨지는 걸 막아주기 때문입니다.',
      tip: '모든 웨이퍼에 새겨진 평평한 모서리나 노치를 보세요. 장식이 아닙니다. 기계에 결정 격자가 어느 방향을 향하는지 알려주는 표시입니다.' },

    { id: 'polish', name: '연마기', act: 1, tag: '원료', x: 51, y: 10, r: 5,
      short: '웨이퍼는 인간이 만드는 거의 모든 것보다 평평하게 연마됩니다.',
      body: '회전하는 패드와 우윳빛 액체가 표면을 매끄럽게 갈아냅니다. 먼저 거칠게, 그리고는 아주 부드럽게. 완성된 웨이퍼는 거울입니다. 축구장 크기로 부풀렸을 때 가장 큰 융기부도 동전 정도의 높이입니다. 이렇게까지 평평해야 하는 이유는, 곧 이 위에 빛으로 인쇄할 텐데 빛이 울퉁불퉁한 면 위에 초점을 맞출 수 없기 때문입니다.',
      tip: '이제 공원이 빈 웨이퍼를 판매합니다. 실제로 많은 회사들이 딱 이것만 하고 정확히 여기서 멈춥니다.' },

    { id: 'design', name: '설계실', act: 2, tag: '설계', x: 46, y: 17.5, r: 5,
      short: '아무것도 짓기 전에, 회로를 컴퓨터로 그립니다.',
      body: '칩은 트랜지스터라 불리는 수십억 개의 작은 스위치와, 그것을 잇는 배선으로 이루어진 지도입니다. 아무도 그것을 한 번에 하나씩 그리지 않습니다. 엔지니어들은 칩이 무엇을 해야 하는지를 특별한 언어로 기술하고, 소프트웨어가 배치를 계산합니다. 완성된 도면은 마치 건물의 층처럼 잘리고, 각 층이 이후의 인쇄 작업 한 번이 됩니다.',
      tip: '최신 대형 칩 한 개를 설계하는 데는 수백 명이 몇 년을 쓰고, 지금 서 있는 이 건물보다 비싼 비용이 듭니다.' },

    { id: 'mask', name: '마스크 작업실', act: 2, tag: '설계', x: 36, y: 17.5, r: 5,
      short: '도면의 각 층은 마스크라 불리는 유리 스텐실이 됩니다.',
      body: '마스크는 한 층의 패턴이 얇은 금속 막으로 새겨진, 매우 순도 높은 유리의 평평한 판입니다. 빛은 맑은 부분을 통과하고 금속 부분에서 막힙니다. 스텐실과 스프레이 캔처럼요. 한 칩 설계에는 한 세트 전체가 필요하고, 보통 60장 이상이며, 그 한 세트에 수백만 달러가 듭니다.',
      tip: '마스크의 패턴은 완성 칩보다 약 4배 크게 그려져 있습니다. 인쇄기가 그것을 축소합니다. 크게 그리고 작게 찍는 게, 작게 그리고 작게 찍는 것보다 훨씬 쉽습니다.' },

    { id: 'cleanroom', name: '클린룸 입구', act: 2, tag: '설계', x: 26, y: 17.5, r: 5,
      short: '여기서부터 모든 일은 수술실보다 깨끗한 공기 안에서 진행됩니다.',
      body: '인쇄되는 회로의 폭은 먼지 한 톨보다 훨씬 작기 때문에, 웨이퍼 위에 먼지가 한 톨 떨어지면 그 아래 칩은 망가집니다. 공기는 천장의 미세 필터를 통해 아래로 밀려 내려가고 바닥으로 빠져나가, 먼지가 자리 잡을 기회조차 없습니다. 사람들은 흰 전신 보호복을 입습니다. 사람 보호가 아니라 웨이퍼 보호입니다. 우리는 끊임없이 피부와 머리카락을 흘리니까요.',
      tip: '최고 수준의 클린룸은 1세제곱미터 공기 중에 먼지 입자가 10개도 안 됩니다. 우리 거실에는 수천만 개가 있습니다.' },

    { id: 'layer', name: '층 형성로', act: 3, tag: '루프', x: 23, y: 22.5, r: 4.5,
      short: '웨이퍼 전체를 얇은 유용한 막으로 코팅합니다.',
      body: '때로는 막을 직접 자라게 합니다. 웨이퍼를 산소와 함께 가열하면 실리콘 표면이 유리로 변하는데, 이는 뛰어난 절연체입니다. 때로는 증착합니다. 표면에 달라붙는 기체를 불어넣으면, 원자 단위로 금속이나 절연체가 쌓입니다. 이 막들은 믿을 수 없을 만큼 얇아서, 어떤 것은 원자 몇 개 두께밖에 안 됩니다. 지금은 막이 전체를 균일하게 덮고 있는데, 아직 우리가 원하는 모양은 아닙니다.',
      tip: '벽 전체를 한 가지 색으로 칠하는 일이라고 생각하세요. 다음 정류장들은 실제로 원하는 곳을 제외한 곳의 페인트를 긁어내는 일입니다.' },

    { id: 'resist', name: '스핀 코터', act: 3, tag: '루프', x: 31, y: 22.5, r: 4.5,
      short: '웨이퍼에 빛에 반응하는 액체인 포토레지스트를 바릅니다.',
      body: '웨이퍼가 빠르게 회전하는 가운데 중앙에 몇 방울 떨어뜨리면, 회전이 액체를 완벽하게 고르게 펼칩니다. 포토레지스트는 옛 카메라의 필름처럼 동작합니다. 빛이 닿은 곳만 변합니다. 그래서 작업장 전체는 노란 빛만 켜져 있고, 그래서 팹(fab) 사진은 항상 잠수함 안처럼 보입니다.',
      tip: '이 코팅은 인간 머리카락 두께의 1000분의 1 정도이며, 지름 30cm짜리 원판 위 어디서든 그 두께를 유지해야 합니다. 회전이 그 균일함을 얻는 가장 저렴한 방법입니다.' },

    { id: 'litho', name: '인쇄기', act: 3, tag: '루프', x: 39, y: 22.5, r: 5.5,
      short: '공장의 심장: 패턴이 웨이퍼에 사진처럼 찍힙니다.',
      body: '빛이 마스크를 통과해, 이미지를 축소하는 렌즈 더미를 지나, 코팅된 웨이퍼 위로 내려옵니다. 포토레지스트의 빛을 받은 부분은 변하고, 가려진 부분은 그대로입니다. 한 번에 작은 영역만 찍히고, 웨이퍼는 옆으로 옮겨가 다시 찍힙니다. 같은 칩의 복사본이 판 전체를 덮을 때까지 반복됩니다. 가장 정밀한 패턴은 EUV를 씁니다. 일반 유리에 흡수되고 공기조차 흡수할 만큼 까다로운 빛이라, 진공 상태에서 렌즈 대신 거울로 작동합니다.',
      tip: 'EUV 장비 한 대 가격은 수억 달러, 무게는 버스 두 대 분량, 수십 개 상자로 운송되며, 세계에서 단 한 회사만 만듭니다.' },

    { id: 'etch', name: '식각실', act: 3, tag: '루프', x: 36, y: 33, r: 4.5,
      short: '빛에 변한 젤을 씻어내고, 그 아래 층을 깎아냅니다.',
      body: '먼저 현상입니다. 빛을 받은 부분의 포토레지스트를 액체로 씻어내면, 그 젤 자체로 만든 스텐실이 남습니다. 이어서 식각입니다. 반응성 기체의 빛나는 구름이 드러난 층만 갉아먹지만, 가려진 부분은 손대지 못합니다. 마지막으로 남은 레지스트를 벗겨내면, 패턴이 진짜 고체 층에 새겨진 채로 남습니다.',
      tip: '식각은 옆으로가 아니라 바로 아래로만 깎아야 합니다. 옆으로 조금씩 갉아먹으면 설계된 모든 선이 두꺼워지고 회로가 서로 합선됩니다. 완벽한 수직 벽은 한 기술입니다.' },

    { id: 'dope', name: '이온 건', act: 3, tag: '루프', x: 28, y: 33, r: 4.5,
      short: '정해진 자리에 이물 원자를 발사해 실리콘의 전도성을 바꿉니다.',
      body: '순수 실리콘은 전기가 잘 흐르지 않습니다. 붕소나 인 같은 다른 원소를 흔적으로 섞으면 통제 가능한 방식으로 전기가 흐르게 됩니다. 이온 주입기가 그 원자들을 엄청난 속도로 가속해, 페인트 건처럼 웨이퍼에 쏘아붙여 표면 바로 아래에 묻습니다. 비어 있는 영역만 맞아들고, 나머지는 가려져 있습니다.',
      tip: '트랜지스터는 도핑한 patch 하나, 그 옆의 도핑한 patch 하나, 그리고 그 틈 위에 작은 게이트입니다. 게이트에 전압이 걸리면 전류가 흐르고, 전압이 없으면 멈춥니다. 그게 1과 0입니다.' },

    { id: 'wiring', name: '배선층', act: 3, tag: '루프', x: 21, y: 33, r: 4.5,
      short: '수십억 개의 스위치는 서로 연결되어야 비로소 쓸모가 있습니다.',
      body: '절연층에 트렌치를 깎고, 표면 전체를 구리로 채워 트렌치를 메우고, 남은 구리를 다시 연마해 없앱니다. 트렌치 안에 가지런히 자리 잡은 구리가 그대로 배선이 됩니다. 그 위에 또 다른 절연층을 입히고 같은 일이 반복됩니다. 최신 칩에는 트랜지스터 위에 12층 이상의 배선이 포개어 있습니다.',
      tip: '한 대의 큰 프로세서 안 배선을 모두 펴면, 우표 크기 칩 안에서 수십 킬로미터에 달합니다.' },

    { id: 'loopct', name: '루프 계산소', act: 3, tag: '루프', x: 13, y: 25, r: 4.5,
      short: '지금까지 한 층이었습니다. 실제 칩에는 약 60개 층이 필요합니다.',
      body: '마지막 여섯 정류장은 한 번뿐이 아니라, 몇 달 동안 반복되는 루프입니다. 층을 만들고, 코팅하고, 인쇄하고, 깎고, 도핑하거나 채우고, 평평하게 닦은 뒤, 다음 층을 위해 다시 시작합니다. 한 바퀴마다 다른 마스크를 쓰기 때문에, 매 바퀴마다 건물의 다른 층을 그립니다. 그리고 새로운 층은 아래 층과 나노미터 정밀도로 정렬되어야 합니다.',
      tip: '그래서 칩 한 개를 만드는 데 약 3개월이 걸리고, 웨이퍼는 완성될 때까지 팹 안에서 수 킬로미터를 돌아다닙니다. 기다리는 게 아니라 돌고 있는 겁니다.' },

    { id: 'test', name: '테스트 베이', act: 4, tag: '완성', x: 22, y: 39, r: 5,
      short: '웨이퍼 위 모든 칩에 간단한 시험을 봅니다.',
      body: '가는 바늘이 각 칩의 작은 금속 패드를 누르고, 시험 신호를 보내고, 응답을 확인합니다. 실패는 표시됩니다. 정상 라인에서는 대부분 통과하지만 전부 통과하진 않으며, 통과한 비율을 수율이라 부릅니다. 수율이 공원이 돈을 버는지 잃는지를 결정합니다.',
      tip: '한 코어가 고장 난 칩도 보통 버려지지 않습니다. 그 코어만 꺼버리고 더 싼 모델로 팔립니다. 가게에서 볼 수 있는 등급의 절반은 같은 칩을 등급별로 나눈 것입니다.' },

    { id: 'dice', name: '다이싱 쏘', act: 4, tag: '완성', x: 31, y: 39, r: 5,
      short: '둥근 판을 수백 개의 작은 사각형으로 잘라냅니다.',
      body: '다이아몬드 칼날 또는 레이저가 칩 사이로 일부러 비워둔 좁은 길을 따라 자릅니다. 잘려나온 사각형 하나를 다이라고 부르며, 손톱보다 얇습니다. 합격한 다이는 다음 공정으로 가고, 실패로 표시된 것은 버려집니다.',
      tip: '웨이퍼는 둥글지만 칩은 사각형이라, 웨이퍼 가장자리는 낭비됩니다. 웨이퍼가 커질수록 비율적으로 낭비가 적어지고, 그래서 업계는 계속 더 큰 웨이퍼로 옮겨갑니다.' },

    { id: 'pack', name: '패키징', act: 4, tag: '완성', x: 40, y: 39, r: 5,
      short: '벌거벗은 다이는 너무 연약해 쓸 수 없어, 케이스가 붙습니다.',
      body: '다이를 작은 기판에 붙이고, 기판의 금속 접점에 머리카락 굵기의 가는 금선이나 작은 솔더 볼로 연결한 뒤, 뚜껑이나 단단한 플라스틱外壳를 씌웁니다. 회로판에서 보이는 검은 사각형이 패키징이지 칩이 아닙니다. 패키징은 연결을 사람이 만든 회로판이 닿을 만큼 넓게 벌려놓고, 열을 밖으로 내보내는 역할도 합니다.',
      tip: '패키징은 한때 지루한 파트였습니다. 지금은 그 자체로 경쟁입니다. 여러 다이를 한 패키지에 쌓는 게, 단일 거대 칩을 만드는 것보다 쉬운 경우가 많기 때문입니다.' },

    { id: 'ship', name: '출하 게이트', act: 4, tag: '완성', x: 49, y: 39, r: 5,
      short: '최종 시험, 등급별 분류, 그리고 게이트 밖으로.',
      body: '이번에는 각 칩을 더위, 추위, 그리고 최고 속도로 시험합니다. 차분한 작업대에서는 멀쩡하던 칩이 뜨거운 노트북 안에서는 망가질 수 있기 때문입니다. 결과로 등급이 결정됩니다. 가장 빠르고 신뢰성 높은 것은 최고가에 팔리고, 나머지는 더 싼 모델에 채워집니다. 그리고 트레이와 릴에 세어 담아 밀봉한 뒤, 옆 상하차장으로 운반합니다.',
      tip: '모래가 첫 정류장에서 들어와, 약 3개월과 수백 단계의 정성스러운 작업을 거쳐, 여기 게이트에서 작동하는 칩이 나옵니다. 정류장 두 개가 남았습니다. 실제로 어디로 가는지 지켜보세요.' },

    { id: 'dock', name: '상하차장', act: 5, tag: '배송', x: 56.6, y: 42.2, r: 5,
      short: '완성된 칩을 트럭에 쌓아 올립니다.',
      body: '밀봉된 트레이는 방습 백에 들어가고, 백은 박스에, 박스는 팔레트로, 팔레트는 끈으로 고정되어 트럭에 실립니다. 모든 박스에는 잘려나온 웨이퍼까지追溯할 수 있는 코드가 붙어 있어, 몇 달 뒤 결함이 발견되어도 배치 전체를 추적할 수 있습니다. 대부분 화물이 가게로 곧장 가지는 않습니다. 보드 공장으로 가서 칩을 회로판에 납땜하고, 그 회로판을 서버에 조립합니다.',
      tip: '칩은 작고 비싸서, 트럭 한 대가 이 공원의 모든 건물 가치를 합친 것보다 더 비싼 짐을 실고 있을 수 있습니다.' },

    { id: 'datacenter', name: '데이터센터', act: 5, tag: '배송', x: 56, y: 24, r: 6,
      short: '칩은 랙에 꽂혀 전원이 들어오고 일을 시작합니다.',
      body: '서버가 랙에 미끄러져 들어가면, 랙이 저런 홀을 가득 채우고, 문이 닫힙니다. 전기는 한쪽 끝에서 들어오고 열은 반대쪽 끝에서 빠져나갑니다. 가득 찬 랙 한 대는 전기 난로 한 줄에서 나오는 만큼의 열을 내기 때문입니다. 여기서부터 당신이 따라간 칩은 향후 몇 년간 검색을 답하고, 영상을 스트리밍하고, 모델을 학습시키고, 당신이 읽는 페이지를 서빙합니다. 카트가 그 링을 한 바퀴 돌 때마다 쌓인 층이, 여기서 지금 초당 수십억 번 스위칭되고 있는 것입니다.',
      tip: '이제 끝입니다. 한 줌의 석영 모래가 첫 정류장에서 시작해, 스물두 번째 정류장의 생각하는 기계로 가득 찬 홀까지 갔습니다. 그리고 트럭은 다시 팹으로 돌아가, 다음 웨이퍼가 시작됩니다.' }
  ];

  var STOP_BY_ID = {};
  STOPS.forEach(function (s) { STOP_BY_ID[s.id] = s; });

  /* Reading stops are scaled to how much there is to read. */
  function readSeconds(id) {
    var s = STOP_BY_ID[id];
    if (!s) return 8;
    var words = (s.short + ' ' + s.body + ' ' + s.tip).split(/\s+/).length;
    return Math.min(22, Math.max(10, words / 4.4 + 3));
  }
  Object.keys(STATIONS).forEach(function (r) {
    STATIONS[r].forEach(function (st) { st.read = readSeconds(st.id); });
  });

  /* ---- ground ------------------------------------------------------------ */

  /* BOUNDS is what the camera frames. GROUND is drawn much larger so grass
     always fills the viewport instead of the park floating on a backdrop. */
  var BOUNDS = { x0: -4, y0: 2, x1: 69, y1: 49 };
  var GROUND = { x0: -420, y0: -400, x1: 470, y1: 460 };

  /* Paved lots under each cluster of buildings. */
  var LOTS = [
    { x: 2, y: 3.4, w: 8, d: 6.2, c: C.sand },
    { x: 11, y: 3.4, w: 8, d: 6.2, c: C.slab },
    { x: 20, y: 3.4, w: 8, d: 6.2, c: C.slab },
    { x: 29, y: 3.4, w: 8, d: 6.2, c: C.floor },
    { x: 38, y: 3.4, w: 8, d: 6.2, c: C.floor },
    { x: 47, y: 3.4, w: 8, d: 6.2, c: C.floor },
    { x: 41.5, y: 11.6, w: 9, d: 5.1, c: C.floor },
    { x: 31.5, y: 11.6, w: 9, d: 5.1, c: C.floor },
    { x: 21.5, y: 11.6, w: 9, d: 5.1, c: C.floor },
    { x: 18.6, y: 17.8, w: 8.4, d: 3.9, c: C.floor },
    { x: 27.4, y: 17.8, w: 7.6, d: 3.9, c: C.floor },
    { x: 35.4, y: 17.0, w: 9.0, d: 4.7, c: C.floor },
    { x: 31.6, y: 34.2, w: 8.6, d: 4.2, c: C.floor },
    { x: 23.6, y: 34.2, w: 7.6, d: 4.2, c: C.floor },
    { x: 15.6, y: 34.2, w: 7.6, d: 4.2, c: C.floor },
    { x: 6.4, y: 22.0, w: 6.2, d: 6.0, c: C.slab },
    { x: 17.6, y: 40.4, w: 8.6, d: 4.4, c: C.floor },
    { x: 26.6, y: 40.4, w: 8.6, d: 4.4, c: C.floor },
    { x: 35.6, y: 40.4, w: 8.6, d: 4.4, c: C.floor },
    { x: 44.6, y: 40.4, w: 9.0, d: 4.4, c: C.slab },
    { x: 53.6, y: 40.4, w: 5.8, d: 4.4, c: C.slab },
    /* the data centre off the east side, and the yard its lorries park in */
    { x: 50.2, y: 18.2, w: 10.4, d: 7.4, c: C.floor },
    { x: 50.6, y: 25.6, w: 11.4, d: 4.4, c: C.slab },
    /* the plaza inside the loop */
    { x: 20, y: 25, w: 24, d: 6.4, c: C.path }
  ];

  /* ---- building painters -------------------------------------------------- */

  var B = [];

  function add(o) { B.push(o); return o; }

  /* shared bits ---------------------------------------------------------- */

  function hall(ctx, x, y, w, d, h, body, roofC) {
    Iso.box(ctx, { x: x, y: y, w: w, d: d, h: h, color: body });
    Iso.gable(ctx, { x: x, y: y, z: h, w: w, d: d, h: Math.min(1.6, d * 0.34), color: roofC });
  }

  function machine(ctx, x, y, w, d, h, c, t, blinkSeed) {
    Iso.box(ctx, { x: x, y: y, w: w, d: d, h: 0.22, color: C.dark });
    Iso.box(ctx, { x: x + 0.1, y: y + 0.1, z: 0.22, w: w - 0.2, d: d - 0.2, h: h, color: c });
    var p = Iso.project(x + w * 0.5, y + d, 0.22 + h * 0.6);
    ctx.fillStyle = '#22303f';
    ctx.fillRect(p.x - 9, p.y - 8, 18, 12);
    ctx.fillStyle = '#4fd0c0';
    ctx.fillRect(p.x - 7, p.y - 6, 8, 8);
    ctx.fillStyle = (Math.sin(t * 4 + (blinkSeed || 0)) > 0) ? '#ff5f4d' : '#5c2b26';
    ctx.beginPath(); ctx.arc(p.x + 5, p.y - 2, 2.4, 0, 6.2832); ctx.fill();
  }

  function glow(ctx, x, y, z, r, t, c1, c2) {
    var k = 0.82 + 0.18 * Math.sin(t * 2.4);
    ctx.globalAlpha = k;
    ctx.fillStyle = c1 || C.hot;
    Iso.disc(ctx, x, y, z, r);
    ctx.fillStyle = c2 || '#fff0b8';
    Iso.disc(ctx, x, y, z + 0.01, r * 0.5);
    ctx.globalAlpha = 1;
  }

  function smoke(ctx, x, y, z, t) {
    for (var i = 0; i < 3; i++) {
      var k = ((t * 0.34) + i / 3) % 1;
      var p = Iso.project(x, y, z + k * 3.4);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - k)).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x + Math.sin(k * 4 + i) * 7, p.y, 5 + k * 11, 0, 6.2832);
      ctx.fill();
    }
  }

  function pipes(ctx, x, y, n, z, c) {
    for (var i = 0; i < n; i++) {
      Iso.box(ctx, { x: x + i, y: y, z: z, w: 1, d: 0.3, h: 0.3, color: c || '#8ea0b3' });
    }
  }

  /* wafer disc drawn flat, used all over the park */
  function waferDisc(ctx, x, y, z, r, c) {
    ctx.fillStyle = c;
    Iso.disc(ctx, x, y, z, r);
    ctx.strokeStyle = Iso.shade(c, 0.6);
    ctx.lineWidth = 1.2;
    Iso.discEdge(ctx, x, y, z, r);
    ctx.fillStyle = 'rgba(255,255,255,0.34)';
    Iso.disc(ctx, x - r * 0.28, y - r * 0.28, z + 0.005, r * 0.4);
  }

  /* --- act 1 ------------------------------------------------------------- */

  add({ id: 'sand', x: 3, y: 4, w: 6.6, d: 5, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 3.2, y: 4.2, w: 6, d: 4.4, h: 0.4, color: '#bfa268' });
    Iso.box(ctx, { x: 4.0, y: 4.8, w: 4.2, d: 3.2, h: 0.4, z: 0.4, color: '#d0b478' });
    Iso.box(ctx, { x: 4.9, y: 5.4, w: 2.4, d: 2.0, h: 0.4, z: 0.8, color: '#e5d09a' });
    /* digger, arm swinging slowly */
    var sw = Math.sin(t * 0.7) * 0.5;
    Iso.box(ctx, { x: 5.0, y: 5.6, z: 1.2, w: 1.5, d: 1.1, h: 0.3, color: '#3a4450' });
    Iso.box(ctx, { x: 5.2, y: 5.75, z: 1.5, w: 1.0, d: 0.85, h: 0.7, color: '#f0b33c' });
    var a = Iso.project(6.2, 6.2, 2.1), c2 = Iso.project(7.6 + sw, 6.2, 2.9 + sw * 0.4);
    ctx.strokeStyle = '#d79a2e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c2.x, c2.y); ctx.stroke();
    ctx.fillStyle = '#8d99a6';
    ctx.beginPath(); ctx.arc(c2.x, c2.y, 6, 0, 6.2832); ctx.fill();
    ctx.lineCap = 'butt';
  }});

  add({ id: 'furnace', x: 11.4, y: 3.8, w: 7.2, d: 5.4, draw: function (ctx, b, t) {
    hall(ctx, 11.6, 4.2, 3.4, 3.6, 1.9, C.steel, C.brick);
    Iso.cylinder(ctx, { x: 16.8, y: 6.0, r: 1.15, h: 3.4, color: '#7d6a58' });
    glow(ctx, 16.8, 6.0, 3.4, 1.05, t);
    smoke(ctx, 16.8, 6.0, 3.6, t);
    Iso.box(ctx, { x: 12.2, y: 8.0, w: 4.6, d: 1.0, h: 0.7, color: C.dark });
    glow(ctx, 14.5, 8.5, 0.72, 1.1, t + 1);
  }});

  add({ id: 'purify', x: 20.2, y: 3.8, w: 7.6, d: 5.4, draw: function (ctx, b, t) {
    Iso.cylinder(ctx, { x: 21.6, y: 5.2, r: 0.8, h: 4.4, color: '#cfd6dd' });
    Iso.cylinder(ctx, { x: 23.4, y: 5.2, r: 0.8, h: 3.4, color: '#cfd6dd' });
    Iso.cylinder(ctx, { x: 25.2, y: 5.2, r: 0.8, h: 4.9, color: '#cfd6dd' });
    pipes(ctx, 21.4, 4.2, 4, 2.8);
    machine(ctx, 21.0, 7.2, 2.2, 1.6, 1.2, '#7fb3d4', t, 1);
    Iso.cylinder(ctx, { x: 25.6, y: 7.8, r: 1.0, h: 1.3, color: '#9fd8e8' });
    waferDisc(ctx, 25.6, 7.8, 1.32, 1.0, '#d7f3fb');
  }});

  add({ id: 'crystal', x: 29.2, y: 3.8, w: 7.6, d: 5.6, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 30.2, y: 4.2, w: 0.8, d: 0.8, h: 5.4, color: C.steelDk });
    Iso.box(ctx, { x: 30.2, y: 4.4, w: 3.6, d: 0.5, h: 0.4, z: 5.4, color: C.steelDk });
    Iso.box(ctx, { x: 31.6, y: 5.6, w: 3.2, d: 3.0, h: 0.6, color: C.dark });
    Iso.cylinder(ctx, { x: 33.2, y: 7.1, r: 1.1, h: 1.1, z: 0.6, color: '#9aa4ae' });
    glow(ctx, 33.2, 7.1, 1.72, 1.05, t);
    /* the ingot climbs out of the melt and sinks back */
    var lift = 1.9 + (Math.sin(t * 0.42) * 0.5 + 0.5) * 1.7;
    var tp = Iso.project(33.2, 7.1, lift + 2.2), bp = Iso.project(33.2, 7.1, lift);
    ctx.strokeStyle = '#7b8794'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tp.x, tp.y - 26); ctx.lineTo(tp.x, tp.y); ctx.stroke();
    Iso.cylinder(ctx, { x: 33.2, y: 7.1, r: 0.52, h: 2.2, z: lift, color: '#aab7c6' });
    ctx.fillStyle = '#8b98a8';
    ctx.beginPath();
    ctx.moveTo(bp.x - 20, bp.y - 2); ctx.quadraticCurveTo(bp.x, bp.y + 12, bp.x + 20, bp.y - 2);
    ctx.closePath(); ctx.fill();
    machine(ctx, 35.0, 4.4, 1.6, 1.6, 1.2, '#7fb3d4', t, 2);
  }});

  add({ id: 'saw', x: 38.2, y: 3.8, w: 7.6, d: 5.4, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 38.6, y: 5.0, w: 5.2, d: 2.4, h: 0.8, color: C.dark });
    Iso.cylinder(ctx, { x: 40.0, y: 6.2, r: 0.62, h: 3.0, z: 0.8, color: '#aab7c6' });
    /* frame with wires sawing back and forth */
    var sx = Math.sin(t * 6) * 3;
    var f1 = Iso.project(39.4, 5.2, 0.8), f2 = Iso.project(43.4, 5.2, 0.8);
    ctx.strokeStyle = '#5f6b78'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(f1.x, f1.y); ctx.lineTo(f1.x, f1.y - 52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f2.x, f2.y); ctx.lineTo(f2.x, f2.y - 52); ctx.stroke();
    ctx.strokeStyle = '#8d99a6'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(f1.x, f1.y - 52); ctx.lineTo(f2.x, f2.y - 52); ctx.stroke();
    ctx.strokeStyle = '#eef3f7'; ctx.lineWidth = 1.4;
    for (var i = 0; i < 4; i++) {
      var yy = f1.y - 40 + i * 7;
      ctx.beginPath(); ctx.moveTo(f1.x + 6 + sx, yy); ctx.lineTo(f2.x - 6 + sx, yy + 18); ctx.stroke();
    }
    for (var j = 0; j < 3; j++) waferDisc(ctx, 41.4 + j * 1.1, 8.2, 0.02, 0.62, '#a8bbcd');
  }});

  add({ id: 'polish', x: 47.2, y: 3.8, w: 7.6, d: 5.4, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 47.6, y: 4.8, w: 5.6, d: 2.2, h: 0.7, color: C.dark });
    for (var i = 0; i < 3; i++) {
      var cx = 48.6 + i * 1.8;
      waferDisc(ctx, cx, 5.9, 0.72, 0.78, '#c9d3dd');
      ctx.save();
      var p = Iso.project(cx, 5.9, 0.76);
      ctx.translate(p.x, p.y);
      ctx.scale(Math.abs(Math.cos(t * 3 + i)) * 0.8 + 0.2, 1);
      ctx.fillStyle = 'rgba(143,208,232,0.9)';
      ctx.beginPath(); ctx.ellipse(0, 0, 26, 13, 0, 0, 6.2832); ctx.fill();
      ctx.restore();
    }
    waferDisc(ctx, 50.4, 8.2, 0.02, 1.0, '#eaf2f8');
  }});

  /* --- act 2 ------------------------------------------------------------- */

  add({ id: 'design', x: 41.8, y: 11.8, w: 8.4, d: 4.8, draw: function (ctx, b, t) {
    hall(ctx, 42.0, 12.0, 8.0, 4.2, 2.0, '#e5eaf0', '#4d7fb5');
    /* two screens on the front wall, patterns crawling */
    for (var i = 0; i < 2; i++) {
      var p = Iso.project(43.6 + i * 3.4, 16.2, 1.5);
      ctx.fillStyle = '#16324a';
      ctx.fillRect(p.x - 26, p.y - 30, 52, 34);
      ctx.strokeStyle = i ? '#ffcf5c' : '#4fd0c0';
      ctx.lineWidth = 1.6;
      for (var k = 0; k < 5; k++) {
        var off = ((t * 8 + k * 9 + i * 13) % 44) - 22;
        ctx.beginPath();
        ctx.moveTo(p.x - 22, p.y - 26 + k * 6);
        ctx.lineTo(p.x - 22 + off + 22, p.y - 26 + k * 6);
        ctx.stroke();
      }
    }
  }});

  add({ id: 'mask', x: 31.8, y: 11.8, w: 8.4, d: 4.8, draw: function (ctx, b, t) {
    hall(ctx, 32.0, 12.0, 8.0, 4.2, 2.0, '#dfe7ee', '#7a6ba8');
    /* a glass mask plate stood on a plinth outside */
    Iso.box(ctx, { x: 33.0, y: 16.4, w: 1.8, d: 0.9, h: 0.5, color: C.dark });
    var p = Iso.project(33.9, 16.85, 0.5);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#a9e4f2';
    ctx.fillRect(p.x - 22, p.y - 34, 44, 34);
    ctx.strokeStyle = '#12293b'; ctx.lineWidth = 1.5;
    for (var i = 1; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(p.x - 22 + i * 8.8, p.y - 34); ctx.lineTo(p.x - 22 + i * 8.8, p.y); ctx.stroke();
    }
    ctx.strokeStyle = '#5f9fb5'; ctx.lineWidth = 2.5;
    ctx.strokeRect(p.x - 22, p.y - 34, 44, 34);
    ctx.globalAlpha = 1;
  }});

  add({ id: 'cleanroom', x: 21.8, y: 11.8, w: 8.4, d: 4.8, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 22.0, y: 12.0, w: 8.0, d: 4.2, h: 2.6, color: '#eef4f9' });
    Iso.box(ctx, { x: 22.0, y: 12.0, w: 8.0, d: 4.2, h: 0.24, z: 2.6, color: '#c6d3de' });
    /* the airlock door, flush on the front wall */
    Iso.box(ctx, { x: 25.2, y: 16.1, w: 1.8, d: 0.12, h: 1.9, color: '#8fd4ea' });
    /* air raining down inside the doorway */
    ctx.strokeStyle = 'rgba(63,168,204,0.85)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    for (var i = 0; i < 3; i++) {
      var k = ((t * 0.9) + i / 3) % 1;
      var p = Iso.project(25.5 + i * 0.5, 16.0, 1.85 - k * 1.5);
      ctx.globalAlpha = 0.35 + 0.65 * Math.sin(k * Math.PI);
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 8); ctx.lineTo(p.x, p.y + 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  }});

  /* --- act 3, the loop --------------------------------------------------- */

  add({ id: 'layer', x: 18.8, y: 17.9, w: 8.0, d: 3.7, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 19.2, y: 18.4, w: 6.6, d: 1.9, h: 0.7, color: C.dark });
    Iso.orientedBox(ctx, { x: 22.5, y: 19.35, hx: 1, hy: 0, len: 6.4, wid: 1.5, z: 0.7, h: 1.4, color: '#c9d3dd' });
    /* heater bands pulsing along the tube */
    for (var i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.45 + 0.45 * Math.sin(t * 2.4 + i);
      Iso.box(ctx, { x: 20.4 + i * 1.9, y: 18.6, z: 0.7, w: 0.45, d: 1.5, h: 1.4, color: C.hot, edge: false });
    }
    ctx.globalAlpha = 1;
    Iso.cylinder(ctx, { x: 19.8, y: 20.9, r: 0.4, h: 1.2, color: '#7fb3d4' });
    Iso.cylinder(ctx, { x: 20.8, y: 20.9, r: 0.4, h: 1.2, color: '#e0a94f' });
  }});

  add({ id: 'resist', x: 27.6, y: 17.9, w: 7.2, d: 3.7, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 28.6, y: 18.4, w: 3.4, d: 2.6, h: 0.7, color: C.dark });
    Iso.cylinder(ctx, { x: 30.3, y: 19.7, r: 1.2, h: 0.4, z: 0.7, color: '#8d99a6' });
    /* the wafer spinning under the nozzle */
    waferDisc(ctx, 30.3, 19.7, 1.12, 1.0, '#3fb5a0');
    ctx.save();
    var p = Iso.project(30.3, 19.7, 1.14);
    ctx.translate(p.x, p.y);
    ctx.scale(Math.abs(Math.cos(t * 5)) * 0.85 + 0.15, 1);
    ctx.fillStyle = 'rgba(79,208,192,0.55)';
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 17, 0, 0, 6.2832); ctx.fill();
    ctx.restore();
    Iso.box(ctx, { x: 28.7, y: 18.1, w: 0.5, d: 0.5, h: 3.0, color: C.steelDk });
    Iso.box(ctx, { x: 28.7, y: 18.2, w: 2.0, d: 0.3, h: 0.3, z: 2.7, color: C.steelDk });
    /* a drop falling onto the middle of the wafer */
    var k = (t * 0.9) % 1;
    var dp = Iso.project(30.3, 19.4, 2.7 - k * 1.5);
    ctx.fillStyle = '#3fb5a0'; ctx.globalAlpha = 1 - k * 0.5;
    ctx.beginPath(); ctx.arc(dp.x, dp.y, 4, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
    Iso.cylinder(ctx, { x: 33.4, y: 19.0, r: 0.42, h: 1.3, color: '#3fb5a0' });
    Iso.cylinder(ctx, { x: 33.4, y: 20.2, r: 0.42, h: 1.3, color: '#3fb5a0' });
  }});

  add({ id: 'litho', x: 35.4, y: 17.0, w: 9.0, d: 4.6, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 35.8, y: 17.4, w: 8.0, d: 4.0, h: 0.5, color: '#5b6470' });
    /* light source tower */
    Iso.box(ctx, { x: 36.2, y: 17.8, w: 2.0, d: 2.0, h: 4.2, z: 0.5, color: '#dfe7ee' });
    glow(ctx, 37.2, 18.8, 4.75, 1.6, t, '#ffe9a8', '#ffffff');
    /* the beam falling onto the wafer stage */
    var beam = 0.5 + 0.4 * Math.abs(Math.sin(t * 1.4));
    var tp = Iso.project(40.4, 19.8, 4.4), bp = Iso.project(40.4, 19.8, 0.9);
    ctx.globalAlpha = beam;
    var g = ctx.createLinearGradient(tp.x, tp.y, bp.x, bp.y);
    g.addColorStop(0, 'rgba(190,238,255,0.9)');
    g.addColorStop(1, 'rgba(120,210,255,0.15)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(tp.x - 26, tp.y); ctx.lineTo(tp.x + 26, tp.y);
    ctx.lineTo(bp.x + 13, bp.y); ctx.lineTo(bp.x - 13, bp.y);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    /* the mask held in the beam, then the lens stack shrinking it */
    var mp = Iso.project(40.4, 19.8, 3.5);
    ctx.fillStyle = '#a9e4f2'; ctx.fillRect(mp.x - 30, mp.y - 9, 60, 18);
    ctx.strokeStyle = '#12293b'; ctx.lineWidth = 1.4;
    for (var i = 1; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(mp.x - 30 + i * 10, mp.y - 9); ctx.lineTo(mp.x - 30 + i * 10, mp.y + 9); ctx.stroke();
    }
    ctx.strokeStyle = '#5f9fb5'; ctx.lineWidth = 2.5; ctx.strokeRect(mp.x - 30, mp.y - 9, 60, 18);
    ctx.fillStyle = 'rgba(207,232,245,0.95)';
    ctx.strokeStyle = '#7f96a8'; ctx.lineWidth = 2;
    for (var L = 0; L < 3; L++) {
      var lp = Iso.project(40.4, 19.8, 2.5 - L * 0.42);
      ctx.beginPath(); ctx.ellipse(lp.x, lp.y, 26 - L * 6, 9 - L * 2, 0, 0, 6.2832);
      ctx.fill(); ctx.stroke();
    }
    /* the stage, stepping the wafer sideways between exposures */
    var step = Math.round(Math.sin(t * 0.8) * 2) * 0.34;
    Iso.box(ctx, { x: 39.5, y: 19.0, w: 1.9, d: 1.7, h: 0.4, z: 0.5, color: '#8d99a6' });
    waferDisc(ctx, 40.4 + step, 19.8, 0.92, 0.8, '#3fb5a0');
    Iso.box(ctx, { x: 42.6, y: 17.8, w: 1.2, d: 3.2, h: 2.2, z: 0.5, color: '#c4ccd4' });
  }});

  add({ id: 'etch', x: 31.6, y: 34.0, w: 8.6, d: 4.2, draw: function (ctx, b, t) {
    for (var i = 0; i < 2; i++) {
      var x = 32.2 + i * 3.6;
      Iso.box(ctx, { x: x, y: 34.4, w: 3.0, d: 2.6, h: 1.7, color: '#a8b4c0' });
      var p = Iso.project(x + 1.5, 37.0, 1.0);
      ctx.fillStyle = '#22303f';
      ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3 + i * 2);
      ctx.fillStyle = '#b06cf0';
      ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
    pipes(ctx, 32.2, 33.9, 6, 1.9);
  }});

  add({ id: 'dope', x: 23.6, y: 34.0, w: 7.6, d: 4.2, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 24.0, y: 34.4, w: 2.0, d: 2.2, h: 1.9, color: '#b7c0c9' });
    Iso.box(ctx, { x: 28.4, y: 34.4, w: 2.0, d: 2.2, h: 1.9, color: '#b7c0c9' });
    Iso.box(ctx, { x: 26.0, y: 35.1, w: 2.4, d: 0.8, h: 0.5, z: 1.0, color: C.steelDk });
    /* the ion beam, with atoms streaming down it */
    var a = Iso.project(26.0, 35.5, 1.62), c2 = Iso.project(28.4, 35.5, 1.62);
    ctx.strokeStyle = 'rgba(192,92,240,0.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c2.x, c2.y); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < 3; i++) {
      var k = ((t * 1.6) + i / 3) % 1;
      ctx.beginPath();
      ctx.arc(a.x + (c2.x - a.x) * k, a.y + (c2.y - a.y) * k, 3, 0, 6.2832);
      ctx.fill();
    }
    waferDisc(ctx, 29.4, 35.5, 1.9, 0.62, '#4a9de0');
  }});

  add({ id: 'wiring', x: 15.6, y: 34.0, w: 7.6, d: 4.2, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 16.0, y: 34.4, w: 3.0, d: 2.4, h: 1.3, color: '#c08a55' });
    ctx.fillStyle = '#2a4a63'; Iso.disc(ctx, 17.5, 35.6, 1.32, 1.1);
    ctx.fillStyle = '#4f9fd4'; Iso.disc(ctx, 17.5, 35.6, 1.34, 0.75);
    /* the polish head that flattens the copper back down */
    Iso.cylinder(ctx, { x: 21.0, y: 35.6, r: 1.1, h: 1.0, color: '#8d99a6' });
    ctx.save();
    var p = Iso.project(21.0, 35.6, 1.04);
    ctx.translate(p.x, p.y);
    ctx.scale(Math.abs(Math.cos(t * 3.4)) * 0.8 + 0.2, 1);
    ctx.fillStyle = '#d8dee5';
    ctx.beginPath(); ctx.ellipse(0, 0, 32, 16, 0, 0, 6.2832); ctx.fill();
    ctx.restore();
    Iso.cylinder(ctx, { x: 16.6, y: 37.4, r: 0.42, h: 1.1, color: C.copper });
    Iso.cylinder(ctx, { x: 17.8, y: 37.4, r: 0.42, h: 1.1, color: C.copper });
  }});

  /* --- the loop counter, the arch the cart drives under ------------------- */

  add({ id: 'loopct', x: 6.4, y: 21.8, w: 6.4, d: 6.4, draw: function (ctx, b, t, W) {
    Iso.box(ctx, { x: 7.0, y: 22.4, w: 3.4, d: 3.0, h: 2.0, color: '#c4ccd4' });
    Iso.gable(ctx, { x: 7.0, y: 22.4, z: 2.0, w: 3.4, d: 3.0, h: 1.1, color: C.gold });
    /* the lap board, showing which layer the wafer is on */
    var p = Iso.project(8.7, 25.4, 2.2);
    ctx.fillStyle = '#2a1e12';
    ctx.fillRect(p.x - 30, p.y - 26, 60, 26);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
    ctx.strokeRect(p.x - 30, p.y - 26, 60, 26);
    ctx.fillStyle = C.gold;
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('LAYER ' + ((W && W.lap) || 1), p.x, p.y - 13);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }});

  /* --- act 4 ------------------------------------------------------------- */

  add({ id: 'test', x: 17.6, y: 40.2, w: 8.6, d: 4.4, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 18.4, y: 40.6, w: 4.6, d: 3.0, h: 0.8, color: C.dark });
    waferDisc(ctx, 20.7, 42.1, 0.82, 1.5, '#7f93a8');
    dieGrid(ctx, 20.7, 42.1, 0.84, 9, true);
    /* the prober tapping each chip in turn */
    var dip = Math.abs(Math.sin(t * 2.2)) * 0.35;
    var p = Iso.project(20.7, 41.6, 2.5 - dip);
    ctx.fillStyle = '#8d99a6'; ctx.fillRect(p.x - 16, p.y - 22, 32, 22);
    ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 14); ctx.stroke();
    Iso.box(ctx, { x: 23.8, y: 40.6, w: 1.6, d: 2.6, h: 2.0, color: '#c4ccd4' });
  }});

  add({ id: 'dice', x: 26.6, y: 40.2, w: 8.6, d: 4.4, draw: function (ctx, b, t) {
    Iso.box(ctx, { x: 27.2, y: 40.6, w: 4.4, d: 2.8, h: 0.7, color: C.dark });
    waferDisc(ctx, 29.4, 42.0, 0.72, 1.4, '#7f93a8');
    dieGrid(ctx, 29.4, 42.0, 0.74, 9, false);
    /* the blade tracking across the wafer */
    var sx = Math.sin(t * 0.9) * 34;
    var p = Iso.project(29.4, 41.5, 1.5);
    ctx.strokeStyle = '#5f6b78'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(p.x + sx, p.y - 24); ctx.lineTo(p.x + sx, p.y - 6); ctx.stroke();
    ctx.fillStyle = '#eef3f7'; ctx.strokeStyle = '#8d99a6'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(p.x + sx, p.y - 5, 15, 5, 0, 0, 6.2832); ctx.fill(); ctx.stroke();
    Iso.box(ctx, { x: 32.4, y: 41.4, w: 2.0, d: 2.0, h: 0.3, color: C.dark });
    chipTray(ctx, 33.4, 42.4, 0.32);
  }});

  add({ id: 'pack', x: 35.6, y: 40.2, w: 8.6, d: 4.4, draw: function (ctx, b, t) {
    machine(ctx, 36.2, 40.6, 1.9, 1.9, 1.2, '#7fb3d4', t, 0);
    machine(ctx, 38.4, 40.6, 1.9, 1.9, 1.2, '#e0a94f', t, 1);
    machine(ctx, 40.6, 40.6, 1.9, 1.9, 1.2, '#4fd0c0', t, 2);
    /* belt with packaged chips riding along it */
    Iso.box(ctx, { x: 36.2, y: 43.0, w: 6.3, d: 0.9, h: 0.42, color: '#5f6b78' });
    for (var i = 0; i < 5; i++) {
      var k = ((t * 0.5) + i / 5) % 1;
      Iso.box(ctx, { x: 36.3 + k * 6.0, y: 43.2, z: 0.42, w: 0.6, d: 0.5, h: 0.22, color: '#2f3945' });
    }
  }});

  add({ id: 'ship', x: 44.6, y: 40.2, w: 9.0, d: 4.4, draw: function (ctx, b, t) {
    hall(ctx, 45.0, 40.6, 3.6, 3.2, 1.7, '#e8eef4', C.blue);
    Iso.box(ctx, { x: 49.4, y: 41.0, w: 1.5, d: 1.5, h: 0.7, color: '#c8a06a' });
    Iso.box(ctx, { x: 49.4, y: 41.0, w: 1.5, d: 1.5, h: 0.7, z: 0.7, color: '#d2ac76' });
    Iso.box(ctx, { x: 51.2, y: 41.4, w: 1.5, d: 1.5, h: 0.7, color: '#c8a06a' });
    truck(ctx, 49.2, 43.0, C.blue);
  }});

  /* --- act 5: out of the fab and into service ----------------------------- */

  add({ id: 'dock', x: 53.6, y: 40.0, w: 5.8, d: 4.8, draw: function (ctx, b, t) {
    hall(ctx, 53.9, 40.4, 2.4, 2.2, 1.4, '#e8eef4', C.brick);
    /* pallets waiting their turn, and the lorry that takes them */
    palletStack(ctx, 58.3, 40.9, 0, 3);
    palletStack(ctx, 58.6, 42.3, 0, 2);
    truck(ctx, 54.1, 43.3, C.red);
    /* a forklift walking one pallet out to the loading line and back */
    var k = Math.sin(t * 0.55) * 0.5 + 0.5;
    var fx = 57.4 - k * 1.5, fy = 41.7;
    Iso.box(ctx, { x: fx - 0.62, y: fy + 0.05, w: 0.12, d: 0.6, h: 1.2, color: '#5f6b78' });
    if (k > 0.06) palletStack(ctx, fx - 1.15, fy + 0.02, 0.3, 1);
    Iso.box(ctx, { x: fx, y: fy, w: 0.85, d: 0.7, h: 0.5, color: '#e0a94f' });
    Iso.box(ctx, { x: fx + 0.16, y: fy + 0.08, z: 0.5, w: 0.46, d: 0.5, h: 0.46, color: '#3a4450' });
  }});

  add({ id: 'datacenter', x: 50.6, y: 18.6, w: 9.6, d: 6.6, draw: function (ctx, b, t, W) {
    var X = 51, Y = 19, Wd = 8.8, D = 5.6, H = 3.4;
    var face = Y + D;                       // the wall the lorry unloads into
    var racks = (W && W.racks) || 0;
    var full = Math.min(6, racks * 2);      // rack halls lit, two per delivery
    var arriving = W && W.stage === 'datacenter';

    Iso.box(ctx, { x: X, y: Y, w: Wd, d: D, h: H, color: '#dfe6ec', top: '#c3ccd6' });
    /* parapet and the chillers that carry the heat away */
    Iso.box(ctx, { x: X, y: Y, z: H, w: Wd, d: D, h: 0.22, color: '#aeb8c2' });
    for (var f = 0; f < 3; f++) fan(ctx, X + 1.6 + f * 2.6, Y + 2.0, H + 0.24, t * (2.2 + f * 0.4));
    Iso.box(ctx, { x: X + 0.5, y: Y + 4.2, z: H + 0.22, w: 1.4, d: 0.9, h: 0.7, color: '#9fb0c0' });

    /* the rack halls, seen through the long window on the front wall */
    for (var i = 0; i < 6; i++) {
      var x0 = X + 0.55 + i * 1.0, x1 = x0 + 0.78;
      ctx.fillStyle = '#1b2733';
      faceRect(ctx, face, x0, 0.7, x1, 2.5);
      var on = i < full;
      if (on && arriving && i >= full - 2) on = W.stageT > 0.9 + (i - (full - 2)) * 0.9;
      for (var r = 0; r < 5; r++) {
        var z0 = 0.82 + r * 0.34;
        ctx.fillStyle = on ? (Math.sin(t * 6 + i * 2 + r) > -0.3 ? '#4fe0b8' : '#1f7f6a') : '#2b3a48';
        faceRect(ctx, face, x0 + 0.08, z0, x1 - 0.08, z0 + 0.16);
      }
    }
    ctx.strokeStyle = 'rgba(30,42,54,0.5)'; ctx.lineWidth = 1;
    Iso.stroke(ctx, [Iso.project(X + 0.5, face, 2.6), Iso.project(X + 6.4, face, 2.6),
                     Iso.project(X + 6.4, face, 0.6), Iso.project(X + 0.5, face, 0.6)], true);

    /* the goods bay the pallets go through */
    ctx.fillStyle = '#2f3945';
    faceRect(ctx, face, X + 7.0, 0, X + 8.4, 2.2);
    ctx.fillStyle = '#7f8b98';
    faceRect(ctx, face, X + 7.0, 1.7, X + 8.4, 2.2);
    ctx.fillStyle = '#f2c14e';
    faceRect(ctx, face, X + 7.0, 0, X + 8.4, 0.08);

    /* the standby generators and transformers that keep the halls fed */
    for (var g = 0; g < 3; g++) {
      Iso.box(ctx, { x: 51.2 + g * 1.5, y: 26.6, w: 1.1, d: 1.3, h: 0.9, color: '#8e9aa8' });
      Iso.box(ctx, { x: 51.3 + g * 1.5, y: 26.7, z: 0.9, w: 0.9, d: 1.1, h: 0.16, color: '#6b7784' });
      Iso.cylinder(ctx, { x: 51.45 + g * 1.5, y: 26.5, r: 0.13, h: 1.5, color: '#5f6b78', edge: false });
    }

    /* the pallets coming off the lorry while it is docked */
    if (arriving) {
      for (var c = 0; c < 3; c++) {
        var k = (W.stageT * 0.55 - c * 0.3) % 1.6;
        if (k < 0 || k > 1) continue;
        palletStack(ctx, 59.0 - k * 0.5, 27.3 - k * 2.5, 0.32, 2);
      }
    }

    /* Kept to one short word: the board is drawn at a fixed size in screen space,
       so a long one would swamp the wall once the camera pulls back. */
    sign(ctx, X + 7.7, face, H - 0.1, full > 0 ? 'ONLINE' : 'IDLE',
         full > 0 ? '#4fe0b8' : '#6b7784');
  }});

  /* --- shared small painters --------------------------------------------- */

  /* A rectangle painted on the wall that faces the camera at y = yFace. */
  function faceRect(ctx, yFace, x0, z0, x1, z1) {
    Iso.poly(ctx, [Iso.project(x0, yFace, z1), Iso.project(x1, yFace, z1),
                   Iso.project(x1, yFace, z0), Iso.project(x0, yFace, z0)]);
  }

  function fan(ctx, x, y, z, a) {
    Iso.box(ctx, { x: x - 0.7, y: y - 0.7, z: z, w: 1.4, d: 1.4, h: 0.34, color: '#8e9aa8' });
    var p = Iso.project(x, y, z + 0.34);
    ctx.fillStyle = '#2f3945';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 17, 9, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#cfd7de'; ctx.lineWidth = 2.4;
    for (var i = 0; i < 3; i++) {
      var th = a + i * 2.094;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(th) * 15, p.y + Math.sin(th) * 8);
      ctx.stroke();
    }
  }

  function sign(ctx, x, yFace, z, text, colour) {
    var p = Iso.project(x, yFace, z);
    ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var w = ctx.measureText(text).width + 16;
    ctx.fillStyle = '#22303f';
    ctx.fillRect(p.x - w / 2, p.y - 11, w, 22);
    ctx.strokeStyle = colour; ctx.lineWidth = 2;
    ctx.strokeRect(p.x - w / 2, p.y - 11, w, 22);
    ctx.fillStyle = colour;
    ctx.fillText(text, p.x, p.y + 1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  /* Boxed chips on a wooden pallet, the unit everything ships in. */
  function palletStack(ctx, x, y, z, rows) {
    z = z || 0;
    Iso.box(ctx, { x: x - 0.5, y: y - 0.42, z: z, w: 1.0, d: 0.84, h: 0.14, color: C.wood });
    for (var r = 0; r < rows; r++) {
      for (var i = 0; i < 2; i++) {
        Iso.box(ctx, { x: x - 0.46 + i * 0.46, y: y - 0.38, z: z + 0.14 + r * 0.34,
                       w: 0.44, d: 0.76, h: 0.34, color: r % 2 ? '#d2ac76' : '#c8a06a' });
      }
    }
  }

  function dieGrid(ctx, cx, cy, z, n, marked) {
    var cell = 0.30, half = n / 2;
    for (var gy = 0; gy < n; gy++) {
      for (var gx = 0; gx < n; gx++) {
        var dx = gx - half + 0.5, dy = gy - half + 0.5;
        if (dx * dx + dy * dy > half * half * 0.82) continue;
        var bad = marked && ((gx * 7 + gy * 5) % 17) === 0;
        var x = cx + dx * cell, y = cy + dy * cell;
        var a = Iso.project(x - cell * 0.42, y - cell * 0.42, z);
        var b2 = Iso.project(x + cell * 0.42, y - cell * 0.42, z);
        var c2 = Iso.project(x + cell * 0.42, y + cell * 0.42, z);
        var d2 = Iso.project(x - cell * 0.42, y + cell * 0.42, z);
        ctx.fillStyle = bad ? '#d94f3d' : '#3fb5a0';
        Iso.poly(ctx, [a, b2, c2, d2]);
      }
    }
  }

  function chipTray(ctx, cx, cy, z) {
    for (var r = 0; r < 3; r++) {
      for (var c2 = 0; c2 < 3; c2++) {
        var x = cx + (c2 - 1) * 0.55, y = cy + (r - 1) * 0.55;
        Iso.box(ctx, { x: x - 0.2, y: y - 0.2, z: z, w: 0.4, d: 0.4, h: 0.12, color: '#2f3945', top: '#3fb5a0' });
      }
    }
  }

  function truck(ctx, x, y, c) {
    Iso.box(ctx, { x: x, y: y, w: 3.4, d: 1.5, h: 0.2, color: '#2b3038' });
    Iso.box(ctx, { x: x + 0.1, y: y + 0.2, z: 0.2, w: 2.2, d: 1.1, h: 0.85, color: c });
    Iso.box(ctx, { x: x + 2.35, y: y + 0.2, z: 0.2, w: 1.0, d: 1.1, h: 1.15, color: Iso.mix(c, '#ffffff', 0.18) });
  }

  /* The delivery lorry, turned to face wherever it is driving. Same build as the
     cart, a chassis with a body on it, so whatever it hauls stays visible on top.
     LORRY_BED is where that load sits. */
  var LORRY_BED = 0.66;     // top of the load bed, where the pallet sits
  var LORRY_LOAD = 0.62;    // how far behind centre that bed is

  function lorry(ctx, x, y, z, hx, hy, c) {
    var bx = x - hx * LORRY_LOAD, by = y - hy * LORRY_LOAD;
    Iso.orientedBox(ctx, { x: x, y: y, hx: hx, hy: hy, len: 3.8, wid: 1.6,
                           z: z, h: 0.2, color: '#2b3038' });
    Iso.orientedBox(ctx, { x: bx, y: by, hx: hx, hy: hy, len: 2.3, wid: 1.42,
                           z: z + 0.2, h: 0.46, color: '#9fb0c0' });
    /* headboard, so the load reads as being carried rather than balanced */
    Iso.orientedBox(ctx, { x: x + hx * 0.62, y: y + hy * 0.62, hx: hx, hy: hy,
                           len: 0.16, wid: 1.42, z: z + LORRY_BED, h: 0.6, color: '#7f8b98' });
    /* cab last: it is the tallest part and belongs on top of the joins */
    Iso.orientedBox(ctx, { x: x + hx * 1.25, y: y + hy * 1.25, hx: hx, hy: hy,
                           len: 1.15, wid: 1.45, z: z + 0.2, h: 1.15, color: c });
    Iso.orientedBox(ctx, { x: x + hx * 1.25, y: y + hy * 1.25, hx: hx, hy: hy,
                           len: 1.18, wid: 1.48, z: z + 1.05, h: 0.3,
                           color: Iso.mix(c, '#ffffff', 0.55) });
  }

  /* ---- scenery ----------------------------------------------------------- */

  function tree(ctx, x, y, s) {
    s = s || 1;
    Iso.shadow(ctx, x, y, 0.7 * s);
    Iso.cylinder(ctx, { x: x, y: y, r: 0.16 * s, h: 1.0 * s, color: '#6b4a2b', edge: false });
    var p = Iso.project(x, y, 1.0 * s);
    ctx.fillStyle = '#2f7a34';
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 10 * s, 20 * s, 16 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#43a04a';
    ctx.beginPath(); ctx.ellipse(p.x - 5 * s, p.y - 15 * s, 13 * s, 10 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#5fbf62';
    ctx.beginPath(); ctx.ellipse(p.x - 8 * s, p.y - 19 * s, 7 * s, 5 * s, 0, 0, 6.2832); ctx.fill();
  }

  function bush(ctx, x, y) {
    Iso.shadow(ctx, x, y, 0.45);
    var p = Iso.project(x, y, 0);
    ctx.fillStyle = '#3d8b3d';
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 7, 13, 9, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#54a852';
    ctx.beginPath(); ctx.ellipse(p.x - 4, p.y - 11, 7, 5, 0, 0, 6.2832); ctx.fill();
  }

  function lamp(ctx, x, y) {
    Iso.cylinder(ctx, { x: x, y: y, r: 0.1, h: 2.4, color: '#4a5568', edge: false });
    var p = Iso.project(x, y, 2.4);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath(); ctx.arc(p.x, p.y - 3, 5, 0, 6.2832); ctx.fill();
  }

  function bench(ctx, x, y) {
    Iso.box(ctx, { x: x, y: y, w: 1.4, d: 0.5, h: 0.28, color: '#a8763f' });
    Iso.box(ctx, { x: x, y: y, w: 1.4, d: 0.14, h: 0.5, z: 0.28, color: '#b9854a' });
  }

  /* Park guests. Their whole animation is a position along a loop, so they need
     no state of their own and survive a reset for free. They walk the same roads
     the cart drives, pushed onto the shoulder so the cart still has the middle. */
  var PLAZA = makeRoute([[22, 26.6], [42, 26.6], [42, 30.2], [22, 30.2], [22, 26.6]]);
  var STROLLS = [INTAKE, LOOP, EXIT, PLAZA, PLAZA];
  var SHIRTS = ['#d94f3d', '#3f7fd4', '#8a5fd4', '#2f7a34', '#e0a94f', '#c8453a', '#3fb5a0'];
  var GUESTS = [];
  for (var gi = 0; gi < 24; gi++) {
    var rt = STROLLS[gi % STROLLS.length];
    var side = Iso.hash2(gi, 11, 4) > 0.5 ? 1 : -1;
    GUESTS.push({
      route: rt,
      speed: 0.8 + Iso.hash2(gi, 3, 11) * 0.9,
      offset: Iso.hash2(gi, 7, 5) * rt.total,
      side: side * (0.75 + Iso.hash2(gi, 13, 6) * 0.5),
      shirt: SHIRTS[gi % SHIRTS.length],
      hat: Iso.hash2(gi, 9, 2) > 0.6 ? '#f5c542' : '#ffffff'
    });
  }

  function guest(ctx, x, y, z, shirt, hat, bob) {
    var p = Iso.project(x, y, z || 0);
    ctx.fillStyle = 'rgba(30,50,20,0.22)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 6, 3, 0, 0, 6.2832); ctx.fill();
    var yo = p.y - (bob ? Math.abs(Math.sin(bob)) * 2 : 0);
    ctx.fillStyle = '#33415c'; ctx.fillRect(p.x - 2.5, yo - 9, 5, 7);
    ctx.fillStyle = shirt;
    ctx.strokeStyle = 'rgba(20,14,8,0.5)'; ctx.lineWidth = 1;
    ctx.fillRect(p.x - 4.5, yo - 18, 9, 10);
    ctx.strokeRect(p.x - 4.5, yo - 18, 9, 10);
    ctx.fillStyle = '#f0c49b';
    ctx.beginPath(); ctx.arc(p.x, yo - 21, 4.2, 0, 6.2832); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hat;
    ctx.beginPath(); ctx.arc(p.x, yo - 22.5, 4.4, Math.PI, 0); ctx.fill();
  }

  /* ---- exports ----------------------------------------------------------- */

  /* What the cart is carrying, named on a tag above it so the change at each
     stop is legible without reading the panel. */
  var CARGO_LABELS = {
    empty:     'empty cart',
    sand:      'quartz sand',
    lump:      'rough silicon, 99%',
    poly:      'polysilicon, 9 nines pure',
    ingot:     'one single crystal',
    wafers:    'sliced wafers',
    mirror:    'polished mirror wafer',
    blueprint: 'wafer + the chip design',
    withmask:  'wafer + the mask set',
    pod:       'sealed for the cleanroom',
    coated:    'fresh layer added',
    resist:    'photoresist coat',
    exposed:   'pattern exposed',
    etched:    'pattern etched in',
    doped:     'atoms implanted',
    wired:     'copper wiring filled',
    stack:     'one more layer done',
    tested:    'tested, failures marked',
    dies:      'cut into dies',
    packaged:  'packaged chips',
    boxed:     'boxed for shipping',
    pallet:    'palletised, on the lorry',
    delivered: 'chips delivered'
  };

  /* Cargo kinds that live inside the lithography ring, so the tag can add the
     layer count to them and only them. */
  var LOOP_CARGO = {
    coated: 1, resist: 1, exposed: 1, etched: 1, doped: 1, wired: 1, stack: 1
  };

  global.Park = {
    C: C, BOUNDS: BOUNDS, GROUND: GROUND, LOTS: LOTS,
    cargoLabels: CARGO_LABELS, loopCargo: LOOP_CARGO,
    routes: ROUTES, stations: STATIONS,
    stops: STOPS, stopById: STOP_BY_ID,
    buildings: B,
    guests: GUESTS,
    lorryBed: LORRY_BED, lorryLoad: LORRY_LOAD,
    draw: { tree: tree, bush: bush, lamp: lamp, bench: bench, guest: guest,
            truck: truck, lorry: lorry, waferDisc: waferDisc, dieGrid: dieGrid,
            chipTray: chipTray, palletStack: palletStack }
  };
})(window);
