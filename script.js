// wong jowo ojo lali jowoscript
// if jika nek kalau
/* intinya inti */
const RAD = Math.PI / 180, DEG = 180 / Math.PI;

// de em es
function dmsToDec(d, m, s) { return d + m / 60 + s / 3600; }

// diwaliks
function decToDms(v) {
  const a = Math.abs(v);
  let d = Math.floor(a);
  const mf = (a - d) * 60;
  let m = Math.floor(mf);
  let s = Math.round((mf - m) * 60 * 100) / 100;
  if (s >= 60) { s = 0; m += 1; }
  if (m >= 60) { m = 0; d += 1; }
  return { d: d, m: m, s: s };
}

// azimuth, ih ribet gsiso % when yh pake python
function norm360(a) {
  if (a < 0) a += 360;
  if (a >= 360) a -= 360;
  return a;
}

// format wuhuuuuuuyyy titik jadi koma, d = jumlah desimal, - 0 gaks usah -
function f(n, d) {
  if (!isFinite(n)) return '-';
  let s = n.toFixed(d === undefined ? 3 : d);
  if (Number(s) === 0) s = s.replace('-', '');
  return s.replace('.', ',');
}

// de em es
function fDMS(v) {
  const t = decToDms(v);
  return t.d + '° ' + String(t.m).padStart(2, '0') + '′ ' + t.s.toFixed(2).padStart(5, '0').replace('.', ',') + '″';
}

// penentuan kuadran sesuai kok ga kayak desil
function quadrantAzimuth(dx, dy) {
  let theta = 0, az, q, rule, cond;
  if (dx !== 0 && dy !== 0) theta = Math.atan(Math.abs(dx / dy)) * DEG;
  if (dx > 0 && dy > 0) {
    az = theta; q = 'Kuadran I'; rule = 'Az<sub>AB</sub> = θ'; cond = 'IF Δx &gt; 0 dan Δy &gt; 0';
  } else if (dx > 0 && dy < 0) {
    az = 180 - theta; q = 'Kuadran II'; rule = 'Az<sub>AB</sub> = 180° − θ'; cond = 'IF Δx &gt; 0 dan Δy &lt; 0';
  } else if (dx < 0 && dy < 0) {
    az = 180 + theta; q = 'Kuadran III'; rule = 'Az<sub>AB</sub> = 180° + θ'; cond = 'IF Δx &lt; 0 dan Δy &lt; 0';
  } else if (dx < 0 && dy > 0) {
    az = 360 - theta; q = 'Kuadran IV'; rule = 'Az<sub>AB</sub> = 360° − θ'; cond = 'IF Δx &lt; 0 dan Δy &gt; 0';
  } else if (dx === 0 && dy > 0) {
    az = 0; q = 'Sumbu +y (Utara)'; rule = 'Az<sub>AB</sub> = 0°'; cond = 'IF Δx = 0 dan Δy &gt; 0';
  } else if (dx > 0 && dy === 0) {
    az = 90; q = 'Sumbu +x (Timur)'; rule = 'Az<sub>AB</sub> = 90°'; cond = 'IF Δx &gt; 0 dan Δy = 0';
  } else if (dx === 0 && dy < 0) {
    az = 180; q = 'Sumbu −y (Selatan)'; rule = 'Az<sub>AB</sub> = 180°'; cond = 'IF Δx = 0 dan Δy &lt; 0';
  } else {
    az = 270; q = 'Sumbu −x (Barat)'; rule = 'Az<sub>AB</sub> = 270°'; cond = 'IF Δx &lt; 0 dan Δy = 0';
  }
  return { theta: theta, az: norm360(az), q: q, rule: rule, cond: cond };
}

// rapi pls biar bagus
function pad(s, w) { s = String(s); return s.length >= w ? s : new Array(w - s.length + 1).join(' ') + s; }

function matLines(r1, r2, dec) {
  const w = Math.max.apply(null, r1.concat(r2).map(function (v) { return f(v, dec).length; }));
  return [r1, r2].map(function (r) { return '| ' + pad(f(r[0], dec), w) + '   ' + pad(f(r[1], dec), w) + ' |'; });
}

function vecLines(v1, v2, dec) {
  const w = Math.max(f(v1, dec).length, f(v2, dec).length);
  return ['| ' + pad(f(v1, dec), w) + ' |', '| ' + pad(f(v2, dec), w) + ' |'];
}

