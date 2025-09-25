const STATUS_CLASS_MAP = {
  busy: "is-busy",
  available: "is-available",
  maintenance: "is-maintenance",
  unknown: "is-unknown",
};

const STATUS_LABELS = {
  busy: "Оборудование занято",
  available: "Оборудование свободно",
  maintenance: "Оборудование на обслуживании",
  unknown: "Статус уточняется",
};

const ENGAGED_STATUSES = new Set(["busy", "maintenance"]);
const STATUS_CLASS_NAMES = Object.values(STATUS_CLASS_MAP);
const messageTimers = new WeakMap();

function normalizeStatus(status) {
  if (!status) {
    return "unknown";
  }

  const value = String(status).trim().toLowerCase();

  if (["busy", "occupied", "занят", "занято", "in use"].includes(value)) {
    return "busy";
  }

  if (["available", "free", "idle", "свободно", "свободен"].includes(value)) {
    return "available";
  }

  if (
    [
      "maintenance",
      "service",
      "repair",
      "на обслуживании",
      "ремонт",
      "service mode",
    ].includes(value)
  ) {
    return "maintenance";
  }

  return "unknown";
}

function parseColumns(columnsAttr) {
  if (!columnsAttr) {
    return ["id", "status", "availableUntil"];
  }

  return columnsAttr
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractJsonFromGviz(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Неверный формат ответа Google Sheets");
  }

  const jsonString = text.slice(start, end + 1);
  return JSON.parse(jsonString);
}

