const DATA_URL = "신청목록.json";
const LIMIT_PER_PERSON = 10;

const elements = {
  approvedCount: document.querySelector("#approvedCount"),
  rejectedCount: document.querySelector("#rejectedCount"),
  approvedTotal: document.querySelector("#approvedTotal"),
  resultBody: document.querySelector("#resultBody"),
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatNumber(value) {
  return numberFormatter.format(value);
}

function reviewApplications(applications) {
  return applications.map((application) => {
    const limit = application.인구수 * LIMIT_PER_PERSON;
    const isApproved = application.신청액 <= limit;

    return {
      ...application,
      한도액: limit,
      판정: isApproved ? "승인" : "반려",
    };
  });
}

function renderSummary(results) {
  const approved = results.filter((item) => item.판정 === "승인");
  const rejected = results.length - approved.length;
  const approvedTotal = approved.reduce((sum, item) => sum + item.신청액, 0);

  elements.approvedCount.textContent = formatNumber(approved.length);
  elements.rejectedCount.textContent = formatNumber(rejected);
  elements.approvedTotal.textContent = formatNumber(approvedTotal);
}

function createCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function renderTable(results) {
  const fragment = document.createDocumentFragment();

  results.forEach((item) => {
    const row = document.createElement("tr");
    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    const approved = item.판정 === "승인";

    row.append(
      createCell(item.지자체명, "municipality"),
      createCell(`${formatNumber(item.인구수)}명`, "number-cell"),
      createCell(`${formatNumber(item.신청액)}원`, "number-cell"),
      createCell(`${formatNumber(item.한도액)}원`, "number-cell limit-amount"),
    );

    statusCell.className = "status-cell";
    statusBadge.className = `status-badge ${approved ? "status-approved" : "status-rejected"}`;
    statusBadge.textContent = item.판정;
    statusCell.append(statusBadge);
    row.append(statusCell);
    fragment.append(row);
  });

  elements.resultBody.replaceChildren(fragment);
}

function renderError() {
  const row = document.createElement("tr");
  row.className = "error-row";
  const cell = document.createElement("td");
  cell.colSpan = 5;
  cell.textContent = "신청목록을 불러오지 못했습니다. JSON 파일 위치를 확인해 주세요.";
  row.append(cell);
  elements.resultBody.replaceChildren(row);
}

async function loadApplications() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const applications = await response.json();
    if (!Array.isArray(applications)) throw new Error("신청목록 형식이 올바르지 않습니다.");

    const results = reviewApplications(applications);
    renderSummary(results);
    renderTable(results);
  } catch (error) {
    console.error("신청목록 로딩 실패:", error);
    renderError();
  }
}

loadApplications();