// itung itungan.
function compute(p) {
  const bad = function (m) { return { ok: false, error: m }; };
// data salah pesan eror fix pls jan eror
  if ([p.xA, p.yA, p.xB, p.yB].some(function (v) { return !Number.isFinite(v); })) return bad('Koordinat A dan B harus berupa angka.');
  if (!Number.isFinite(p.alpha) || !Number.isFinite(p.beta)) return bad('Sudut α dan β harus berupa angka.');
  if (p.alpha <= 0 || p.alpha >= 180 || p.beta <= 0 || p.beta >= 180) return bad('Sudut α dan β harus lebih besar dari 0° dan kurang dari 180°.');
// delta ex delta ye azimututuututuu titut
  const dx = p.xB - p.xA, dy = p.yB - p.yA;
  if (dx === 0 && dy === 0) return bad('Titik A dan B tidak boleh berada di posisi yang sama.');
  if (p.method === 1 && p.dist !== null && !(p.dist > 0)) return bad('Jarak AP harus berupa angka lebih besar dari 0, atau kosongkan untuk dihitung otomatis.');

  if (p.method === 1 && p.dist === null && p.alpha + p.beta >= 180) return bad('Jumlah α + β harus kurang dari 180° supaya sudut di P (γ) bernilai positif.');

// azimut pls bener pls yaallah tolong
  const a = p.alpha, b = p.beta, left = p.side === 'kiri';
  const q = quadrantAzimuth(dx, dy);
  const azAB = q.az;
  const dAB = Math.hypot(dx, dy);
  const azBA = (azAB + 180) % 360;
  const rawAP = left ? azAB - a : azAB + a;
  const azAP = norm360(rawAP);
  // makasih yaallah
  // pppp kanannnnnn
  const rawBP = left ? azBA + b : azBA - b;
  const azBP = norm360(rawBP);
// γ ganjar mahfud
  const gamma = 180 - (a + b);
// sudut jaarak or sudut sudut
  const useMatrix = p.method === 2;
  const useSine = p.method === 1 && p.dist === null;
  const sAP = Math.sin(azAP * RAD), cAP = Math.cos(azAP * RAD);
  const sBP = Math.sin(azBP * RAD), cBP = Math.cos(azBP * RAD);

// jarak intiannya
  let D = null, t = null, u = null, tC = null, uC = null, i11 = 0, i12 = 0, i21 = 0, i22 = 0, dAP;
  if (useMatrix) {
    D = Math.sin((azBP - azAP) * RAD);
    if (Math.abs(D) < 1e-7) return bad('Garis sejajar atau tidak berpotongan!');
    i11 = -cBP / D; i12 = sBP / D; i21 = -cAP / D; i22 = sAP / D;
    t = i11 * dx + i12 * dy;
    u = i21 * dx + i22 * dy;
    tC = (dx * (-cBP) - dy * (-sBP)) / D;
    uC = (sAP * dy - cAP * dx) / D;
    if (t <= 0 || u <= 0) return bad('Garis AP dan BP berpotongan di belakang titik A atau B. Periksa α, β, dan pilihan kiri atau kanan (jumlah α + β harus kurang dari 180°).');
    dAP = t;
  } else if (useSine) {
    dAP = dAB * Math.sin(b * RAD) / Math.sin(gamma * RAD);
  } else {
    dAP = p.dist;
  }
// P dari Aaaaaaaaaaaaaaaaaaaaaaaaaaaaawhhahahahahahaaa
  const xP = p.xA + dAP * sAP, yP = p.yA + dAP * cAP;

  const dBP = Math.hypot(xP - p.xB, yP - p.yB);
  let betaGeo = 0;
  if (dBP > 1e-9) {
    let c = ((p.xA - p.xB) * (xP - p.xB) + (p.yA - p.yB) * (yP - p.yB)) / (dAB * dBP);
    c = Math.max(-1, Math.min(1, c));
    betaGeo = Math.acos(c) * DEG;
  }
  const gammaGeo = 180 - a - betaGeo;
  const gOut = (useMatrix || useSine) ? gamma : gammaGeo;
  const bOut = (useMatrix || useSine) ? b : betaGeo;

  const methodTxt = p.method === 2
    ? 'Sudut-Sudut: titik potong garis AP dan BP dengan matriks'
    : (p.dist !== null ? 'Sudut-Jarak: memakai jarak AP yang diisi' : 'Sudut-Jarak tanpa jarak yang diisi: jarak AP dihitung dari α dan β dengan aturan sinus');

// langkahnyoooo lanjot besok. nek eror gw genjreng
  const steps = [];
  steps.push({
    t: 'Pemilihan metode', cond: 'IF metode = ' + p.method,
    fx: 'IF (metode == 1) jalankan Metode Sudut-Jarak\nIF (metode == 2) jalankan Metode Sudut-Sudut',
    sub: 'metode = ' + p.method,
    r: methodTxt
  });
  if (p.fmt === 'dms' && p.raw) {
    steps.push({
      t: 'Konversi sudut DMS ke desimal', cond: 'IF format = derajat, menit, detik',
      fx: 'sudut = derajat + menit/60 + detik/3600',
      sub: 'α = ' + p.raw.a.d + ' + ' + p.raw.a.m + '/60 + ' + p.raw.a.s + '/3600\nβ = ' + p.raw.b.d + ' + ' + p.raw.b.m + '/60 + ' + p.raw.b.s + '/3600',
      r: 'α = ' + f(a, 5) + '°\nβ = ' + f(b, 5) + '°'
    });
  } else {
    steps.push({
      t: 'Sudut sudah dalam desimal', cond: 'IF format = desimal, tanpa konversi',
      fx: 'α dan β dipakai langsung',
      sub: 'α = ' + fDMS(a) + '\nβ = ' + fDMS(b),
      r: 'α = ' + f(a, 5) + '°\nβ = ' + f(b, 5) + '°'
    });
  }
  steps.push({
    t: 'Selisih koordinat A ke B',
    fx: 'ΔX = X<sub>B</sub> − X<sub>A</sub>\nΔY = Y<sub>B</sub> − Y<sub>A</sub>',
    sub: 'ΔX = ' + f(p.xB, 3) + ' − (' + f(p.xA, 3) + ')\nΔY = ' + f(p.yB, 3) + ' − (' + f(p.yA, 3) + ')',
    r: 'ΔX = ' + f(dx, 3) + ' m\nΔY = ' + f(dy, 3) + ' m'
  });
  steps.push({
    t: 'Azimuth dasar Az<sub>AB</sub> menurut kuadran', cond: q.cond.replace('Δx', 'ΔX').replace('Δy', 'ΔY'),
    fx: 'θ = arctan |ΔX / ΔY|',
    sub: (dx !== 0 && dy !== 0 ? 'θ = arctan |' + f(dx, 3) + ' / ' + f(dy, 3) + '| = ' + f(q.theta, 5) + '°' : 'Salah satu selisih bernilai 0, azimuth berada di sumbu.'),
    r: q.q + ': ' + q.rule + ' = ' + f(azAB, 5) + '° (' + fDMS(azAB) + ')'
  });
  if (useMatrix) {
    steps.push({
      t: 'Azimuth balik Az<sub>BA</sub>',
      fx: 'Az<sub>BA</sub> = (Az<sub>AB</sub> + 180°) mod 360°',
      sub: 'Az<sub>BA</sub> = (' + f(azAB, 5) + '° + 180°) mod 360°',
      r: 'Az<sub>BA</sub> = ' + f(azBA, 5) + '° (' + fDMS(azBA) + ')'
    });
  }
  steps.push({
    t: 'Jarak baseline d<sub>AB</sub>',
    fx: 'd<sub>AB</sub> = √(ΔX² + ΔY²)',
    sub: 'd<sub>AB</sub> = √(' + f(dx, 3) + '² + ' + f(dy, 3) + '²)',
    r: 'd<sub>AB</sub> = ' + f(dAB, 3) + ' m'
  });
  if (useMatrix) {
    steps.push({
      t: 'Sudut di titik P (γ)',
      fx: 'γ = 180° − (α + β)',
      sub: 'γ = 180° − (' + f(a, 5) + '° + ' + f(b, 5) + '°)',
      r: 'γ = ' + f(gamma, 5) + '° (' + fDMS(gamma) + ')'
    });
    steps.push({
      t: 'Azimuth sisi AP dan BP', cond: left ? 'IF P di kiri garis AB' : 'IF P di kanan garis AB',
      fx: left ? 'Az<sub>AP</sub> = Az<sub>AB</sub> − α\nAz<sub>BP</sub> = Az<sub>BA</sub> + β' : 'Az<sub>AP</sub> = Az<sub>AB</sub> + α\nAz<sub>BP</sub> = Az<sub>BA</sub> − β',
      sub: 'Az<sub>AP</sub> = ' + f(azAB, 5) + '° ' + (left ? '−' : '+') + ' ' + f(a, 5) + '° = ' + f(rawAP, 5) + '°\nAz<sub>BP</sub> = ' + f(azBA, 5) + '° ' + (left ? '+' : '−') + ' ' + f(b, 5) + '° = ' + f(rawBP, 5) + '°',
      r: (rawAP < 0 ? 'Az_AP negatif, tambah 360°.\n' : (rawAP >= 360 ? 'Az_AP lebih dari 360°, kurangi 360°.\n' : '')) +
         (rawBP < 0 ? 'Az_BP negatif, tambah 360°.\n' : (rawBP >= 360 ? 'Az_BP lebih dari 360°, kurangi 360°.\n' : '')) +
         'Az<sub>AP</sub> = ' + f(azAP, 5) + '° (' + fDMS(azAP) + ')\nAz<sub>BP</sub> = ' + f(azBP, 5) + '° (' + fDMS(azBP) + ')'
    });
    const mA = matLines([sAP, -sBP], [cAP, -cBP], 6), vb = vecLines(dx, dy, 3);
    steps.push({
      t: 'Matriks A dan vektor b', mx: true,
      fx: 'A = | sin Az_AP   −sin Az_BP |     b = | X_B − X_A |\n    | cos Az_AP   −cos Az_BP |         | Y_B − Y_A |\nA · [t, u]^T = b',
      sub: 'A = ' + mA[0] + '     b = ' + vb[0] + '\n    ' + mA[1] + '         ' + vb[1],
      r: 'Dari titik A: X = X_A + t · sin Az_AP,  Y = Y_A + t · cos Az_AP\nDari titik B: X = X_B + u · sin Az_BP,  Y = Y_B + u · cos Az_BP'
    });
    steps.push({
      t: 'Determinan D', mx: true, cond: 'IF |D| &ge; 1e-7, garis berpotongan',
      fx: 'D = sin(Az_BP − Az_AP)\n  = (sin Az_AP)(−cos Az_BP) − (−sin Az_BP)(cos Az_AP)',
      sub: 'D = sin(' + f(azBP, 5) + '° − ' + f(azAP, 5) + '°) = sin(' + f(azBP - azAP, 5) + '°)\nD = (' + f(sAP, 6) + ')(' + f(-cBP, 6) + ') − (' + f(-sBP, 6) + ')(' + f(cAP, 6) + ')',
      r: 'D = ' + f(D, 6)
    });
    const iv = matLines([i11, i12], [i21, i22], 6);
    const pre = 'A^-1 = (1 / ' + f(D, 6) + ') · ';
    const iraw = matLines([-cBP, sBP], [-cAP, sAP], 6);
    steps.push({
      t: 'Invers matriks A', mx: true,
      fx: 'A^-1 = (1 / D) · | −cos Az_BP    sin Az_BP |\n                  | −cos Az_AP    sin Az_AP |',
      sub: pre + iraw[0] + '\n' + new Array(pre.length + 1).join(' ') + iraw[1],
      r: 'A^-1 = ' + iv[0] + '\n       ' + iv[1]
    });
    steps.push({
      t: 'Parameter t dan u dengan invers matriks', mx: true,
      fx: '[t, u]^T = A^-1 · b\nt = A^-1(1,1) · (X_B − X_A) + A^-1(1,2) · (Y_B − Y_A)\nu = A^-1(2,1) · (X_B − X_A) + A^-1(2,2) · (Y_B − Y_A)',
      sub: 't = (' + f(i11, 6) + ')(' + f(dx, 3) + ') + (' + f(i12, 6) + ')(' + f(dy, 3) + ')\nu = (' + f(i21, 6) + ')(' + f(dx, 3) + ') + (' + f(i22, 6) + ')(' + f(dy, 3) + ')',
      r: 't = ' + f(t, 3) + ' m   (jarak AP)\nu = ' + f(u, 3) + ' m   (jarak BP)'
    });
  } else {
    if (useSine) {
      steps.push({
        t: 'Sudut di titik P (γ)',
        fx: 'γ = 180° − (α + β)',
        sub: 'γ = 180° − (' + f(a, 5) + '° + ' + f(b, 5) + '°)',
        r: 'γ = ' + f(gamma, 5) + '° (' + fDMS(gamma) + ')'
      });
    }
    steps.push({
      t: 'Azimuth garis AP', cond: left ? 'IF P di kiri garis AB' : 'IF P di kanan garis AB',
      fx: left ? 'Az<sub>AP</sub> = Az<sub>AB</sub> − α' : 'Az<sub>AP</sub> = Az<sub>AB</sub> + α',
      sub: 'Az<sub>AP</sub> = ' + f(azAB, 5) + '° ' + (left ? '−' : '+') + ' ' + f(a, 5) + '° = ' + f(rawAP, 5) + '°',
      r: (rawAP < 0 ? 'Negatif, tambah 360°. ' : (rawAP >= 360 ? 'Lebih dari 360°, kurangi 360°. ' : '')) + 'Az<sub>AP</sub> = ' + f(azAP, 5) + '° (' + fDMS(azAP) + ')'
    });
    if (useSine) {
      steps.push({
        t: 'Jarak AP, Metode Sudut-Jarak', cond: 'IF metode = 1 dan jarak AP kosong',
        fx: 'd<sub>AP</sub> = d<sub>AB</sub> × sin β / sin γ',
        sub: 'd<sub>AP</sub> = ' + f(dAB, 3) + ' × sin(' + f(b, 5) + '°) / sin(' + f(gamma, 5) + '°)',
        r: 'd<sub>AP</sub> = ' + f(dAP, 3) + ' m'
      });
    } else {
      steps.push({
        t: 'Jarak AP, Metode Sudut-Jarak', cond: 'IF metode = 1 dan jarak AP diisi',
        fx: 'd<sub>AP</sub> = jarak yang dimasukkan',
        sub: 'd<sub>AP</sub> = ' + f(p.dist, 3) + ' m',
        r: 'd<sub>AP</sub> = ' + f(dAP, 3) + ' m'
      });
    }
  }
  steps.push({
    t: 'Koordinat titik P dari stasiun A',
    fx: 'X<sub>P</sub> = X<sub>A</sub> + ' + (useMatrix ? 't' : 'd<sub>AP</sub>') + ' · sin Az<sub>AP</sub>\nY<sub>P</sub> = Y<sub>A</sub> + ' + (useMatrix ? 't' : 'd<sub>AP</sub>') + ' · cos Az<sub>AP</sub>',
    sub: 'X<sub>P</sub> = ' + f(p.xA, 3) + ' + ' + f(dAP, 3) + ' × sin(' + f(azAP, 5) + '°)\nY<sub>P</sub> = ' + f(p.yA, 3) + ' + ' + f(dAP, 3) + ' × cos(' + f(azAP, 5) + '°)',
    r: 'X<sub>P</sub> = ' + f(xP, 3) + ' m\nY<sub>P</sub> = ' + f(yP, 3) + ' m'
  });

// dibanding nih kalau dari Bbuauahhahahaha
  let check = null;
  if (useMatrix) {
    const x2 = p.xB + u * sBP, y2 = p.yB + u * cBP;
    const ex = x2 - xP, ey = y2 - yP, dd = Math.hypot(ex, ey);
    const r1 = sAP * t - sBP * u - dx, r2 = cAP * t - cBP * u - dy;
    const okc = dd < 0.001 && Math.abs(r1) < 0.001 && Math.abs(r2) < 0.001;
    const cs = [];
    cs.push({
      t: 'Koordinat P dari stasiun B',
      fx: 'X<sub>P</sub> = X<sub>B</sub> + u · sin Az<sub>BP</sub>\nY<sub>P</sub> = Y<sub>B</sub> + u · cos Az<sub>BP</sub>',
      sub: 'X<sub>P</sub> = ' + f(p.xB, 3) + ' + ' + f(u, 3) + ' × sin(' + f(azBP, 5) + '°)\nY<sub>P</sub> = ' + f(p.yB, 3) + ' + ' + f(u, 3) + ' × cos(' + f(azBP, 5) + '°)',
      r: 'X<sub>P</sub> = ' + f(x2, 3) + ' m\nY<sub>P</sub> = ' + f(y2, 3) + ' m'
    });
    cs.push({
      t: 'Selisih terhadap hasil dari stasiun A',
      fx: 'ΔX = X<sub>P(B)</sub> − X<sub>P(A)</sub>\nΔY = Y<sub>P(B)</sub> − Y<sub>P(A)</sub>',
      sub: 'ΔX = ' + f(x2, 4) + ' − (' + f(xP, 4) + ')\nΔY = ' + f(y2, 4) + ' − (' + f(yP, 4) + ')',
      r: 'ΔX = ' + f(ex, 6) + ' m\nΔY = ' + f(ey, 6) + ' m\nSelisih jarak = ' + f(dd, 6) + ' m'
    });
    cs.push({
      t: 'Cek matriks A · [t, u]^T = b', mx: true,
      fx: 'sin Az_AP · t − sin Az_BP · u − (X_B − X_A) = 0\ncos Az_AP · t − cos Az_BP · u − (Y_B − Y_A) = 0',
      sub: '(' + f(sAP, 6) + ')(' + f(t, 3) + ') − (' + f(sBP, 6) + ')(' + f(u, 3) + ') − (' + f(dx, 3) + ') = ' + f(r1, 8) + '\n(' + f(cAP, 6) + ')(' + f(t, 3) + ') − (' + f(cBP, 6) + ')(' + f(u, 3) + ') − (' + f(dy, 3) + ') = ' + f(r2, 8),
      r: 'Sisa baris 1 = ' + f(r1, 8) + ' m\nSisa baris 2 = ' + f(r2, 8) + ' m\n' + (okc ? 'Semua cocok (selisih kurang dari 1 mm).' : 'Ada selisih lebih dari 1 mm.')
    });
    check = { x: x2, y: y2, ex: ex, ey: ey, dd: dd, ok: okc, steps: cs };
  } else if (useSine) {
    const dBP2 = dAB * Math.sin(a * RAD) / Math.sin(gamma * RAD);
    const ba180 = azAB < 180;
    const x2 = p.xB + dBP2 * sBP, y2 = p.yB + dBP2 * cBP;
    const ex = x2 - xP, ey = y2 - yP, dd = Math.hypot(ex, ey), okc = dd < 0.001;
    const cs = [];
    cs.push({
      t: 'Data yang dipakai ulang',
      fx: 'γ = 180° − (α + β)\nd<sub>AB</sub> diambil dari langkah sebelumnya',
      sub: 'γ = 180° − (' + f(a, 5) + '° + ' + f(b, 5) + '°)\nd<sub>AB</sub> = ' + f(dAB, 3) + ' m',
      r: 'γ = ' + f(gamma, 5) + '°\nd<sub>AB</sub> = ' + f(dAB, 3) + ' m'
    });
    cs.push({
      t: 'Azimuth balik Az<sub>BA</sub>', cond: ba180 ? 'IF Az<sub>AB</sub> &lt; 180°' : 'IF Az<sub>AB</sub> ≥ 180°',
      fx: ba180 ? 'Az<sub>BA</sub> = Az<sub>AB</sub> + 180°' : 'Az<sub>BA</sub> = Az<sub>AB</sub> − 180°',
      sub: 'Az<sub>BA</sub> = ' + f(azAB, 5) + '° ' + (ba180 ? '+' : '−') + ' 180°',
      r: 'Az<sub>BA</sub> = ' + f(azBA, 5) + '° (' + fDMS(azBA) + ')'
    });
    cs.push({
      t: 'Jarak BP dengan aturan sinus',
      fx: 'd<sub>BP</sub> = d<sub>AB</sub> × sin α / sin γ',
      sub: 'd<sub>BP</sub> = ' + f(dAB, 3) + ' × sin(' + f(a, 5) + '°) / sin(' + f(gamma, 5) + '°)',
      r: 'd<sub>BP</sub> = ' + f(dBP2, 3) + ' m'
    });
    cs.push({
      t: 'Azimuth garis BP', cond: left ? 'IF P di kiri garis AB' : 'IF P di kanan garis AB',
      fx: left ? 'Az<sub>BP</sub> = Az<sub>BA</sub> + β' : 'Az<sub>BP</sub> = Az<sub>BA</sub> − β',
      sub: 'Az<sub>BP</sub> = ' + f(azBA, 5) + '° ' + (left ? '+' : '−') + ' ' + f(b, 5) + '° = ' + f(rawBP, 5) + '°',
      r: (rawBP < 0 ? 'Negatif, tambah 360°. ' : (rawBP >= 360 ? 'Lebih dari 360°, kurangi 360°. ' : '')) + 'Az<sub>BP</sub> = ' + f(azBP, 5) + '° (' + fDMS(azBP) + ')'
    });
    cs.push({
      t: 'Koordinat P dari titik B',
      fx: 'X<sub>P</sub> = X<sub>B</sub> + d<sub>BP</sub> · sin Az<sub>BP</sub>\nY<sub>P</sub> = Y<sub>B</sub> + d<sub>BP</sub> · cos Az<sub>BP</sub>',
      sub: 'X<sub>P</sub> = ' + f(p.xB, 3) + ' + ' + f(dBP2, 3) + ' × sin(' + f(azBP, 5) + '°)\nY<sub>P</sub> = ' + f(p.yB, 3) + ' + ' + f(dBP2, 3) + ' × cos(' + f(azBP, 5) + '°)',
      r: 'X<sub>P</sub> = ' + f(x2, 3) + ' m\nY<sub>P</sub> = ' + f(y2, 3) + ' m'
    });
    cs.push({
      t: 'Selisih terhadap hasil dari titik A',
      fx: 'ΔX = X<sub>P(B)</sub> − X<sub>P(A)</sub>\nΔY = Y<sub>P(B)</sub> − Y<sub>P(A)</sub>',
      sub: 'ΔX = ' + f(x2, 4) + ' − (' + f(xP, 4) + ')\nΔY = ' + f(y2, 4) + ' − (' + f(yP, 4) + ')',
      r: 'ΔX = ' + f(ex, 6) + ' m\nΔY = ' + f(ey, 6) + ' m\nSelisih jarak = ' + f(dd, 6) + ' m, ' + (okc ? 'cocok (kurang dari 1 mm)' : 'tidak cocok (lebih dari 1 mm)')
    });
    check = { x: x2, y: y2, ex: ex, ey: ey, dd: dd, ok: okc, steps: cs };
  }

// hasil akhir koordinats
  let fin = { x: xP, y: yP }, finalSteps = null;
  if (check) {
    fin = { x: (xP + check.x) / 2, y: (yP + check.y) / 2 };
    finalSteps = [
      {
        t: 'Koordinat P dari titik A dan dari titik B',
        fx: 'Hasil dari titik A: X<sub>P(A)</sub>, Y<sub>P(A)</sub>\nHasil dari titik B: X<sub>P(B)</sub>, Y<sub>P(B)</sub>',
        sub: 'X<sub>P(A)</sub> = ' + f(xP, 3) + '    Y<sub>P(A)</sub> = ' + f(yP, 3) + '\nX<sub>P(B)</sub> = ' + f(check.x, 3) + '    Y<sub>P(B)</sub> = ' + f(check.y, 3),
        r: 'Selisih jarak kedua hasil = ' + f(check.dd, 6) + ' m'
      },
      {
        t: 'Rerata koordinat akhir',
        fx: 'X<sub>P</sub> = (X<sub>P(A)</sub> + X<sub>P(B)</sub>) / 2\nY<sub>P</sub> = (Y<sub>P(A)</sub> + Y<sub>P(B)</sub>) / 2',
        sub: 'X<sub>P</sub> = (' + f(xP, 3) + ' + ' + f(check.x, 3) + ') / 2\nY<sub>P</sub> = (' + f(yP, 3) + ' + ' + f(check.y, 3) + ') / 2',
        r: 'X<sub>P</sub> = ' + f(fin.x, 3) + ' m\nY<sub>P</sub> = ' + f(fin.y, 3) + ' m'
      }
    ];
  }

// tampilans mbalik mrono
  return {
    ok: true, A: { x: p.xA, y: p.yA }, B: { x: p.xB, y: p.yB }, P: fin, PA: { x: xP, y: yP }, finalSteps: finalSteps,
    dAB: dAB, dAP: dAP, dBP: dBP, gamma: gOut, beta: bOut, alpha: a,
    azAB: azAB, azBA: azBA, azAP: azAP, azBP: azBP, theta: q.theta, quad: q.q,
    method: p.method, side: p.side, distSrc: useMatrix ? 'matriks' : (useSine ? 'sinus' : 'input'),
    D: D, t: t, u: u, matrix: useMatrix,
    check: check, steps: steps
  };
}
/*uhuyy ihir*/

