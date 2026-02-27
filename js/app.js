"use strict";
// =============================================
// وەستا کارمەند – Invoice System (TypeScript)
// =============================================
// ---- Predefined item catalogue with default points & operator ----
const CATALOGUE_DATA = [
    { name: "سهوت لایت",          points: 2,   operator: "×", directPrice: 0     },
    { name: "سهوت مستطیل",       points: 4,   operator: "×", directPrice: 0     },
    { name: "مەتری",              points: 2,   operator: "×", directPrice: 0     },
    { name: "براکیت",             points: 2,   operator: "×", directPrice: 0     },
    { name: "ئینهر",              points: 2,   operator: "×", directPrice: 0     },
    { name: "ماگینت",             points: 2,   operator: "×", directPrice: 0     },
    { name: "اناره مخفی",         points: 2,   operator: "÷", directPrice: 0     },
    { name: "پاوەرپلا",           points: 1,   operator: "×", directPrice: 0     },
    { name: "سویج بلاك",          points: 1.5, operator: "×", directPrice: 0     },
    { name: "سویج A45",           points: 2,   operator: "×", directPrice: 0     },
    { name: "سویج تریقین",        points: 2,   operator: "×", directPrice: 0     },
    { name: "قانوس واجهه",        points: 2,   operator: "×", directPrice: 0     },
    { name: "اناره مخفی واجهه",   points: 1,   operator: "×", directPrice: 0     },
    { name: "جرس",                points: 2,   operator: "×", directPrice: 0     },
    { name: "وایەر پە نجەرە",     points: 1,   operator: "×", directPrice: 0     },
    { name: "وایەر بەتال",        points: 1,   operator: "×", directPrice: 0     },
    { name: "گیزەر",              points: 1,   operator: "×", directPrice: 0     },
    { name: "ساحیبه",             points: 2,   operator: "×", directPrice: 0     },
    { name: "ثرموستات",           points: 5,   operator: "×", directPrice: 0     },
    { name: "جوزه",               points: 2,   operator: "×", directPrice: 0     },
    { name: "مین 3P",             points: 6,   operator: "×", directPrice: 0     },
    { name: "کیبل (١٠×٤)",       points: 1,   operator: "×", directPrice: 0     },
    { name: "کیبل (٤×٣)",        points: 2,   operator: "÷", directPrice: 0     },
    { name: "فهاخ ساحیبه",        points: 1,   operator: "×", directPrice: 0     },
    { name: "لید پایەی قادرمه",   points: 2,   operator: "×", directPrice: 0      },
    { name: "حساب پیانو",         points: 0,   operator: "×", directPrice: 25000  },
    // ---- بابەتی کامیرا و ئالوگۆڕ ----
    { name: "بوستەر",             points: 0,   operator: "×", directPrice: 15000  },
    { name: "کامیرا",             points: 0,   operator: "×", directPrice: 15000  },
    { name: "HD",                 points: 0,   operator: "×", directPrice: 15000  },
    { name: "موبەریدە",           points: 0,   operator: "×", directPrice: 25000  },
    { name: "TV",                 points: 0,   operator: "×", directPrice: 25000  },
    { name: "ئنترنیت",            points: 0,   operator: "×", directPrice: 25000  },
    { name: "هایقون دمرگا",       points: 0,   operator: "×", directPrice: 25000  },
    { name: "ثریا گەورە",         points: 0,   operator: "×", directPrice: 150000 },
    { name: "ثریا وسط",           points: 0,   operator: "×", directPrice: 65000  },
    { name: "ثریا بچووک",         points: 0,   operator: "×", directPrice: 35000  },
    { name: "ثریا LED",           points: 0,   operator: "×", directPrice: 25000  },
    { name: "قانوس واجهه تعلیق",  points: 0,   operator: "×", directPrice: 25000  },
    { name: "سماعه",              points: 3,   operator: "×", directPrice: 0      },
    { name: "ناو سعات",           points: 0,   operator: "×", directPrice: 0      },
    { name: "ئەلرزی",             points: 0,   operator: "×", directPrice: 30000  },
    { name: "کیبل ترای",          points: 1,   operator: "×", directPrice: 0      },
    { name: "حەساس کنتور",        points: 2,   operator: "×", directPrice: 0      },
    { name: "سەر مقسل",           points: 1,   operator: "×", directPrice: 0      },
];
const CATALOGUE_MAP = {};
CATALOGUE_DATA.forEach(c => { CATALOGUE_MAP[c.name] = c; });
// ---- State ----
let items = [];
let nextItemId = 1;
let editingInvoiceId = null;
let previewOpen = false;
let activeCatalogue = [];  // live catalogue (from localStorage or defaults)
// ---- Rebuild CATALOGUE_MAP from activeCatalogue ----
function rebuildCatalogueMap() {
    Object.keys(CATALOGUE_MAP).forEach(k => delete CATALOGUE_MAP[k]);
    activeCatalogue.forEach(c => { CATALOGUE_MAP[c.name] = c; });
}
// ---- Load catalogue (localStorage or defaults) ----
function loadCatalogue() {
    const saved = localStorage.getItem("wk_catalogue");
    activeCatalogue = saved ? JSON.parse(saved) : CATALOGUE_DATA.map(c => Object.assign({}, c));
    rebuildCatalogueMap();
    repopulateDropdown();
}
// ---- Repopulate dropdown from activeCatalogue ----
function repopulateDropdown() {
    const sel = document.getElementById("itemSelect");
    sel.innerHTML = '<option value="">-- هەڵبژاردن --</option>';
    activeCatalogue.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.name;
        opt.textContent = item.name;
        sel.appendChild(opt);
    });
}
// ---- Helpers ----
function formatNum(n) {
    return n.toLocaleString("en-US");
}
function generateId() {
    return "INV-" + Date.now();
}
function showAlert(msg, type = "success") {
    const area = document.getElementById("alertArea");
    const div = document.createElement("div");
    div.className = `alert alert-${type} alert-dismissible fade show`;
    div.innerHTML = `${msg} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    area.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}
// ---- Populate catalogue dropdown ----
// (kept as alias — actual work done by repopulateDropdown)
function populateCatalogue() { repopulateDropdown(); }
// ---- Catalogue management modal ----
function renderCatalogueTable() {
    const tbody = document.getElementById("catalogueTableBody");
    tbody.innerHTML = "";
    activeCatalogue.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${idx + 1}</td>
        <td class="text-start fw-semibold">${item.name}</td>
        <td>${item.points > 0 ? item.operator + item.points : "–"}</td>
        <td>${item.directPrice > 0 ? formatNum(item.directPrice) + " د" : "–"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editCatItem(${idx})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteCatItem(${idx})">
            <i class="bi bi-trash"></i>
          </button>
        </td>`;
        tbody.appendChild(tr);
    });
}
window.editCatItem = (idx) => {
    const item = activeCatalogue[idx];
    document.getElementById("catName").value = item.name;
    document.getElementById("catPoints").value = String(item.points);
    document.getElementById("catDirectPrice").value = String(item.directPrice);
    const btn = document.getElementById("catOperatorBtn");
    btn.textContent = item.operator;
    btn.className = item.operator === "÷"
        ? "btn btn-info fw-bold px-2"
        : "btn btn-warning fw-bold px-2";
    document.getElementById("catEditIndex").value = String(idx);
    document.getElementById("catSaveBtnText").textContent = "نوێکردنەوە";
    document.getElementById("catFormTitle").innerHTML = '<i class="bi bi-pencil-square text-warning"></i> دەستکارکردنی بابەت';
    document.getElementById("btnCancelCatEdit").classList.remove("d-none");
    document.getElementById("catName").focus();
};
window.deleteCatItem = (idx) => {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم بابەتەیە؟")) return;
    activeCatalogue.splice(idx, 1);
    localStorage.setItem("wk_catalogue", JSON.stringify(activeCatalogue));
    rebuildCatalogueMap();
    repopulateDropdown();
    renderCatalogueTable();
    showAlert("بابەت سڕیایەوە", "danger");
};
function saveCatItem() {
    const name = document.getElementById("catName").value.trim();
    if (!name) { showAlert("ناوی بابەت خاڵە!", "warning"); return; }
    const points = parseFloat(document.getElementById("catPoints").value) || 0;
    const directPrice = parseFloat(document.getElementById("catDirectPrice").value) || 0;
    const operator = document.getElementById("catOperatorBtn").textContent.trim();
    const idx = parseInt(document.getElementById("catEditIndex").value);
    const entry = { name, points, operator, directPrice };
    if (idx >= 0) {
        activeCatalogue[idx] = entry;
    } else {
        // check duplicate
        if (activeCatalogue.find(c => c.name === name)) {
            showAlert("بابەتەکە پێشتر هەیە!", "warning"); return;
        }
        activeCatalogue.push(entry);
    }
    localStorage.setItem("wk_catalogue", JSON.stringify(activeCatalogue));
    rebuildCatalogueMap();
    repopulateDropdown();
    renderCatalogueTable();
    cancelCatEdit();
    showAlert(idx >= 0 ? "بابەت نوێکرایەوە" : "بابەتی نوێ زیادکرا", "success");
}
function cancelCatEdit() {
    document.getElementById("catName").value = "";
    document.getElementById("catPoints").value = "0";
    document.getElementById("catDirectPrice").value = "0";
    document.getElementById("catEditIndex").value = "-1";
    document.getElementById("catSaveBtnText").textContent = "زیادکە";
    document.getElementById("catFormTitle").innerHTML = '<i class="bi bi-plus-square text-success"></i> زیادکردنی بابەتی نوێ';
    document.getElementById("btnCancelCatEdit").classList.add("d-none");
    const btn = document.getElementById("catOperatorBtn");
    btn.textContent = "×";
    btn.className = "btn btn-warning fw-bold px-2";
}
// ---- Auto-fill points & operator when item selected ----
function onItemSelect() {
    const name = document.getElementById("itemSelect").value;
    if (!name || !CATALOGUE_MAP[name]) return;
    const def = CATALOGUE_MAP[name];
    document.getElementById("itemPoints").value = String(def.points);
    document.getElementById("itemDirectPrice").value = def.directPrice > 0 ? String(def.directPrice) : "0";
    const btn = document.getElementById("btnOperator");
    btn.textContent = def.operator;
    if (def.operator === "÷") {
        btn.classList.remove("btn-warning");
        btn.classList.add("btn-info");
    } else {
        btn.classList.remove("btn-info");
        btn.classList.add("btn-warning");
    }
    updateDirectPrice();
}
// ---- Auto-calc direct price (total dinar) ----
function getOperator() {
    return document.getElementById("btnOperator").textContent.trim();
}
function calcTotalPoints(qty, pointsPerUnit, operator) {
    if (operator === "÷") return pointsPerUnit > 0 ? qty / pointsPerUnit : 0;
    return qty * pointsPerUnit;
}
function updateDirectPrice() {
    const qty = parseFloat(document.getElementById("itemQty").value) || 0;
    const points = parseFloat(document.getElementById("itemPoints").value) || 0;
    const rate = parseFloat(document.getElementById("pointRate").value) || 0;
    const op = getOperator();
    const totalPts = calcTotalPoints(qty, points, op);
    const total = totalPts * rate;
    document.getElementById("itemDirectPrice").value = total > 0 ? String(total) : "0";
}
// ---- Calculate item total ----
function calcItemTotal(item, pointRate) {
    const totalPoints = calcTotalPoints(item.qty, item.pointsPerUnit, item.operator || "×");
    if (item.directPrice > 0)
        return item.directPrice;
    return totalPoints * pointRate;
}
// ---- Render table ----
function renderTable() {
    const tbody = document.getElementById("itemsBody");
    const rate = parseFloat(document.getElementById("pointRate").value) || 0;
    tbody.innerHTML = "";
    let grand = 0;
    let grandPts = 0;
    items.forEach((item) => {
        const op = item.operator || "×";
        const tPts = calcTotalPoints(item.qty, item.pointsPerUnit, op);
        const total = calcItemTotal(item, rate);
        grand += total;
        if (item.pointsPerUnit > 0) grandPts += tPts;
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td class="text-start">${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.pointsPerUnit > 0 ? op + item.pointsPerUnit : "–"}</td>
      <td>${item.pointsPerUnit > 0 ? formatNum(tPts) : "–"}</td>
      <td class="text-warning-emphasis fw-semibold">${item.directPrice > 0 ? formatNum(item.directPrice) : "–"}</td>
      <td>${formatNum(total)}</td>
      <td class="no-print">
        <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${item.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
        tbody.appendChild(tr);
    });
    document.getElementById("grandTotalCell").textContent = formatNum(grand);
    document.getElementById("grandTotalPtsCell").textContent = grandPts > 0 ? formatNum(grandPts) : "–";
    updateRemaining(grand);
    if (previewOpen)
        renderPrintPreview();
}
function updateRemaining(grand) {
    if (grand === undefined) {
        const rate = parseFloat(document.getElementById("pointRate").value) || 0;
        grand = items.reduce((s, it) => s + calcItemTotal(it, rate), 0);
    }
    const paid = parseFloat(document.getElementById("paidAmount").value) || 0;
    const remaining = grand - paid;
    const el = document.getElementById("remainingAmount");
    el.value = remaining;
    el.className = remaining > 0
        ? "form-control fw-bold text-danger"
        : "form-control fw-bold text-success";
    if (previewOpen) renderPrintPreview();
}
// ---- Add item ----
function addItem() {
    const useCustom = !document.getElementById("customItemName").classList.contains("d-none");
    const nameSel = document.getElementById("itemSelect").value;
    const nameCustom = document.getElementById("customItemName").value.trim();
    const name = useCustom ? nameCustom : nameSel;
    if (!name) {
        showAlert("ناوی مادە هەڵبژێرە یان بنووسە!", "warning");
        return;
    }
    const qty = parseFloat(document.getElementById("itemQty").value) || 1;
    const points = parseFloat(document.getElementById("itemPoints").value) || 0;
    const direct = parseFloat(document.getElementById("itemDirectPrice").value) || 0;
    const operator = getOperator();
    items.push({ id: nextItemId++, name, qty, pointsPerUnit: points, directPrice: direct, operator });
    // reset
    document.getElementById("itemSelect").value = "";
    document.getElementById("itemQty").value = "1";
    document.getElementById("itemPoints").value = "0";
    document.getElementById("itemDirectPrice").value = "0";
    document.getElementById("customItemName").value = "";
    document.getElementById("btnOperator").textContent = "×";
    document.getElementById("btnOperator").classList.remove("btn-info");
    document.getElementById("btnOperator").classList.add("btn-warning");
    updateDirectPrice();
    renderTable();
}
// ---- Remove item ----
window.removeItem = (id) => {
    items = items.filter((i) => i.id !== id);
    renderTable();
};
// ---- Build invoice object ----
function buildInvoice() {
    const rate = parseFloat(document.getElementById("pointRate").value) || 0;
    const grand = items.reduce((s, it) => s + calcItemTotal(it, rate), 0);
    return {
        id: editingInvoiceId || generateId(),
        customerName: document.getElementById("customerName").value.trim(),
        customerAddress: document.getElementById("customerAddress").value.trim(),
        customerPhone: document.getElementById("customerPhone").value.trim(),
        pointRate: rate,
        date: document.getElementById("invoiceDate").value,
        note: document.getElementById("invoiceNote").value.trim(),
        items: [...items],
        grandTotal: grand,
        paidAmount: parseFloat(document.getElementById("paidAmount").value) || 0,
    };
}
// ---- Save to localStorage ----
function saveInvoice() {
    if (items.length === 0) {
        showAlert("تکایە یەک مادە زیاد بکە!", "warning");
        return;
    }
    const inv = buildInvoice();
    const list = JSON.parse(localStorage.getItem("wk_invoices") || "[]");
    const idx = list.findIndex((x) => x.id === inv.id);
    if (idx >= 0)
        list[idx] = inv;
    else
        list.push(inv);
    localStorage.setItem("wk_invoices", JSON.stringify(list));
    editingInvoiceId = inv.id;
    document.getElementById("invoiceIdLabel").textContent = inv.id;
    showAlert(`فاتورە خەزنکرا  (${inv.id})`, "success");
}
// ---- Load invoice into form ----
function loadInvoice(inv) {
    document.getElementById("customerName").value = inv.customerName;
    document.getElementById("customerAddress").value = inv.customerAddress;
    document.getElementById("customerPhone").value = inv.customerPhone;
    document.getElementById("pointRate").value = String(inv.pointRate);
    document.getElementById("invoiceDate").value = inv.date;
    document.getElementById("invoiceNote").value = inv.note;
    items = inv.items.map((it) => (Object.assign({}, it)));
    nextItemId = items.reduce((m, it) => Math.max(m, it.id), 0) + 1;
    editingInvoiceId = inv.id;
    document.getElementById("invoiceIdLabel").textContent = inv.id;
    document.getElementById("paidAmount").value = String(inv.paidAmount || 0);
    renderTable();
    document.getElementById("savedPanel").classList.add("d-none");
    showAlert(`فاتورە بارکرا: ${inv.id}`, "info");
}
// ---- Delete saved invoice ----
window.deleteSavedInvoice = (id) => {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم فاتورەیە؟"))
        return;
    let list = JSON.parse(localStorage.getItem("wk_invoices") || "[]");
    list = list.filter((x) => x.id !== id);
    localStorage.setItem("wk_invoices", JSON.stringify(list));
    renderSavedList();
    showAlert("فاتورە سڕایەوە", "danger");
};
// ---- Load from saved list ----
window.loadSavedInvoice = (id) => {
    const list = JSON.parse(localStorage.getItem("wk_invoices") || "[]");
    const inv = list.find((x) => x.id === id);
    if (inv)
        loadInvoice(inv);
};
// ---- Render saved list ----
function renderSavedList() {
    const list = JSON.parse(localStorage.getItem("wk_invoices") || "[]");
    const tbody = document.getElementById("savedListBody");
    const query = (document.getElementById("savedSearch")?.value || "").trim().toLowerCase();
    tbody.innerHTML = "";
    let filtered = list.slice().reverse();
    if (query) {
        filtered = filtered.filter(inv =>
            (inv.customerName || "").toLowerCase().includes(query)
        );
    }
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${query ? "گەڕان نەدۆزرایەوە" : "هیچ فاتورەیەک نییە"}</td></tr>`;
        return;
    }
    filtered.forEach((inv) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${inv.id}</td>
      <td>${inv.customerName || "–"}</td>
      <td>${inv.date || "–"}</td>
      <td>${formatNum(inv.grandTotal)} د</td>
      <td>
        <button class="btn btn-xs btn-outline-primary btn-sm" onclick="loadSavedInvoice('${inv.id}')">
          <i class="bi bi-pencil-square"></i> کردنەوە
        </button>
        <button class="btn btn-xs btn-outline-danger btn-sm ms-1" onclick="deleteSavedInvoice('${inv.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
        tbody.appendChild(tr);
    });
}
// ---- Render print preview ----
function renderPrintPreview() {
    const rate = parseFloat(document.getElementById("pointRate").value) || 0;
    document.getElementById("pCustomerName").textContent =
        document.getElementById("customerName").value;
    document.getElementById("pCustomerAddress").textContent =
        document.getElementById("customerAddress").value;
    document.getElementById("pCustomerPhone").textContent =
        document.getElementById("customerPhone").value;
    document.getElementById("pPointRate").textContent = formatNum(rate);
    document.getElementById("pDate").textContent =
        document.getElementById("invoiceDate").value;
    document.getElementById("pNote").textContent =
        document.getElementById("invoiceNote").value;
    const tbody = document.getElementById("pItemsBody");
    tbody.innerHTML = "";
    let grand = 0;
    let grandPts = 0;
    items.forEach((item) => {
        const op2 = item.operator || "×";
        const tPts2 = calcTotalPoints(item.qty, item.pointsPerUnit, op2);
        const total = calcItemTotal(item, rate);
        grand += total;
        if (item.pointsPerUnit > 0) grandPts += tPts2;
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td style="text-align:right">${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.pointsPerUnit > 0 ? op2 + item.pointsPerUnit : "–"}</td>
      <td>${item.pointsPerUnit > 0 ? formatNum(tPts2) : "–"}</td>
      <td>${item.directPrice > 0 ? formatNum(item.directPrice) : "–"}</td>
      <td>${formatNum(total)}</td>`;
        tbody.appendChild(tr);
    });
    document.getElementById("pGrandTotal").textContent = formatNum(grand);
    document.getElementById("pGrandTotalPts").textContent = grandPts > 0 ? formatNum(grandPts) : "–";
    const paid = parseFloat(document.getElementById("paidAmount").value) || 0;
    const remaining = grand - paid;
    const pPaidRow = document.getElementById("pPaidRow");
    const pRemRow = document.getElementById("pRemainingRow");
    if (paid > 0) {
        document.getElementById("pPaidAmount").textContent = formatNum(paid) + " د";
        document.getElementById("pRemainingAmount").textContent = formatNum(remaining) + " د";
        pPaidRow.style.display = "";
        pRemRow.style.display = "";
    } else {
        pPaidRow.style.display = "none";
        pRemRow.style.display = "none";
    }
}
// ---- Clear form ----
function clearForm() {
    if (items.length > 0 && !confirm("دڵنیایت لە سڕینەوەی فاتورەکە؟"))
        return;
    items = [];
    nextItemId = 1;
    editingInvoiceId = null;
    document.getElementById("customerName").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("pointRate").value = "1000";
    document.getElementById("invoiceDate").value = todayStr();
    document.getElementById("invoiceNote").value = "";
    document.getElementById("invoiceIdLabel").textContent = "";
    document.getElementById("paidAmount").value = "0";
    document.getElementById("remainingAmount").value = "0";
    document.getElementById("remainingAmount").className = "form-control fw-bold";
    renderTable();
    // hide preview
    const pi = document.getElementById("printInvoice");
    pi.classList.remove("preview-visible");
    previewOpen = false;
}
function todayStr() {
    return new Date().toISOString().split("T")[0];
}
// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
    loadCatalogue();
    // Set today's date
    document.getElementById("invoiceDate").value = todayStr();
    // Re-render on rate change
    document.getElementById("pointRate").addEventListener("input", () => { updateDirectPrice(); renderTable(); });
    // Operator toggle (× / ÷)
    document.getElementById("btnOperator").addEventListener("click", () => {
        const btn = document.getElementById("btnOperator");
        if (btn.textContent.trim() === "×") {
            btn.textContent = "÷";
            btn.classList.remove("btn-warning");
            btn.classList.add("btn-info");
        } else {
            btn.textContent = "×";
            btn.classList.remove("btn-info");
            btn.classList.add("btn-warning");
        }
        updateDirectPrice();
    });
    // Auto-fill on item select
    document.getElementById("itemSelect").addEventListener("change", onItemSelect);
    // Auto-calc direct price preview
    document.getElementById("itemQty").addEventListener("input", updateDirectPrice);
    document.getElementById("itemPoints").addEventListener("input", updateDirectPrice);
    // Add item
    document.getElementById("btnAddItem").addEventListener("click", addItem);
    // Custom item toggle
    document.getElementById("btnCustomItem").addEventListener("click", () => {
        const ci = document.getElementById("customItemName");
        const sel = document.getElementById("itemSelect");
        ci.classList.toggle("d-none");
        sel.classList.toggle("d-none");
        ci.focus();
    });
    // Save
    document.getElementById("btnSave").addEventListener("click", saveInvoice);
    // Clear
    document.getElementById("btnClear").addEventListener("click", clearForm);
    // Preview
    document.getElementById("btnPreview").addEventListener("click", () => {
        if (items.length === 0) {
            showAlert("تکایە مادە زیاد بکە!", "warning");
            return;
        }
        renderPrintPreview();
        const pi = document.getElementById("printInvoice");
        previewOpen = !previewOpen;
        pi.classList.toggle("preview-visible", previewOpen);
        pi.scrollIntoView({ behavior: "smooth" });
    });
    // Print
    document.getElementById("btnPrint").addEventListener("click", () => {
        if (items.length === 0) {
            showAlert("تکایە مادە زیاد بکە!", "warning");
            return;
        }
        renderPrintPreview();
        window.print();
    });
    // New invoice
    document.getElementById("btnNewInvoice").addEventListener("click", clearForm);
    // Catalogue modal
    document.getElementById("paidAmount").addEventListener("input", () => updateRemaining());
    document.getElementById("pointRate").addEventListener("input", () => updateRemaining());
    document.getElementById("btnCatalogue").addEventListener("click", () => {
        renderCatalogueTable();
        cancelCatEdit();
        new bootstrap.Modal(document.getElementById("catalogueModal")).show();
    });
    document.getElementById("btnSaveCatItem").addEventListener("click", saveCatItem);
    document.getElementById("btnCancelCatEdit").addEventListener("click", cancelCatEdit);
    document.getElementById("catOperatorBtn").addEventListener("click", () => {
        const btn = document.getElementById("catOperatorBtn");
        if (btn.textContent.trim() === "×") {
            btn.textContent = "÷"; btn.className = "btn btn-info fw-bold px-2";
        } else {
            btn.textContent = "×"; btn.className = "btn btn-warning fw-bold px-2";
        }
    });
    document.getElementById("btnResetCatalogue").addEventListener("click", () => {
        if (!confirm("دڵنیایتی بۚ گەڕاندنەوەی بە بنەڕەتی ۰۶ بابەت؟")) return;
        localStorage.removeItem("wk_catalogue");
        loadCatalogue();
        renderCatalogueTable();
        showAlert("بابەتەکان بۚ بنەڕەتیانیان گەڕیاندرانەوە", "info");
    });
    document.getElementById("catName").addEventListener("keydown", e => { if (e.key === "Enter") saveCatItem(); });
    // Export
    document.getElementById("btnExport").addEventListener("click", () => {
        const invoices = JSON.parse(localStorage.getItem("wk_invoices") || "[]");
        const catalogue = JSON.parse(localStorage.getItem("wk_catalogue") || "null");
        const data = { version: 1, exportedAt: new Date().toISOString(), invoices, catalogue };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `westa-backup-${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showAlert(`فاتورە ${invoices.length} پاشەکەوتران`, "success");
    });
    // Import
    document.getElementById("btnImport").addEventListener("click", () => {
        document.getElementById("importFileInput").value = "";
        document.getElementById("importFileInput").click();
    });
    document.getElementById("importFileInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                // support both wrapped {invoices,catalogue} and plain array
                const invoices = Array.isArray(data) ? data : (data.invoices || []);
                const catalogue = Array.isArray(data) ? null : (data.catalogue || null);
                if (!Array.isArray(invoices)) throw new Error("invalid");
                const existing = JSON.parse(localStorage.getItem("wk_invoices") || "[]");
                const existingIds = new Set(existing.map(x => x.id));
                const newOnes = invoices.filter(x => !existingIds.has(x.id));
                const merged = [...existing, ...newOnes];
                localStorage.setItem("wk_invoices", JSON.stringify(merged));
                if (catalogue) {
                    localStorage.setItem("wk_catalogue", JSON.stringify(catalogue));
                    loadCatalogue();
                }
                showAlert(`بارکرا: ${newOnes.length} فاتورەی نوێ زیادکرا ، ${invoices.length - newOnes.length} یەکسان بوون`, "info");
            } catch {
                showAlert("کەمی هەڵتای: فایلەکە دروست نییە", "danger");
            }
        };
        reader.readAsText(file);
    });
    // Saved invoices panel
    document.getElementById("btnSavedList").addEventListener("click", () => {
        renderSavedList();
        document.getElementById("savedPanel").classList.remove("d-none");
        document.getElementById("savedSearch").value = "";
        document.getElementById("savedPanel").scrollIntoView({ behavior: "smooth" });
        document.getElementById("savedSearch").focus();
    });
    document.getElementById("btnCloseSaved").addEventListener("click", () => {
        document.getElementById("savedPanel").classList.add("d-none");
    });
    document.getElementById("savedSearch").addEventListener("input", renderSavedList);
    document.getElementById("btnClearSearch").addEventListener("click", () => {
        document.getElementById("savedSearch").value = "";
        renderSavedList();
        document.getElementById("savedSearch").focus();
    });
});
//# sourceMappingURL=app.js.map