// script.js - Ứng dụng phong thủy bất động sản

/* ===================== HÀM TIỆN ÍCH ===================== */
function parseDateParts(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') throw new Error('Ngày sinh không hợp lệ');
    dateStr = dateStr.trim();
    const sep = dateStr.includes('-') ? '-' : (dateStr.includes('/') ? '/' : null);
    if (!sep) throw new Error('Định dạng ngày phải có "-" hoặc "/" (ví dụ 1992-03-13 hoặc 13/03/1992)');
    const parts = dateStr.split(sep).map(p => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Định dạng ngày không đúng');
    if (parts[0] > 31) {
        return { year: parts[0], month: parts[1], day: parts[2] };
    } else {
        return { year: parts[2], month: parts[1], day: parts[0] };
    }
}

function getEffectiveBirthYear(birthDateString) {
    const { year, month, day } = parseDateParts(birthDateString);
    if (month < 3 || (month === 3 && day <= 13)) return year - 1;
    return year;
}

function digitalRoot(year) {
    let sum = String(year).split('').reduce((a, b) => a + Number(b), 0);
    while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
    return sum === 0 ? 9 : sum;
}

/* ===================== TÍNH CUNG MỆNH ===================== */
function getCungMenh(birthDateString, gender) {
    const effYear = getEffectiveBirthYear(birthDateString);
    const soDiaChi = digitalRoot(effYear);
    let soCung;
    if (gender === 'nam') soCung = (soDiaChi + 2) % 9;
    else soCung = (soDiaChi + 8) % 9;
    if (soCung === 0) soCung = 9;

    const mapping = {
        1: { cung: 'Khảm', nguyenTo: 'Thủy', huong: 'Bắc' },
        2: { cung: 'Ly',   nguyenTo: 'Hỏa',  huong: 'Nam' },
        3: { cung: 'Cấn',  nguyenTo: 'Thổ',  huong: 'Đông Bắc' },
        4: { cung: 'Đoài', nguyenTo: 'Kim',  huong: 'Tây Nam' },
        5: { cung: 'Càn',  nguyenTo: 'Thổ',  huong: 'Đông' },
        6: { cung: 'Khôn', nguyenTo: 'Kim',  huong: 'Tây' },
        7: { cung: 'Tốn',  nguyenTo: 'Thổ',  huong: 'Đông Nam' },
        8: { cung: 'Chấn', nguyenTo: 'Mộc',  huong: 'Bắc Tây' },
        9: { cung: 'Khôn', nguyenTo: 'Kim',  huong: 'Tây' }
    };
    return { effectiveYear: effYear, soDiaChi, soCung, ...mapping[soCung] };
}

/* ===================== 12 CON GIÁP ===================== */
const ZODIAC = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

function getZodiacIndexFromYear(year) {
    const idx0 = ((year - 4) % 12 + 12) % 12;
    return idx0 + 1;
}

function getZodiacNameFromIndex(index1to12) {
    return ZODIAC[index1to12 - 1];
}

function getZodiacNameFromYear(year) {
    return getZodiacNameFromIndex(getZodiacIndexFromYear(year));
}

/* ===================== KIỂM TRA TAM TAI ===================== */
function checkTamTai(ownerZodiacIndex, constructionYear) {
    const cIndex = getZodiacIndexFromYear(constructionYear);
    const t1 = ((ownerZodiacIndex + 3 - 1) % 12) + 1;
    const t2 = ((ownerZodiacIndex + 4 - 1) % 12) + 1;
    const t3 = ((ownerZodiacIndex + 5 - 1) % 12) + 1;
    const tamTaiList = [t1, t2, t3].map(i => getZodiacNameFromIndex(i));
    return {
        isTamTai: [t1, t2, t3].includes(cIndex),
        tamTaiList,
        constructionChi: getZodiacNameFromIndex(cIndex)
    };
}

/* ===================== KIỂM TRA KIM LÂU ===================== */
function checkKimLau(tuoiMu) {
    let rem = tuoiMu % 9;
    if (rem === 0) rem = 9;
    const badSet = {1: 'Kim Lâu Thân', 3: 'Kim Lâu Thê', 6: 'Kim Lâu Tử', 8: 'Kim Lâu Lục Súc'};
    const isKimLau = [1,3,6,8].includes(rem);
    return {
        isKimLau,
        kimLauType: isKimLau ? badSet[rem] : null,
        remainder: rem
    };
}

/* ===================== KIỂM TRA HOANG ỐC ===================== */
function checkHoangOc(tuoiMu) {
    const cycle = ['Nhất Cát','Nhì Nghi','Tam Địa Sát','Tứ Tấn Tài','Ngũ Thọ Tử','Lục Hoang Ốc'];
    const mod = tuoiMu % 6;
    const idx = (mod === 0) ? 5 : (mod - 1);
    const name = cycle[idx];
    const isBad = ['Tam Địa Sát','Ngũ Thọ Tử','Lục Hoang Ốc'].includes(name);
    return { hoangOcName: name, isBad };
}

/* ===================== XUNG TUỔI ===================== */
function checkXungTuoi(ownerZodiacIndex, constructionYear) {
    const cIndex = getZodiacIndexFromYear(constructionYear);
    const opposite = ((ownerZodiacIndex + 6 - 1) % 12) + 1;
    return { isXung: cIndex === opposite, constructionChi: getZodiacNameFromIndex(cIndex), oppositeChi: getZodiacNameFromIndex(opposite) };
}

/* ===================== NGŨ HÀNH ===================== */
function getElementFromYear(year) {
    const s = ((year - 4) % 10 + 10) % 10;
    if (s === 0 || s === 1) return 'Mộc';
    if (s === 2 || s === 3) return 'Hỏa';
    if (s === 4 || s === 5) return 'Thổ';
    if (s === 6 || s === 7) return 'Kim';
    return 'Thủy';
}

function getElementFromMonth(month) {
    month = Number(month);
    if ([1,6,11].includes(month)) return 'Thủy';
    if ([2,7,12].includes(month)) return 'Hỏa';
    if ([3,8].includes(month)) return 'Thổ';
    if ([4,9].includes(month)) return 'Kim';
    if ([5,10].includes(month)) return 'Mộc';
    return null;
}

const KHAK = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
function isElementConflict(e1, e2) {
    if (!e1 || !e2) return false;
    return (KHAK[e1] === e2) || (KHAK[e2] === e1);
}

/* ===================== KIỂM TRA HƯỚNG NHÀ ===================== */
function checkHuongNha(cungMenh, huongNha) {
    const huongTotXau = {
        'Khảm': {
            tot: ['Bắc', 'Đông', 'Đông Nam'],
            xau: ['Nam', 'Tây', 'Tây Bắc']
        },
        'Ly': {
            tot: ['Nam', 'Đông', 'Đông Nam'],
            xau: ['Bắc', 'Tây', 'Tây Bắc']
        },
        'Cấn': {
            tot: ['Đông Bắc', 'Tây Nam', 'Tây'],
            xau: ['Đông', 'Nam', 'Bắc']
        },
        'Đoài': {
            tot: ['Tây Nam', 'Đông Bắc', 'Tây'],
            xau: ['Đông', 'Nam', 'Bắc']
        },
        'Càn': {
            tot: ['Đông', 'Tây', 'Tây Bắc'],
            xau: ['Nam', 'Bắc', 'Đông Nam']
        },
        'Khôn': {
            tot: ['Tây', 'Tây Nam', 'Đông Bắc'],
            xau: ['Đông', 'Bắc', 'Nam']
        },
        'Tốn': {
            tot: ['Đông Nam', 'Bắc', 'Nam'],
            xau: ['Tây', 'Tây Bắc', 'Đông Bắc']
        },
        'Chấn': {
            tot: ['Đông', 'Bắc', 'Nam'],
            xau: ['Tây', 'Tây Bắc', 'Đông Nam']
        }
    };

    const info = huongTotXau[cungMenh.cung];
    const isGood = info.tot.includes(huongNha);
    const isBad = info.xau.includes(huongNha);

    return {
        isGood,
        isBad,
        type: isGood ? 'good' : (isBad ? 'bad' : 'neutral')
    };
}

/* ===================== KIỂM TRA YẾU TỐ XẤU CỦA BẤT ĐỘNG SẢN ===================== */
function checkBatDongSanXau(locationFeatures) {
    const problems = [];
    const solutions = [];

    if (locationFeatures.includes('benh-vien')) {
        problems.push('Trước mặt là bệnh viện (âm khí nặng, ảnh hưởng sức khỏe).');
        solutions.push('Hóa giải: Trồng cây xanh, treo gương Bát Quái, đặt tượng Phật Di Lặc.');
    }

    if (locationFeatures.includes('chua-nha-tho')) {
        problems.push('Trước mặt là chùa/nhà thờ (âm khí mạnh, ảnh hưởng tài lộc).');
        solutions.push('Hóa giải: Đặt tượng Quan Công, treo chuông gió, trồng cây Kim Ngân.');
    }

    if (locationFeatures.includes('truong-hoc')) {
        problems.push('Trước mặt là trường học (ảnh hưởng đến sự yên tĩnh).');
        solutions.push('Hóa giải: Đặt vách ngăn, treo rèm cửa, sử dụng vật phẩm phong thủy.');
    }

    if (locationFeatures.includes('duong-dam')) {
        problems.push('Đường đâm thẳng vào nhà (gây hao tán tài lộc, ảnh hưởng sức khỏe).');
        solutions.push('Hóa giải: Đặt đá phong thủy, trồng cây to, lắp gương Bát Quái.');
    }

    if (locationFeatures.includes('nga-ba') || locationFeatures.includes('nga-tu')) {
        problems.push('Nằm ở ngã ba/ngã tư (khí lưu động mạnh, gây bất ổn).');
        solutions.push('Hóa giải: Đặt bể cá, trồng cây xanh, treo chuông gió.');
    }

    if (locationFeatures.includes('duong-doc')) {
        problems.push('Đường ngang dốc trước nhà (khí không ổn định).');
        solutions.push('Hóa giải: Đặt đá Thạch Anh, trồng cây chắn gió.');
    }

    if (locationFeatures.includes('cot-dien')) {
        problems.push('Có cột điện gần nhà (phá khí, ảnh hưởng sức khỏe).');
        solutions.push('Hóa giải: Đặt tượng Rồng, treo gương Bát Quái, trồng cây cao.');
    }

    return { problems, solutions };
}

/* ===================== TỔNG HỢP KIỂM TRA ===================== */
function evaluateAll(birthDateString, gender, constructionYear, constructionMonth, locationFeatures, huongNha) {
    // 1. Cung mệnh
    const cung = getCungMenh(birthDateString, gender);

    // 2. Tuổi mụ
    const tuoiMu = Number(constructionYear) - Number(cung.effectiveYear) + 1;

    // 3. Kiểm tra Kim Lâu, Hoang Ốc, Tam Tai, Xung Tuổi
    const kimLau = checkKimLau(tuoiMu);
    const hoangOc = checkHoangOc(tuoiMu);
    const ownerChiIndex = getZodiacIndexFromYear(cung.effectiveYear);
    const tamTai = checkTamTai(ownerChiIndex, constructionYear);
    const xung = checkXungTuoi(ownerChiIndex, constructionYear);

    // 4. Ngũ hành năm & tháng
    const yearElement = getElementFromYear(constructionYear);
    const monthElement = getElementFromMonth(constructionMonth);
    const conflictYear = isElementConflict(cung.nguyenTo, yearElement);
    const conflictMonth = isElementConflict(cung.nguyenTo, monthElement);

    // 5. Kiểm tra hướng nhà
    const huongNhaResult = checkHuongNha(cung, huongNha);

    // 6. Kiểm tra yếu tố xấu của bất động sản
    const batDongSanResult = checkBatDongSanXau(locationFeatures);

    // 7. Tập hợp cảnh báo
    const yearWarnings = [];
    if (kimLau.isKimLau) yearWarnings.push(`PHẠM KIM LÂU (${kimLau.kimLauType})`);
    if (tamTai.isTamTai) yearWarnings.push(`PHẠM TAM TAI (năm ${constructionYear} là năm ${tamTai.constructionChi}; tam tai cho bạn: ${tamTai.tamTaiList.join(', ')})`);
    if (hoangOc.isBad) yearWarnings.push(`PHẠM HOANG ỐC (${hoangOc.hoangOcName})`);
    if (xung.isXung) yearWarnings.push(`XUNG TUỔI với năm ${constructionYear} (năm ${xung.constructionChi} đối xung với ${xung.oppositeChi})`);
    if (conflictYear) yearWarnings.push(`XUNG NGŨ HÀNH: Cung (${cung.nguyenTo}) và Năm (${yearElement}) khắc nhau`);

    const monthWarnings = [];
    if (conflictMonth) monthWarnings.push(`THÁNG ${constructionMonth} xung Ngũ Hành với Cung (${cung.nguyenTo})`);

    return {
        cung,
        tuoiMu,
        kimLau,
        hoangOc,
        tamTai,
        xung,
        yearElement,
        monthElement,
        yearWarnings,
        monthWarnings,
        huongNhaResult,
        batDongSanProblems: batDongSanResult.problems,
        batDongSanSolutions: batDongSanResult.solutions,
        isYearGood: yearWarnings.length === 0,
        isMonthGood: monthWarnings.length === 0
    };
}

/* ===================== HOOK VỚI UI ===================== */
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-analyze');
    if (!btn) return;

    btn.addEventListener('click', function() {
        try {
            // 1. Lấy dữ liệu từ form
            const birth = document.getElementById('ngay-sinh').value;
            const gender = document.getElementById('gioi-tinh').value;
            const yearX = parseInt(document.getElementById('nam-xay').value, 10);
            const monthX = parseInt(document.getElementById('thang-xay').value, 10);
            const huongNha = document.getElementById('huong-nha').value;

            // 2. Lấy các yếu tố xấu của bất động sản
            const locationFeatures = [];
            const featureCheckboxes = document.querySelectorAll('input[name="location-feature"]:checked');
            featureCheckboxes.forEach(checkbox => {
                locationFeatures.push(checkbox.value);
            });

            // 3. Kiểm tra
            const result = evaluateAll(birth, gender, yearX, monthX, locationFeatures, huongNha);

            // 4. Hiển thị kết quả
            let html = '';
            html += `<h3>1. Phong Thủy Cá Nhân</h3>`;
            html += `<p><strong>Cung mệnh:</strong> ${result.cung.cung} — Nguyên tố: ${result.cung.nguyenTo} — Hướng: ${result.cung.huong}</p>`;
            html += `<p><strong>Tuổi mụ:</strong> ${result.tuoiMu}</p>`;

            html += `<h4>Kết luận về Năm ${yearX}:</h4>`;
            if (result.yearWarnings.length === 0) {
                html += `<p class="good">Năm ${yearX} KHÔNG CÓ CẢNH BÁO LỚN.</p>`;
            } else {
                html += `<ul>`;
                for (const w of result.yearWarnings) {
                    html += `<li class="bad">${w}</li>`;
                }
                html += `</ul>`;
            }

            html += `<h4>Kết luận về Tháng ${monthX}:</h4>`;
            if (result.monthWarnings.length === 0) {
                html += `<p class="good">Tháng ${monthX} KHÔNG CÓ CẢNH BÁO LỚN.</p>`;
            } else {
                html += `<ul>`;
                for (const w of result.monthWarnings) {
                    html += `<li class="bad">${w}</li>`;
                }
                html += `</ul>`;
            }

            html += `<hr>`;
            html += `<h3>2. Phong Thủy Hướng Nhà</h3>`;
            if (result.huongNhaResult.isGood) {
                html += `<p class="good">Hướng ${huongNha} là hướng TỐT cho cung mệnh ${result.cung.cung}.</p>`;
            } else if (result.huongNhaResult.isBad) {
                html += `<p class="bad">Hướng ${huongNha} là hướng XẤU cho cung mệnh ${result.cung.cung}.</p>`;
            } else {
                html += `<p>Hướng ${huongNha} là hướng TRUNG BÌNH cho cung mệnh ${result.cung.cung}.</p>`;
            }

            html += `<hr>`;
            html += `<h3>3. Phong Thủy Bất Động Sản</h3>`;
            if (result.batDongSanProblems.length === 0) {
                html += `<p class="good">KHÔNG PHÁT HIỆN YẾU TỐ XẤU CỦA BẤT ĐỘNG SẢN.</p>`;
            } else {
                html += `<h4>Các vấn đề:</h4>`;
                html += `<ul>`;
                for (const p of result.batDongSanProblems) {
                    html += `<li class="bad">${p}</li>`;
                }
                html += `</ul>`;

                html += `<h4>Cách hóa giải:</h4>`;
                html += `<ul>`;
                for (const s of result.batDongSanSolutions) {
                    html += `<li class="solution">${s}</li>`;
                }
                html += `</ul>`;
            }

            document.getElementById('result-content').innerHTML = html;
        } catch (err) {
            console.error(err);
            alert('Lỗi: ' + (err.message || err));
        }
    });
});