// YOK AYOKKKKKK TAMPILANNNNNNN 
(function () {
  const $ = function (id) { return document.getElementById(id); };
// pake data contoh
  const SAMPLE = { xA: '-2206.91', yA: '1563.58', xB: '3148.26', yB: '-4309.31' };
  let curFmt = 'dms';
  let last = null;

/* iki iputnyoooo */
// koma titik, nek bukan angka kosyak
  function numOf(id) { const v = $(id).value.trim().replace(',', '.'); return v === '' ? NaN : Number(v); }
  function numOr0(id) { const v = $(id).value.trim().replace(',', '.'); return v === '' ? 0 : Number(v); }

// sudut dan ikuannya
  function readAngle(pre, name) {
    if (curFmt === 'dms') {
      const d = numOf(pre + 'D'), m = numOr0(pre + 'M'), s = numOr0(pre + 'S');
      if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(s)) return { err: 'Isi derajat, menit, dan detik sudut ' + name + ' dengan angka.' };
      if (d < 0 || m < 0 || s < 0) return { err: 'Derajat, menit, dan detik sudut ' + name + ' tidak boleh negatif.' };
      if (m >= 60 || s >= 60) return { err: 'Menit dan detik sudut ' + name + ' harus kurang dari 60.' };
      return { val: dmsToDec(d, m, s), raw: { d: d, m: m, s: s } };
    }
    const v = numOf(pre + 'Dec');
    if (!Number.isFinite(v)) return { err: 'Isi sudut ' + name + ' dengan angka desimal.' };
    return { val: v, raw: null };
  }

// tung tung hitungg
  function readInput() {
    const A = readAngle('a', 'α'), B = readAngle('b', 'β');
    if (A.err) return { error: A.err };
    if (B.err) return { error: B.err };
    const method = Number(document.querySelector('input[name=method]:checked').value);
    return {
      xA: numOf('xA'), yA: numOf('yA'), xB: numOf('xB'), yB: numOf('yB'),
      alpha: A.val, beta: B.val, fmt: curFmt,
      raw: curFmt === 'dms' ? { a: A.raw, b: B.raw } : null,
      method: method,
      dist: null,
      side: document.querySelector('input[name=side]:checked').value
    };
  }

  function trimNum(v, d) { return String(Number(v.toFixed(d))); }

// ganti format dia autoo konvert asek canggih
  function setFmt(newFmt) {
    const A = readAngle('a', 'α'), B = readAngle('b', 'β');
    curFmt = newFmt;
    const dms = newFmt === 'dms';
    $('aDms').hidden = !dms; $('bDms').hidden = !dms;
    $('aDecWrap').hidden = dms; $('bDecWrap').hidden = dms;
    [['a', A], ['b', B]].forEach(function (x) {
      const pre = x[0], r = x[1];
      if (r.err) return;
      if (dms) {
        const t = decToDms(r.val);
        $(pre + 'D').value = t.d; $(pre + 'M').value = t.m; $(pre + 'S').value = trimNum(t.s, 2);
      } else {
        $(pre + 'Dec').value = trimNum(r.val, 6);
      }
    });
  }

  /* ploting niiiih */
  const n1 = function (v) { return v.toFixed(1); };
// angka bulat estetik
  function niceStep(range) {
    const raw = range / 5, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
  }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function wedge(vx, vy, a1, a2, r) {
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const x1 = vx + r * Math.cos(a1), y1 = vy + r * Math.sin(a1);
    const x2 = vx + r * Math.cos(a1 + d), y2 = vy + r * Math.sin(a1 + d);
    return { path: 'M' + n1(vx) + ',' + n1(vy) + ' L' + n1(x1) + ',' + n1(y1) + ' A' + r + ',' + r + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + n1(x2) + ',' + n1(y2) + ' Z', mid: a1 + d / 2 };
  }
  function compass(cx, cy, R) {
    // Panah arah Utara (menunjuk ke atas) dengan huruf U
    return '<g transform="translate(' + n1(cx) + ',' + n1(cy) + ') scale(.65)">' +
      '<text x="0" y="' + (-R - 6) + '" text-anchor="middle" class="cmp-l">U</text>' +
      '<line x1="0" y1="' + (-R + 14) + '" x2="0" y2="' + R + '" class="cmp-stem"/>' +
      '<polygon points="0,' + (-R) + ' 10,' + (-R + 22) + ' 0,' + (-R + 16) + ' -10,' + (-R + 22) + '" class="cmp-n"/></g>';
  }
  function tickLabel(v, dec) {
    let s = v.toFixed(dec);
    if (Number(s) === 0) s = s.replace('-', '');
    return s.replace('.', ',');
  }

// gambar
  function renderPlot(r) {
    const W = 720, small = false;  // pls di hp bisa jaadi pls
    const H = Math.round(W * (small ? 1.0 : 0.78)), L = small ? 52 : 62, Rm = 18, T = 22, B = 40;
    const aw = W - L - Rm, ah = H - T - B, padX = small ? 62 : 96, padY = small ? 50 : 56;
    const pts = [r.A, r.B, r.P];
    const xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    const spanX = Math.max(maxX - minX, 1e-6), spanY = Math.max(maxY - minY, 1e-6);
    const legH = 62;  // ruang kosong di bawah kotak grid untuk kotak keterangan sudut
    const s = Math.min((aw - 2 * padX) / spanX, (ah - 2 * padY - legH) / spanY);
    const ox = L + (aw - spanX * s) / 2, oy = T + (ah - legH - spanY * s) / 2;
    const X = function (x) { return ox + (x - minX) * s; };
    const Y = function (y) { return oy + (maxY - y) * s; };
    const x0 = minX - (ox - L) / s, x1 = x0 + aw / s, y1 = maxY + (oy - T) / s, y0 = y1 - ah / s;
    const step = niceStep(Math.max(aw / s, ah / s));
    const dec = step >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log10(step)));

    let g = '<rect x="' + L + '" y="' + T + '" width="' + aw + '" height="' + ah + '" class="p-frame"/>';
    for (let i = Math.ceil(x0 / step); i <= Math.floor(x1 / step); i++) {
      const gx = X(i * step);
      g += '<line x1="' + n1(gx) + '" y1="' + T + '" x2="' + n1(gx) + '" y2="' + (T + ah) + '" class="' + (i === 0 ? 'p-axis0' : 'p-grid') + '"/>';
      g += '<text x="' + n1(gx) + '" y="' + (T + ah + 16) + '" text-anchor="middle" class="p-tick">' + tickLabel(i * step, dec) + '</text>';
    }
    for (let i = Math.ceil(y0 / step); i <= Math.floor(y1 / step); i++) {
      const gy = Y(i * step);
      g += '<line x1="' + L + '" y1="' + n1(gy) + '" x2="' + (L + aw) + '" y2="' + n1(gy) + '" class="' + (i === 0 ? 'p-axis0' : 'p-grid') + '"/>';
      g += '<text x="' + (L - 7) + '" y="' + n1(gy + 4) + '" text-anchor="end" class="p-tick">' + tickLabel(i * step, dec) + '</text>';
    }
    g += '<text x="' + (L + aw) + '" y="' + (H - 6) + '" text-anchor="end" class="p-axt">x (m)</text>';
    g += '<text transform="translate(13,' + (T + ah / 2) + ') rotate(-90)" text-anchor="middle" class="p-axt">y (m)</text>';

    const a = { x: X(r.A.x), y: Y(r.A.y) }, b = { x: X(r.B.x), y: Y(r.B.y) }, p = { x: X(r.P.x), y: Y(r.P.y) };
    const cen = { x: (a.x + b.x + p.x) / 3, y: (a.y + b.y + p.y) / 3 };
    g += '<polygon points="' + n1(a.x) + ',' + n1(a.y) + ' ' + n1(b.x) + ',' + n1(b.y) + ' ' + n1(p.x) + ',' + n1(p.y) + '" class="p-tri"/>';

    // u dan azimumuth
    const rn = small ? 36 : 56;
    g += '<line x1="' + n1(a.x) + '" y1="' + n1(a.y) + '" x2="' + n1(a.x) + '" y2="' + n1(a.y - (small ? 54 : 78)) + '" class="p-north"/>';
    const ea = -Math.PI / 2 + r.azAB * RAD;
    g += '<path d="M' + n1(a.x) + ',' + n1(a.y - rn) + ' A' + rn + ',' + rn + ' 0 ' + (r.azAB > 180 ? 1 : 0) + ' 1 ' + n1(a.x + rn * Math.cos(ea)) + ',' + n1(a.y + rn * Math.sin(ea)) + '" class="p-az"/>';
    const ma = -Math.PI / 2 + (r.azAB / 2) * RAD;
    if (small) {
      // kok nabrak nabrakkkkkkkkkkkk fix pls ojoks nabrakkkk
      g += '<text x="' + n1(a.x - 6) + '" y="' + n1(a.y - rn - 10) + '" text-anchor="end" class="p-azt">Az_AB</text>';
    } else {
      g += '<text x="' + n1(a.x + (rn + 16) * Math.cos(ma)) + '" y="' + n1(a.y + (rn + 16) * Math.sin(ma) + 4) + '" text-anchor="middle" class="p-azt">Az_AB</text>';
    }

    g += '<line x1="' + n1(a.x) + '" y1="' + n1(a.y) + '" x2="' + n1(b.x) + '" y2="' + n1(b.y) + '" class="p-base"/>';
    // panah arah
    {
      const adx = b.x - a.x, ady = b.y - a.y, al = Math.hypot(adx, ady);
      if (al > 60) {
        const ux = adx / al, uy = ady / al, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ah = 10, aw = 7;
        const tx = mx + ux * ah, ty = my + uy * ah, bx0 = mx - ux * ah, by0 = my - uy * ah;
        g += '<polygon points="' + n1(tx) + ',' + n1(ty) + ' ' + n1(bx0 - uy * aw) + ',' + n1(by0 + ux * aw) + ' ' + n1(bx0 + uy * aw) + ',' + n1(by0 - ux * aw) + '" class="p-arrow"/>';
      }
    }
    g += '<line x1="' + n1(a.x) + '" y1="' + n1(a.y) + '" x2="' + n1(p.x) + '" y2="' + n1(p.y) + '" class="p-ray"/>';
    g += '<line x1="' + n1(b.x) + '" y1="' + n1(b.y) + '" x2="' + n1(p.x) + '" y2="' + n1(p.y) + '" class="p-ray"/>';

    // sududuut
    [[a, b, p, 'α', r.alpha], [b, a, p, 'β', r.beta], [p, a, b, 'γ', r.gamma]].forEach(function (v) {
      const vt = v[0], t1 = v[1], t2 = v[2];
      const len = Math.min(Math.hypot(t1.x - vt.x, t1.y - vt.y), Math.hypot(t2.x - vt.x, t2.y - vt.y));
      const rad = Math.max(26, Math.min(40, len * 0.35));
      const w = wedge(vt.x, vt.y, Math.atan2(t1.y - vt.y, t1.x - vt.x), Math.atan2(t2.y - vt.y, t2.x - vt.x), rad);
      g += '<path d="' + w.path + '" class="p-wedge"/>';
      g += '<text x="' + n1(vt.x + rad * 0.68 * Math.cos(w.mid)) + '" y="' + n1(vt.y + rad * 0.68 * Math.sin(w.mid) + 4) + '" text-anchor="middle" class="p-ang">' + v[3] + '</text>';
    });

    // paaannnjjjjangggg
    [[a, b, p, r.dAB, 'AB'], [a, p, b, r.dAP, 'AP'], [b, p, a, r.dBP, 'BP']].forEach(function (sd) {
      const p1 = sd[0], p2 = sd[1], third = sd[2];
      const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy);
      if (len < 130) return;
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      let nx = -dy / len, ny = dx / len;
      if ((mx - third.x) * nx + (my - third.y) * ny < 0) { nx = -nx; ny = -ny; }
      let ang = Math.atan2(dy, dx) * DEG;
      if (ang > 90) ang -= 180;
      if (ang < -90) ang += 180;
      g += '<text transform="translate(' + n1(mx + nx * 14) + ',' + n1(my + ny * 14 + 4) + ') rotate(' + n1(ang) + ')" text-anchor="middle" class="p-len">d' + sd[4] + ' = ' + f(sd[3], 3) + ' m</text>';
    });

    // ada titik titik di titik
    [['A', a, r.A, 'p-pc', false], ['B', b, r.B, 'p-pc', false], ['P', p, r.P, 'p-pp', true]].forEach(function (v) {
      const pt = v[1], c = v[2];
      g += '<circle cx="' + n1(pt.x) + '" cy="' + n1(pt.y) + '" r="' + (v[4] ? 7 : 5.5) + '" class="' + v[3] + '"/>';
      let ux = pt.x - cen.x, uy = pt.y - cen.y;
      const ul = Math.hypot(ux, uy) || 1;
      ux /= ul; uy /= ul;
      const lx = pt.x + ux * 17;
      const top = uy < -0.35 ? pt.y + uy * 17 - 28 : (uy > 0.35 ? pt.y + uy * 17 + 2 : pt.y - 18);
      const anc = ux > 0.35 ? 'start' : (ux < -0.35 ? 'end' : 'middle');
      g += '<text x="' + n1(lx) + '" y="' + n1(top + 15) + '" text-anchor="' + anc + '" class="p-name' + (v[4] ? ' p' : '') + '">' + v[0] + '</text>';
      g += '<text x="' + n1(lx) + '" y="' + n1(top + 27) + '" text-anchor="' + anc + '" class="p-co">(' + f(c.x, 2) + '; ' + f(c.y, 2) + ')</text>';
    });

    // arah di yang palng lowong pls ojoks pating menumpuks dongg
    const Rc = 28, m = Rc + 26;
    const cands = [[L + aw - m, T + m], [L + m, T + m], [L + aw - m, T + ah - m]];
    let best = null, bestScore = -1;
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i];
      let sc = Math.min(
        Math.hypot(c[0] - a.x, c[1] - a.y), Math.hypot(c[0] - b.x, c[1] - b.y), Math.hypot(c[0] - p.x, c[1] - p.y),
        segDist(c[0], c[1], a.x, a.y, b.x, b.y), segDist(c[0], c[1], a.x, a.y, p.x, p.y), segDist(c[0], c[1], b.x, b.y, p.x, p.y)
      );
      if (sc > 110) { best = c; bestScore = sc; break; }
      if (sc > bestScore) { best = c; bestScore = sc; }
    }
    g += compass(best[0], best[1], Rc);

    // kotak keterangan sudut di kiri bawah, di dalam kotak grid (ruangnya disisakan lewat legH)
    const lgY = T + ah - 8 - 58;
    g += '<rect x="' + (L + 8) + '" y="' + lgY + '" width="100" height="58" rx="3" class="p-leg-bg"/>';
    [['α', r.alpha], ['β', r.beta], ['γ', r.gamma]].forEach(function (v, i) {
      g += '<text x="' + (L + 18) + '" y="' + (lgY + 18 + 16 * i) + '" class="p-leg">' + v[0] + ' = ' + f(v[1], 2) + '°</text>';
    });

    $('gridCap').textContent = 'Satu kotak grid = ' + tickLabel(step, dec) + ' m, skala sama pada sumbu x dan y.';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Plot segitiga A, P, B dengan panah arah utara">' + g + '</svg>';
  }

  /* hasillllllllll tampilan  */
  function dual(v) { return f(v, 5) + '°<span class="s">' + fDMS(v) + '</span>'; }

  function methodLabel(r) {
    return r.method === 2 ? 'Sudut-Sudut' : 'Sudut-Jarak';
  }

