import type { Question } from "../../types";
import { DIEM_LIET_IDS } from "../../types";

// Bộ câu hỏi mẫu đại diện cho cấu trúc 600 câu BCA (hiệu lực 01/06/2025)
// Full 600-câu JSON sẽ được load từ file riêng khi có bản quyền nội dung
// Cấu trúc: ID 1-180 (Chương I), 181-205 (II), 206-263 (III), 264-300 (IV), 301-485 (V), 486-600 (VI)

export const SAMPLE_QUESTIONS: Question[] = [
  // ===== CHƯƠNG I: Quy tắc giao thông (câu 1-180) =====
  {
    id: 1,
    chapter: 1,
    content: "Người điều khiển xe cơ giới phải đi bên nào của đường?",
    options: ["Đi bên trái", "Đi bên phải theo chiều đi của mình", "Đi giữa đường", "Tùy ý chọn làn"],
    answer: 1,
    explanation: "Theo Luật Trật tự ATGT đường bộ 2024, người điều khiển xe cơ giới phải đi bên phải theo chiều đi của mình, trong phần đường dành cho xe cơ giới.",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 19,
    chapter: 1,
    content: "Hành vi nào sau đây bị nghiêm cấm khi tham gia giao thông đường bộ?",
    options: [
      "Đi đúng phần đường, làn đường",
      "Điều khiển xe khi trong máu hoặc hơi thở có nồng độ cồn",
      "Nhường đường cho xe ưu tiên",
      "Dừng xe đúng nơi quy định",
    ],
    answer: 1,
    explanation: "Điều khiển xe khi có nồng độ cồn trong máu hoặc hơi thở là hành vi bị nghiêm cấm tuyệt đối. Đây là câu ĐIỂM LIỆT — trả lời sai là trượt toàn bài.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 20,
    chapter: 1,
    content: "Người điều khiển xe ô tô có nồng độ cồn trong máu vượt quá bao nhiêu mg/100ml máu bị cấm lái xe?",
    options: ["50 mg/100ml", "80 mg/100ml", "0 mg/100ml (không được có)", "100 mg/100ml"],
    answer: 2,
    explanation: "Theo Luật TTATGT 2024, người điều khiển ô tô tuyệt đối không được có nồng độ cồn trong máu (0 mg/100ml). Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 21,
    chapter: 1,
    content: "Hành vi nào sau đây bị coi là vi phạm nghiêm trọng có thể dẫn đến trượt thi lý thuyết ngay lập tức?",
    options: [
      "Vượt đèn xanh",
      "Vượt đèn đỏ",
      "Dừng trước vạch dừng",
      "Bật đèn xi nhan khi chuyển làn",
    ],
    answer: 1,
    explanation: "Vượt đèn đỏ là hành vi vi phạm nghiêm trọng, thuộc nhóm câu ĐIỂM LIỆT trong bộ đề BCA 2025.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 47,
    chapter: 1,
    content: "Khi gặp xe cảnh sát, xe cứu thương, xe cứu hỏa đang hú còi ưu tiên, người lái xe phải làm gì?",
    options: [
      "Tiếp tục đi bình thường",
      "Tăng tốc để tránh xa",
      "Nhường đường, kể cả phải dừng lại hoặc đi vào lề",
      "Bấm còi để báo hiệu",
    ],
    answer: 2,
    explanation: "Phải nhường đường cho xe ưu tiên kể cả khi đang có đèn xanh. Không nhường là vi phạm nghiêm trọng — câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 63,
    chapter: 1,
    content: "Người điều khiển xe mô tô, xe gắn máy được phép chạy quá tốc độ tối đa trong trường hợp nào?",
    options: [
      "Khi đường vắng không có người đi bộ",
      "Khi khẩn cấp cần đến bệnh viện",
      "Không được phép trong bất kỳ trường hợp nào",
      "Khi vượt xe khác trên đường cao tốc",
    ],
    answer: 2,
    explanation: "Không được vượt tốc độ tối đa trong bất kỳ trường hợp nào. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 85,
    chapter: 1,
    content: "Người lái xe sử dụng điện thoại di động khi đang lái xe (trừ thiết bị hỗ trợ tay không) là hành vi:",
    options: [
      "Được phép nếu dừng đèn đỏ",
      "Bị nghiêm cấm",
      "Được phép trong đô thị",
      "Được phép nếu tốc độ thấp",
    ],
    answer: 1,
    explanation: "Sử dụng điện thoại cầm tay khi đang lái xe bị nghiêm cấm theo Luật TTATGT 2024. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 97,
    chapter: 1,
    content: "Tốc độ tối đa của xe ô tô con khi đi trên đường cao tốc là bao nhiêu km/h?",
    options: ["100 km/h", "110 km/h", "120 km/h", "130 km/h"],
    answer: 2,
    explanation: "Xe ô tô con trên đường cao tốc tối đa 120 km/h theo quy định hiện hành. Câu ĐIỂM LIỆT nếu liên quan đến vi phạm tốc độ.",
    isDiemLiet: true,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 5,
    chapter: 1,
    content: "Khi gặp đường giao nhau không có biển báo và đèn tín hiệu, xe nào được ưu tiên đi trước?",
    options: [
      "Xe đi từ trái sang phải",
      "Xe đi từ phải sang trái",
      "Xe đi thẳng",
      "Xe từ đường nhỏ ra đường lớn",
    ],
    answer: 1,
    explanation: "Tại ngã tư không có tín hiệu, xe bên phải được ưu tiên (nhường đường cho xe từ bên phải đến).",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 10,
    chapter: 1,
    content: "Khoảng cách an toàn tối thiểu giữa hai xe khi đi trên đường với tốc độ 60 km/h là bao nhiêu mét?",
    options: ["20 m", "35 m", "50 m", "60 m"],
    answer: 1,
    explanation: "Theo quy định, khi đi 60 km/h khoảng cách an toàn tối thiểu là 35 m (= tốc độ/2 + 5).",
    isDiemLiet: false,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },

  // ===== CHƯƠNG II: Văn hóa giao thông & Đạo đức (câu 181-205) =====
  {
    id: 181,
    chapter: 2,
    content: "Hành vi nào thể hiện văn hóa giao thông tốt?",
    options: [
      "Bấm còi liên tục khi bị tắc đường",
      "Nhường đường cho người đi bộ qua đường",
      "Vượt đèn đỏ khi vội",
      "Đỗ xe trên vạch sang đường",
    ],
    answer: 1,
    explanation: "Nhường đường cho người đi bộ là hành vi văn hóa giao thông cơ bản.",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 197,
    chapter: 2,
    content: "Khi phát hiện người bị tai nạn giao thông, người lái xe có trách nhiệm gì?",
    options: [
      "Tiếp tục đi để tránh ùn tắc",
      "Dừng xe, sơ cứu nạn nhân và báo cơ quan chức năng",
      "Quay phim rồi đăng mạng xã hội",
      "Chờ người khác đến xử lý",
    ],
    answer: 1,
    explanation: "Người lái xe có trách nhiệm pháp lý phải dừng lại, sơ cứu và báo cáo. Bỏ qua nạn nhân là vi phạm pháp luật. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 198,
    chapter: 2,
    content: "Theo quy định mới, bình chữa cháy trên xe ô tô là:",
    options: [
      "Trang bị tùy chọn, không bắt buộc",
      "Bắt buộc phải có và còn hạn sử dụng",
      "Chỉ bắt buộc với xe tải",
      "Chỉ bắt buộc với xe từ 7 chỗ trở lên",
    ],
    answer: 1,
    explanation: "Bình chữa cháy là thiết bị bắt buộc trên xe ô tô và phải còn hạn sử dụng. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },

  // ===== CHƯƠNG III: Kỹ thuật lái xe (câu 206-263) =====
  {
    id: 206,
    chapter: 3,
    content: "Khi phanh khẩn cấp trên đường ướt, người lái xe nên:",
    options: [
      "Đạp phanh thật mạnh một lần",
      "Đánh lái sang bên",
      "Đạp phanh từ từ, tránh khóa bánh",
      "Tăng ga để giữ thăng bằng",
    ],
    answer: 2,
    explanation: "Trên đường ướt, khóa bánh xe gây mất lái. Cần phanh nhẹ, nhấp nhả để duy trì kiểm soát. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 220,
    chapter: 3,
    content: "Khi lái xe xuống dốc dài, cách xử lý đúng là:",
    options: [
      "Về số N để tiết kiệm xăng",
      "Giữ số thấp, sử dụng phanh động cơ kết hợp phanh chân",
      "Đạp phanh liên tục từ trên xuống",
      "Tắt máy để tiết kiệm nhiên liệu",
    ],
    answer: 1,
    explanation: "Xuống dốc dài phải dùng phanh động cơ (số thấp) kết hợp phanh chân từng đợt, tránh cháy phanh.",
    isDiemLiet: false,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },

  // ===== CHƯƠNG IV: Cấu tạo xe (câu 264-300) =====
  {
    id: 264,
    chapter: 4,
    content: "Đèn báo nhiệt độ nước làm mát sáng đỏ khi đang lái xe, người lái phải làm gì?",
    options: [
      "Tiếp tục đi bình thường",
      "Tăng tốc để làm mát máy",
      "Dừng xe ngay, tắt máy và kiểm tra",
      "Đổ thêm xăng",
    ],
    answer: 2,
    explanation: "Đèn nhiệt độ đỏ cảnh báo động cơ đang quá nóng. Phải dừng ngay để tránh hỏng máy.",
    isDiemLiet: false,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 280,
    chapter: 4,
    content: "Hệ thống ABS (Anti-lock Braking System) có tác dụng gì?",
    options: [
      "Tăng tốc độ phanh",
      "Ngăn bánh xe bị khóa cứng khi phanh gấp, giúp giữ lái",
      "Giảm tiêu hao nhiên liệu",
      "Tăng lực kéo lên dốc",
    ],
    answer: 1,
    explanation: "ABS ngăn bánh bị khóa khi phanh gấp, cho phép tài xế vẫn điều khiển hướng được trong khi phanh.",
    isDiemLiet: false,
    licenseClasses: ["B", "C1", "C", "D1", "D2", "D"],
  },

  // ===== CHƯƠNG V: Biển báo đường bộ (câu 301-485) =====
  {
    id: 301,
    chapter: 5,
    content: "Biển báo hình tròn viền đỏ, nền trắng có ý nghĩa gì?",
    options: [
      "Biển báo nguy hiểm",
      "Biển cấm — cấm thực hiện hành vi được mô tả",
      "Biển hiệu lệnh bắt buộc",
      "Biển chỉ dẫn thông tin",
    ],
    answer: 1,
    explanation: "Biển tròn viền đỏ nền trắng là biển CẤM. Ví dụ: biển cấm quay đầu, cấm vượt...",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 320,
    chapter: 5,
    content: "Biển báo hình tam giác viền đỏ cảnh báo điều gì?",
    options: [
      "Cấm xe tải",
      "Nguy hiểm hoặc cảnh báo — cần chú ý phía trước",
      "Đường ưu tiên",
      "Bắt buộc đi thẳng",
    ],
    answer: 1,
    explanation: "Biển tam giác viền đỏ là biển NGUY HIỂM, cảnh báo người lái về tình huống nguy hiểm phía trước.",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 350,
    chapter: 5,
    content: "Biển báo hình tròn nền xanh lam có ý nghĩa gì?",
    options: [
      "Biển cấm",
      "Biển nguy hiểm",
      "Biển hiệu lệnh — bắt buộc thực hiện",
      "Biển chỉ dẫn",
    ],
    answer: 2,
    explanation: "Biển tròn nền xanh lam là biển HIỆU LỆNH — bắt buộc phải tuân theo. Ví dụ: phải đi thẳng, phải rẽ phải...",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 400,
    chapter: 5,
    content: "Biển P (đỗ xe) hình vuông nền xanh lam có nghĩa là:",
    options: [
      "Cấm đỗ xe",
      "Được phép đỗ xe tại khu vực này",
      "Đỗ xe có thu phí",
      "Đỗ xe 30 phút",
    ],
    answer: 1,
    explanation: "Biển P nền xanh chỉ dẫn nơi được phép đỗ xe.",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },

  // ===== CHƯƠNG VI: Tình huống & Sa hình (câu 486-600) =====
  {
    id: 486,
    chapter: 6,
    content: "Xe A đang đi thẳng, xe B từ đường nhánh đâm ra bên phải xe A. Ai phải nhường đường?",
    options: [
      "Xe A nhường xe B vì xe B ở bên phải",
      "Xe B nhường xe A vì xe A đang đi trên đường chính",
      "Xe nào đến trước đi trước",
      "Xe nhỏ hơn nhường xe lớn hơn",
    ],
    answer: 1,
    explanation: "Xe đi từ đường nhánh ra phải nhường xe đang đi trên đường chính (có quyền ưu tiên cao hơn).",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 245,
    chapter: 3,
    content: "Khi lái xe trên đường, phát hiện lốp xe bị xẹp đột ngột, cần xử lý thế nào?",
    options: [
      "Đạp phanh mạnh ngay lập tức",
      "Giữ vô lăng thẳng, thả ga từ từ, phanh nhẹ và dừng xe vào lề",
      "Đánh lái mạnh sang một bên",
      "Tăng ga để giữ thăng bằng",
    ],
    answer: 1,
    explanation: "Khi nổ lốp: giữ vô lăng thẳng, không phanh gấp (xe mất lái), thả ga từ từ rồi phanh nhẹ vào lề. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["B", "B1", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 246,
    chapter: 3,
    content: "Khi xe bị mất phanh khi đang xuống dốc, cách xử lý đúng nhất là:",
    options: [
      "Tắt máy xe",
      "Đánh lái sang bên đường để chạy song song rồi dùng phanh tay, tìm chỗ chặn xe",
      "Nhảy ra khỏi xe ngay",
      "Bấm còi liên tục và tiếp tục chạy",
    ],
    answer: 1,
    explanation: "Mất phanh: dùng phanh tay từng đợt, về số thấp, tìm lề đường, chướng ngại vật mềm để giảm tốc. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 500,
    chapter: 6,
    content: "Tại ngã tư có đèn tín hiệu, đèn xanh bật, nhưng phía trước có xe cứu thương đang hú còi. Bạn phải:",
    options: [
      "Đi thẳng vì đèn đang xanh",
      "Dừng lại hoặc tránh sang bên để nhường xe cứu thương",
      "Bấm còi để xe cứu thương tránh bạn",
      "Vượt nhanh để thoát khỏi ngã tư",
    ],
    answer: 1,
    explanation: "Xe ưu tiên (cứu thương) được ưu tiên tuyệt đối, kể cả khi đèn xanh. Phải nhường đường.",
    isDiemLiet: false,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
  {
    id: 550,
    chapter: 6,
    content: "Khi gặp đường sắt có đèn đỏ nhấp nháy, người lái xe phải:",
    options: [
      "Đi nhanh qua trước khi tàu đến",
      "Dừng hẳn trước vạch dừng, chờ đèn tắt và đường thông thoáng",
      "Nhìn trái phải rồi đi qua",
      "Đi chậm qua đường sắt",
    ],
    answer: 1,
    explanation: "Đèn đỏ nhấp nháy tại đường sắt: PHẢI dừng lại hoàn toàn trước vạch. Câu ĐIỂM LIỆT.",
    isDiemLiet: true,
    licenseClasses: ["A1", "A", "B1", "B", "C1", "C", "D1", "D2", "D"],
  },
];

// Helper: get questions for a license class
export function getQuestionsForClass(questions: Question[], licenseClass: string): Question[] {
  return questions.filter((q) => q.licenseClasses.includes(licenseClass as any));
}

// Verify điểm liệt flagging matches official list
export function validateDiemLiet(questions: Question[]): { correct: number; wrong: number[] } {
  const wrong: number[] = [];
  for (const q of questions) {
    const shouldBeDiemLiet = DIEM_LIET_IDS.has(q.id);
    if (shouldBeDiemLiet !== q.isDiemLiet) wrong.push(q.id);
  }
  return { correct: questions.length - wrong.length, wrong };
}