async function fetchSheetData(sheetId, range, columns) {
  const params = new URLSearchParams({ tqx: "out:json" });
  if (range) {
    params.set("range", range);
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Не удалось получить данные листа: ${response.status}`);
  }

  const text = await response.text();
  const raw = extractJsonFromGviz(text);
  const rows = raw?.table?.rows ?? [];

  return rows.map((row) => {
    const cells = row?.c ?? [];
    const entry = {};

    columns.forEach((column, index) => {
      const cell = cells[index];
      if (!cell) {
        entry[column] = "";
        return;
      }

      if (cell.v !== undefined && cell.v !== null) {
        entry[column] = cell.v;
      } else if (cell.f) {
        entry[column] = cell.f;
      } else {
        entry[column] = "";
      }

      if (cell.f) {
        entry[`${column}Formatted`] = cell.f;
      }
    });

    return entry;
  });
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    const gvizMatch = trimmed.match(
      /Date\((\d{4}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})\)/,
    );

    if (gvizMatch) {
      const [, year, month, day, hour, minute, second] = gvizMatch.map(Number);
      const date = new Date(Date.UTC(year, month, day, hour, minute, second));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function getValue(entry, key) {
  if (!entry || !key) {
    return undefined;
  }

  const target = key.toLowerCase();
  const matchedKey = Object.keys(entry).find(
    (property) => property.toLowerCase() === target,
  );

  return matchedKey ? entry[matchedKey] : undefined;
}

function clearMessage(message) {
  if (!message) {
    return;
  }

  if (messageTimers.has(message)) {
    clearTimeout(messageTimers.get(message));
    messageTimers.delete(message);
  }

  message.classList.remove("is-visible");
  message.hidden = true;
}

function updateItemStatus(item, status, details = {}) {
  const normalized = normalizeStatus(status);
  item.dataset.status = normalized;

  const button = item.querySelector("[data-status-trigger]");
  if (button) {
    button.classList.remove(...STATUS_CLASS_NAMES);
    button.classList.add(STATUS_CLASS_MAP[normalized] ?? STATUS_CLASS_MAP.unknown);
    button.setAttribute("aria-expanded", "false");

    const label = button.querySelector("[data-status-label]");
    if (label) {
      label.textContent = STATUS_LABELS[normalized] ?? STATUS_LABELS.unknown;
    }
  }

  const message = item.querySelector("[data-status-message]");
  clearMessage(message);

  const { availableUntil, availableText } = details;

  if (availableUntil instanceof Date && !Number.isNaN(availableUntil.getTime())) {
    item.dataset.availableUntil = availableUntil.toISOString();
    delete item.dataset.availableText;
  } else if (typeof availableUntil === "string" && availableUntil.trim()) {
    const parsed = parseDateValue(availableUntil);
    if (parsed) {
      item.dataset.availableUntil = parsed.toISOString();
      delete item.dataset.availableText;
    } else {
      item.dataset.availableText = availableUntil.trim();
      delete item.dataset.availableUntil;
    }
  } else if (typeof availableText === "string" && availableText.trim()) {
    item.dataset.availableText = availableText.trim();
    delete item.dataset.availableUntil;
  } else {
    delete item.dataset.availableUntil;
    delete item.dataset.availableText;
  }

  return normalized;
}

function formatAvailableText(item) {
  if (!item) {
    return "";
  }

  const iso = item.dataset.availableUntil;
  if (iso) {
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  if (item.dataset.availableText) {
    return item.dataset.availableText;
  }

  return "";
}

function showStatusMessage(item) {
  const message = item.querySelector("[data-status-message]");
  if (!message) {
    return;
  }

  const status = normalizeStatus(item.dataset.status);
  const availableText = formatAvailableText(item);
  let text = "Статус оборудования уточняется.";

  if (status === "busy") {
    text = availableText
      ? `Освободится: ${availableText}`
      : "Оборудование занято. Время освобождения уточняется.";
  } else if (status === "available") {
    text = availableText
      ? `Свободно. Следующее бронирование: ${availableText}`
      : "Оборудование свободно и готово к работе.";
  } else if (status === "maintenance") {
    text = availableText
      ? `На обслуживании. Плановое завершение: ${availableText}.`
      : "Оборудование на обслуживании или ремонте.";
  }

  message.textContent = text;
  message.hidden = false;
  message.classList.add("is-visible");

  const button = item.querySelector("[data-status-trigger]");
  if (button) {
    button.setAttribute("aria-expanded", "true");
  }

  if (messageTimers.has(message)) {
    clearTimeout(messageTimers.get(message));
  }

  const timeoutId = setTimeout(() => {
    message.classList.remove("is-visible");
    message.hidden = true;
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
    messageTimers.delete(message);
  }, 6000);

  messageTimers.set(message, timeoutId);
}

function attachStatusHandlers(list) {
  list.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-status-trigger]");
    if (!trigger || !list.contains(trigger)) {
      return;
    }

    const item = trigger.closest("[data-equipment-item]");
    if (item) {
      showStatusMessage(item);
    }
  });
}

function updateSummary(list) {
  const summary = list.closest(".card-body")?.querySelector("[data-equipment-summary]");
  if (!summary) {
    return;
  }

  const items = Array.from(list.querySelectorAll("[data-equipment-item]"));
  if (!items.length) {
    summary.textContent = "Загрузка: нет данных";
    return;
  }

  let engaged = 0;
  let known = 0;

  items.forEach((item) => {
    const status = normalizeStatus(item.dataset.status);
    if (status !== "unknown") {
      known += 1;
    }
    if (ENGAGED_STATUSES.has(status)) {
      engaged += 1;
    }
  });

  if (!known) {
    summary.textContent = "Загрузка: нет данных";
    return;
  }

  const total = items.length;
  const unknownCount = total - known;
  const percent = Math.round((engaged / total) * 100);
  let summaryText = `Загрузка: ${percent}% (занято ${engaged} из ${total})`;

  if (unknownCount > 0) {
    summaryText += `, без данных: ${unknownCount}`;
  }

  summary.textContent = summaryText;
}

async function applySheetData(list) {
  const sheetId = list.dataset.sheetId;
  if (!sheetId || sheetId.includes("YOUR_")) {
    updateSummary(list);
    return;
  }

  const columns = parseColumns(list.dataset.sheetColumns);
  try {
    const rows = await fetchSheetData(sheetId, list.dataset.sheetRange, columns);
    const map = new Map();

    rows.forEach((entry) => {
      const idValue = getValue(entry, "id");
      if (!idValue) {
        return;
      }

      const key = String(idValue).trim();
      if (key) {
        map.set(key, entry);
      }
    });

    list.querySelectorAll("[data-equipment-id]").forEach((item) => {
      const id = item.dataset.equipmentId;
      if (!id) {
        return;
      }

      const entry = map.get(id);
      if (!entry) {
        return;
      }

      const statusValue = getValue(entry, "status");
      const availableValue = getValue(entry, "availableUntil");
      const availableFormatted =
        getValue(entry, "availableUntilFormatted") || getValue(entry, "availableFormatted");
      const noteValue =
        getValue(entry, "availableText") ||
        getValue(entry, "note") ||
        getValue(entry, "comment") ||
        getValue(entry, "statusNote");

      const parsedDate = parseDateValue(availableValue);
      const details = {};

      if (parsedDate) {
        details.availableUntil = parsedDate;
      } else if (availableFormatted) {
        details.availableUntil = availableFormatted;
      } else if (typeof availableValue === "string" && availableValue.trim()) {
        details.availableUntil = availableValue.trim();
      }

      if (!details.availableUntil && typeof noteValue === "string" && noteValue.trim()) {
        details.availableText = noteValue.trim();
      }

      updateItemStatus(item, statusValue, details);
    });
  } catch (error) {
    console.warn("Не удалось обновить статусы оборудования", error);
  }

  updateSummary(list);
}

export function initEquipmentStatus() {
  const lists = document.querySelectorAll("[data-equipment-list]");
  if (!lists.length) {
    return;
  }

  lists.forEach((list) => {
    const items = Array.from(list.querySelectorAll("[data-equipment-item]"));
    items.forEach((item) => {
      updateItemStatus(item, item.dataset.status);
    });

    attachStatusHandlers(list);
    applySheetData(list);
  });
}