// salin unduh, bimbang unduh iya po gaush iiiihhhhhhhhhhh
  function resultText(r) {
    return [
      'Titik P (' + methodLabel(r) + ')',
      'x_P = ' + f(r.P.x) + ' m', 'y_P = ' + f(r.P.y) + ' m',
      'd_AB = ' + f(r.dAB) + ' m', 'd_AP = ' + f(r.dAP) + ' m', 'd_BP = ' + f(r.dBP) + ' m',
      'gamma = ' + f(r.gamma, 5) + ' deg (' + fDMS(r.gamma) + ')',
      'azimuth AB = ' + f(r.azAB, 5) + ' deg', 'azimuth AP = ' + f(r.azAP, 5) + ' deg'
    ].concat(r.matrix ? ['azimuth BP = ' + f(r.azBP, 5) + ' deg', 'D = ' + f(r.D, 6), 't = ' + f(r.t) + ' m', 'u = ' + f(r.u) + ' m'] : []).join('\n');
  }

// ringkasanny
  function render(r) {
    $('pX').innerHTML = f(r.P.x) + '<i>m</i>';
    $('pY').innerHTML = f(r.P.y) + '<i>m</i>';
    const rows = [
      ['Metode', methodLabel(r)],
      ['Posisi P terhadap A→B', r.side === 'kiri' ? 'Kiri' : 'Kanan'],
      ['Sumber x<sub>P</sub>, y<sub>P</sub>', r.finalSteps ? 'Rerata hasil dari titik A dan B' : 'Hasil dari titik A'],
      ['d<sub>AB</sub> (baseline)', f(r.dAB) + ' m'],
      [(r.matrix ? 't' : 'd<sub>AP</sub>'), f(r.dAP) + ' m' + (r.distSrc === 'input' ? '<span class="s">jarak dari input</span>' : '')],
      [(r.matrix ? 'u' : 'd<sub>BP</sub>'), f(r.dBP) + ' m'],
      ['Sudut γ di P', dual(r.gamma)],
      ['Azimuth Az<sub>AB</sub>', dual(r.azAB) + '<span class="s">' + r.quad + '</span>'],
      ['Azimuth Az<sub>AP</sub>', dual(r.azAP)]
    ];
    if (r.matrix) {
      rows.push(['Azimuth Az<sub>BP</sub>', dual(r.azBP)]);
      rows.push(['Determinan D', f(r.D, 6)]);
    }
    $('rows').innerHTML = rows.map(function (x) { return '<tr><th scope="row">' + x[0] + '</th><td>' + x[1] + '</td></tr>'; }).join('');
    $('plot').innerHTML = renderPlot(r);
    vb = null; setVB();
    renderAcc('steps', r.steps);
    renderChk(r);
    renderFin(r);
  }

// bukak tutup bagus
  function renderAcc(id, items) {
    const el = $(id);
    const prev = Array.prototype.map.call(el.querySelectorAll('details'), function (d) { return d.open; });
    const keep = prev.length === items.length;
    el.innerHTML = items.map(function (st, i) {
      const open = keep ? prev[i] : false;
      const mx = st.mx ? ' mx' : '';
      return '<details' + (open ? ' open' : '') + '><summary><span class="s-n">' + (i + 1) + '</span><span class="s-t">' + st.t + '</span><span class="chev" aria-hidden="true"></span></summary>' +
        '<div class="body">' + (st.cond ? '<span class="chip">' + st.cond + '</span>' : '') +
        '<div class="lbl">Rumus</div><code class="fx' + mx + '">' + st.fx + '</code>' +
        '<div class="lbl">Substitusi</div><code class="sb' + mx + '">' + st.sub + '</code>' +
        '<div class="lbl">Hasil</div><code class="rs' + mx + '">' + st.r + '</code></div></details>';
    }).join('');
  }

// koordinat akhiriririri
  function renderFin(r) {
    const st = r.finalSteps;
    $('finSum').hidden = !st; $('finTools').hidden = !st; $('finSteps').hidden = !st;
    if (!st) {
      return;
    }
    $('finSum').innerHTML = '<div class="cmpwrap"><table class="ct"><thead><tr><th scope="col">Besaran</th><th scope="col">Dari titik A</th><th scope="col">Dari titik B</th><th scope="col">Rerata (akhir)</th></tr></thead><tbody>' +
      '<tr><td>x<sub>P</sub> (m)</td><td>' + f(r.PA.x, 3) + '</td><td>' + f(r.check.x, 3) + '</td><td><b>' + f(r.P.x, 3) + '</b></td></tr>' +
      '<tr><td>y<sub>P</sub> (m)</td><td>' + f(r.PA.y, 3) + '</td><td>' + f(r.check.y, 3) + '</td><td><b>' + f(r.P.y, 3) + '</b></td></tr>' +
      '</tbody></table></div>';
    renderAcc('finSteps', st);
  }

// pembanading bbbbbb
  function renderChk(r) {
    const c = r.check;
    $('chkSum').hidden = !c; $('chkTools').hidden = !c; $('chkSteps').hidden = !c;
    if (!c) {
      return;
    }
    $('chkSum').innerHTML = '<div class="cmpwrap"><table class="ct"><thead><tr><th scope="col">Besaran</th><th scope="col">Dari titik A</th><th scope="col">Dari titik B</th><th scope="col">Selisih</th></tr></thead><tbody>' +
      '<tr><td>x<sub>P</sub> (m)</td><td>' + f(r.PA.x, 3) + '</td><td>' + f(c.x, 3) + '</td><td>' + f(c.ex, 6) + '</td></tr>' +
      '<tr><td>y<sub>P</sub> (m)</td><td>' + f(r.PA.y, 3) + '</td><td>' + f(c.y, 3) + '</td><td>' + f(c.ey, 6) + '</td></tr>' +
      '<tr><td>Status</td><td colspan="3"><span class="badge' + (c.ok ? '' : ' bad') + '">' + (c.ok ? 'Cocok, selisih ' + f(c.dd, 6) + ' m' : 'Tidak cocok, selisih ' + f(c.dd, 4) + ' m') + '</span></td></tr>' +
      '</tbody></table></div>';
    renderAcc('chkSteps', c.steps);
  }

// ini nek ada perubahan tiap input
  function run() {
    const need = ['xA', 'yA', 'xB', 'yB'].concat(curFmt === 'dms' ? ['aD', 'bD'] : ['aDec', 'bDec']);
    const incomplete = need.some(function (id) { return $(id).value.trim() === ''; }) ||
      !document.querySelector('input[name=method]:checked') || !document.querySelector('input[name=side]:checked');
    $('empty').hidden = !incomplete;
    if (incomplete) { $('alert').hidden = true; $('result').hidden = true; $('explain').hidden = true; last = null; return; }
    const p = readInput();
    const res = p.error ? { ok: false, error: p.error } : compute(p);
    const bad = !res.ok;
    $('alert').hidden = !bad;
    $('result').hidden = bad;
    $('explain').hidden = bad;
    if (bad) { $('alert').textContent = res.error; last = null; return; }
    last = res;
    render(res);
  }

  /* pencet pencet */
  let rzTimer = null, rzW = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      const w = $('plot').clientWidth;
      if (last && w > 0 && w !== rzW) { rzW = w; $('plot').innerHTML = renderPlot(last); setVB(); }
    }, 150);
  });

  $('form').addEventListener('input', run);
  $('form').addEventListener('submit', function (e) {
    e.preventDefault();
    run();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('result').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });
  document.querySelectorAll('input[name=fmt]').forEach(function (el) {
    el.addEventListener('change', function () { setFmt(el.value); run(); });
  });
  document.querySelectorAll('input[name=method]').forEach(function (el) {
    el.addEventListener('change', run);
  });
// data contoh kih
  $('resetBtn').addEventListener('click', function () {
    Object.keys(SAMPLE).forEach(function (k) { $(k).value = SAMPLE[k]; });
    $('fmtDms').checked = true; setFmt('dms');
    $('aD').value = '55'; $('aM').value = '10'; $('aS').value = '34';
    $('bD').value = '74'; $('bM').value = '8'; $('bS').value = '56';
    $('m2').checked = true;
    $('sideL').checked = true;
    run();
  });

// hapus semua isi
  $('clearBtn').addEventListener('click', function () {
    ['xA', 'yA', 'xB', 'yB', 'aD', 'aM', 'aS', 'bD', 'bM', 'bS', 'aDec', 'bDec'].forEach(function (id) { $(id).value = ''; });
    $('fmtDms').checked = true; setFmt('dms');
    ['m1', 'm2', 'sideL', 'sideR'].forEach(function (id) { $(id).checked = false; });
    run();
    $('xA').focus();
  });

// salin hasilnyooy iki kenpopopopopopopopopo 
  let copyTimer = null;
  $('copyBtn').addEventListener('click', function () {
    if (!last) return;
    const text = resultText(last), btn = $('copyBtn');
    const done = function (msg) { btn.textContent = msg; clearTimeout(copyTimer); copyTimer = setTimeout(function () { btn.textContent = 'Salin hasil'; }, 1800); };
    const fallback = function () {
      const box = $('copyBox'); box.value = text; box.hidden = false; box.focus(); box.select();
      done('Pilih dan salin teks di bawah');
    };
    try {
      navigator.clipboard.writeText(text).then(function () { $('copyBox').hidden = true; done('Tersalin'); }, fallback);
    } catch (e) { fallback(); }
  });

  document.querySelectorAll('[data-acc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const open = btn.getAttribute('data-open') === '1';
      $(btn.getAttribute('data-acc')).querySelectorAll('details').forEach(function (d) { d.open = open; });
    });
  });

// Zoom geser geser plotan
  const VW = 720, VH = 560;
  let vb = null;
  function setVB() {
    const sv = $('plot').querySelector('svg'); if (!sv) return;
    const v = vb || { x: 0, y: 0, w: VW, h: VH };
    sv.setAttribute('viewBox', v.x + ' ' + v.y + ' ' + v.w + ' ' + v.h);
    $('plot').classList.toggle('zoomed', !!vb);
  }
  // batas geser: kalau diperbesar (w < VW) tidak keluar dari gambar, kalau diperkecil (w > VW) gambar boleh bergeser di dalam bidang lebar
  function clampV(v, full, w) { return Math.min(Math.max(v, Math.min(0, full - w)), Math.max(0, full - w)); }
  function zoomBy(fac, fx, fy) {
    const cur = vb || { x: 0, y: 0, w: VW, h: VH };
    let w = Math.min(VW * 3, Math.max(VW / 8, cur.w / fac));
    if (Math.abs(w - VW) < 0.5) { vb = null; setVB(); return; }
    const h = w * VH / VW, px = cur.x + fx * cur.w, py = cur.y + fy * cur.h;
    vb = { x: clampV(px - fx * w, VW, w), y: clampV(py - fy * h, VH, h), w: w, h: h };
    setVB();
  }
  $('zIn').addEventListener('click', function () { zoomBy(1.6, 0.5, 0.5); });
  $('zOut').addEventListener('click', function () { zoomBy(1 / 1.6, 0.5, 0.5); });
  $('zReset').addEventListener('click', function () { vb = null; setVB(); });
  (function () {
    const pl = $('plot'), ptrs = new Map();
    let pinch = 0;
    function frac(e) { const r = pl.querySelector('svg').getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
    pl.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault(); const q = frac(e); zoomBy(e.deltaY < 0 ? 1.25 : 0.8, q[0], q[1]);
    }, { passive: false });
    pl.addEventListener('dblclick', function (e) { const q = frac(e); zoomBy(2, q[0], q[1]); });
    pl.addEventListener('pointerdown', function (e) {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) { const a = Array.from(ptrs.values()); pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
      try { pl.setPointerCapture(e.pointerId); } catch (x) {}
    });
    pl.addEventListener('pointermove', function (e) {
      const prev = ptrs.get(e.pointerId); if (!prev) return;
      const sv = pl.querySelector('svg'); if (!sv) return;
      if (ptrs.size === 2) {
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const a = Array.from(ptrs.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (pinch > 0 && d > 0) {
          const r = sv.getBoundingClientRect();
          zoomBy(d / pinch, ((a[0].x + a[1].x) / 2 - r.left) / r.width, ((a[0].y + a[1].y) / 2 - r.top) / r.height);
        }
        pinch = d; return;
      }
      if (!vb) return;
      const r = sv.getBoundingClientRect();
      vb.x = clampV(vb.x - (e.clientX - prev.x) / r.width * vb.w, VW, vb.w);
      vb.y = clampV(vb.y - (e.clientY - prev.y) / r.height * vb.h, VH, vb.h);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setVB();
    });
    function up(e) { ptrs.delete(e.pointerId); pinch = 0; }
    pl.addEventListener('pointerup', up); pl.addEventListener('pointercancel', up);
  })();

/* unduh dan cetak josjis*/
  $('dlBtn').addEventListener('click', function () {
    if (!last) return;
    const blob = new Blob([resultText(last) + '\n'], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'hasil-titik-P.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* temanya reks */
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function effective() { return document.documentElement.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light'); }
  function themeLabel() { $('themeBtn').textContent = effective() === 'dark' ? 'Tema terang' : 'Tema gelap'; }
  $('themeBtn').addEventListener('click', function () {
    document.documentElement.setAttribute('data-theme', effective() === 'dark' ? 'light' : 'dark');
    themeLabel();
  });
  if (mq.addEventListener) mq.addEventListener('change', themeLabel);
  new MutationObserver(themeLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  themeLabel();

  run();
})();
// masyaallah  tabarakallah subhanallah
