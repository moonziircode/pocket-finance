/**
 * SMART PERSONAL FINANCE TRACKER - AUTOMATION SCRIPT
 * Version 7.0 - Dynamic Budgeted Categories & Safe Input Validation
 */

// Master List Kategori Pengeluaran Standar
var KAT_PENGELUARAN_MASTER = [
  "Makan dan minum",
  "Belanja bahan makanan",
  "Kebutuhan rumah",
  "Air dan gas",
  "Internet",
  "Bensin",
  "Parkir dan tol",
  "Transportasi online",
  "Transportasi umum",
  "Kebutuhan pribadi",
  "Pakaian",
  "Kesehatan",
  "Perawatan diri",
  "Pulsa dan paket data",
  "Streaming",
  "Software",
  "Tagihan lainnya",
  "Nongkrong",
  "Hiburan",
  "Hobi",
  "Traveling",
  "Shopping",
  "Tabungan",
  "Dana darurat",
  "Rokok"
];

var KAT_PEMASUKAN = [
  "Gaji pokok",
  "Tunjangan",
  "Bonus dan insentif",
  "THR",
  "Freelance dan side job",
  "Hasil bisnis dan penjualan",
  "Pelunasan piutang (uang pinjaman kembali)",
  "Investasi dan dividen",
  "Bunga tabungan",
  "Hadiah dan cashback",
  "Pengembalian dana (refund)",
  "Pemasukan lainnya"
];

var KAT_TRANSFER = [
  "Titip uang ke Audy",
  "Tarik uang dari Audy",
  "Transfer antar rekening",
  "Top up e-wallet",
  "Tarik tunai",
  "Setor tunai",
  "Pembayaran kartu kredit",
  "Transfer lainnya"
];

var ALL_CATEGORIES = KAT_PENGELUARAN_MASTER.concat(KAT_PEMASUKAN).concat(KAT_TRANSFER);

var ACCOUNTS = ["Seabank", "Audy Salsabilla", "BCA", "Mandiri", "BRI", "Cash", "GoPay", "OVO", "ShopeePay"];

/**
 * Mengambil daftar kategori pengeluaran yang HANYA memiliki alokasi budget aktif (> 0)
 * dari sheet "BUDGET & KATEGORI" (baris 6 s.d. 29).
 * Kategori yang bernilai "-" / 0 / "Tanpa Budget" TIDAK akan dimasukkan.
 */
function getBudgetedCategories() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bSheet = ss.getSheetByName("BUDGET & KATEGORI");
  if (!bSheet) return ["Makan dan minum", "Bensin", "Parkir dan tol", "Pulsa dan paket data", "Nongkrong", "Tabungan", "Dana darurat"];

  var lastRow = bSheet.getLastRow();
  var endRow = lastRow;
  if (lastRow >= 6) {
    var checkA = bSheet.getRange(6, 1, lastRow - 5, 1).getValues();
    for (var r = 0; r < checkA.length; r++) {
      if (checkA[r][0] && checkA[r][0].toString().toUpperCase().indexOf("TOTAL") !== -1) {
        endRow = 6 + r - 1;
        break;
      }
    }
  }
  if (endRow < 6) return ["Makan dan minum", "Bensin", "Parkir dan tol", "Pulsa dan paket data", "Nongkrong", "Tabungan", "Dana darurat", "Rokok"];

  var numRows = endRow - 6 + 1;
  // Ambil Kolom B (Kategori), Kolom C (Budget Bulanan), dan Kolom G (Indikator Visual)
  var data = bSheet.getRange(6, 2, numRows, 6).getValues();
  var budgetedList = [];

  for (var i = 0; i < data.length; i++) {
    var kat = data[i][0];       // Col B
    var budgetVal = data[i][1]; // Col C
    var indicator = data[i][5]; // Col G

    if (!kat || kat.toString().trim() === "" || kat.toString().toUpperCase().indexOf("TOTAL") !== -1) {
      continue;
    }

    var katName = kat.toString().trim();

    var num = 0;
    if (typeof budgetVal === "number") {
      num = budgetVal;
    } else if (typeof budgetVal === "string") {
      var clean = budgetVal.replace(/[^0-9]/g, "");
      num = clean ? parseFloat(clean) : 0;
    }

    var isTanpaBudget = (indicator && indicator.toString().indexOf("Tanpa Budget") !== -1) || num <= 0;

    // Masukkan hanya jika memiliki budget > 0 dan bukan Tanpa Budget
    if (num > 0 && !isTanpaBudget) {
      budgetedList.push(katName);
    }
  }

  return budgetedList.length > 0 ? budgetedList : ["Makan dan minum", "Bensin", "Parkir dan tol", "Pulsa dan paket data", "Nongkrong", "Tabungan", "Dana darurat"];
}

/**
 * Memperbarui validasi dropdown kategori di formulir input (C8).
 * Menyesuaikan dengan jenis transaksi:
 * - Pengeluaran: HANYA kategori yang memiliki budget aktif di BUDGET & KATEGORI.
 * - Pemasukan: Daftar kategori pemasukan resmi.
 * - Transfer: Daftar kategori transfer & titipan.
 */
function updateCategoryValidation(sheet, jenis) {
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("INPUT TRANSAKSI");
  }
  if (!sheet) return;

  var list = [];
  var defaultVal = "Makan dan minum";

  if (jenis === "Pemasukan") {
    list = KAT_PEMASUKAN;
    defaultVal = "Gaji pokok";
  } else if (jenis === "Transfer") {
    list = KAT_TRANSFER;
    defaultVal = "Titip uang ke Audy";
  } else {
    // Pengeluaran: STRICTLY kategori ber-budget aktif
    list = getBudgetedCategories();
    defaultVal = list.length > 0 ? list[0] : "Makan dan minum";
  }

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(list, true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange("C8").setDataValidation(rule);
  
  var currentKat = sheet.getRange("C8").getValue();
  if (!currentKat || list.indexOf(currentKat) === -1) {
    sheet.getRange("C8").setValue(defaultVal);
  }
}

function getFirstEmptyRow(sheet, startRow, col) {
  var maxRows = sheet.getLastRow();
  if (maxRows < startRow) return startRow;
  var values = sheet.getRange(startRow, col, maxRows - startRow + 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (!values[i][0] || values[i][0] === "") {
      return startRow + i;
    }
  }
  return maxRows + 1;
}

function simpanTransaksiForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  var histSheet = ss.getSheetByName("RIWAYAT TRANSAKSI");
  if (!sheet || !histSheet) return;

  var tgl = sheet.getRange("A8").getValue();
  var jenis = sheet.getRange("B8").getValue();
  var kat = sheet.getRange("C8").getValue();
  var ket = sheet.getRange("D8").getValue();
  var akun = sheet.getRange("E8").getValue();
  var nominal = sheet.getRange("F8").getValue();

  // Reset checkbox G8 to FALSE
  sheet.getRange("G8").setValue(false);

  if (!nominal || isNaN(nominal) || nominal <= 0) {
    ss.toast("⚠️ Masukkan nominal transaksi yang valid (lebih dari 0) pada kolom Nominal (F8)!", "Peringatan", 4);
    return;
  }

  if (!tgl || !(tgl instanceof Date)) tgl = new Date();
  if (!jenis) jenis = "Pengeluaran";
  if (!kat) kat = (jenis === "Pemasukan") ? "Gaji pokok" : "Makan dan minum";
  if (!akun) akun = "Seabank";
  if (!ket || ket === "") ket = kat;

  // 1. Simpan ke database RIWAYAT TRANSAKSI
  var nextRow = getFirstEmptyRow(histSheet, 5, 1);
  var trxId = "TRX-" + ("0000" + (nextRow - 4)).slice(-4);
  
  var monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var bln = monthNames[tgl.getMonth()];
  var thn = tgl.getFullYear();

  histSheet.getRange(nextRow, 1, 1, 9).setValues([[
    trxId, tgl, jenis, kat, ket, akun, nominal, bln, thn
  ]]);
  histSheet.getRange(nextRow, 2).setNumberFormat("dd/mm/yyyy");
  histSheet.getRange(nextRow, 7).setNumberFormat("Rp #,##0");

  // 2. Tambahkan ke Recent Transactions di INPUT TRANSAKSI (baris 13)
  sheet.insertRowBefore(13);
  sheet.getRange(13, 1, 1, 6).setValues([[
    tgl, jenis, kat, ket, akun, nominal
  ]]);
  sheet.getRange(13, 1).setNumberFormat("dd/mm/yyyy");
  sheet.getRange(13, 6).setNumberFormat("Rp #,##0");
  sheet.getRange(13, 7).insertCheckboxes();
  sheet.getRange(13, 7).setValue(false);

  // Pasang validasi dropdown pada baris baru di Recent Transactions
  var ruleJenis = SpreadsheetApp.newDataValidation().requireValueInList(["Pengeluaran", "Pemasukan", "Transfer"], true).build();
  var allowedCategories = (jenis === "Pemasukan") ? KAT_PEMASUKAN : (jenis === "Transfer" ? KAT_TRANSFER : getBudgetedCategories());
  var ruleKat = SpreadsheetApp.newDataValidation().requireValueInList(allowedCategories, true).build();
  var ruleAkun = SpreadsheetApp.newDataValidation().requireValueInList(ACCOUNTS, true).build();
  sheet.getRange(13, 2).setDataValidation(ruleJenis);
  sheet.getRange(13, 3).setDataValidation(ruleKat);
  sheet.getRange(13, 5).setDataValidation(ruleAkun);

  // 3. Reset form baris 8
  sheet.getRange("D8").setValue("");
  sheet.getRange("F8").setValue("");
  sheet.getRange("A8").setValue(new Date());

  ss.toast("✅ Transaksi  + ket +  (Rp " + Number(nominal).toLocaleString("id-ID") + ") berhasil disimpan ke Riwayat!", "Sukses", 4);
}

/**
 * Template transaksi cepat (presets) disinkronkan dengan kategori yang ada budget-nya
 */
function applyTemplate(nama) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;

  var presets = {
    "kopi": { jenis: "Pengeluaran", kat: "Makan dan minum", ket: "Kopi harian", akun: "Seabank", nominal: 13000 },
    "makan": { jenis: "Pengeluaran", kat: "Makan dan minum", ket: "Makan harian", akun: "Seabank", nominal: 20000 },
    "bensin": { jenis: "Pengeluaran", kat: "Bensin", ket: "Bensin Motor/Mobil", akun: "Seabank", nominal: 20000 },
    "parkir": { jenis: "Pengeluaran", kat: "Parkir dan tol", ket: "Parkir kendaraan", akun: "Seabank", nominal: 2000 },
    "internet": { jenis: "Pengeluaran", kat: "Pulsa dan paket data", ket: "Paket Internet / Data", akun: "Seabank", nominal: 85000 },
    "nongkrong": { jenis: "Pengeluaran", kat: "Nongkrong", ket: "Nongkrong Cafe", akun: "Seabank", nominal: 50000 },
    "rokok": { jenis: "Pengeluaran", kat: "Rokok", ket: "Rokok", akun: "Seabank", nominal: 5000 }
  };

  var p = presets[nama.toLowerCase()];
  if (!p) return;

  sheet.getRange("A8").setValue(new Date());
  sheet.getRange("B8").setValue(p.jenis);
  updateCategoryValidation(sheet, p.jenis);
  sheet.getRange("C8").setValue(p.kat);
  sheet.getRange("D8").setValue(p.ket);
  sheet.getRange("E8").setValue(p.akun);
  sheet.getRange("F8").setValue(p.nominal);
  sheet.getRange("G8").setValue(false);

  ss.toast("⚡ Template  + p.ket +  (Rp " + Number(p.nominal).toLocaleString("id-ID") + ") dimuat! Klik centang Simpan (G8) untuk menyimpan.", "Template Cepat", 4);
}

function templateKopi() { applyTemplate("kopi"); }
function templateMakan() { applyTemplate("makan"); }
function templateBensin() { applyTemplate("bensin"); }
function templateParkir() { applyTemplate("parkir"); }
function templateInternet() { applyTemplate("internet"); }
function templateNongkrong() { applyTemplate("nongkrong"); }
function templateRokok() { applyTemplate("rokok"); }

function resetFormRow8() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("A8").setValue(new Date());
  sheet.getRange("B8").setValue("Pengeluaran");
  updateCategoryValidation(sheet, "Pengeluaran");
  var budgeted = getBudgetedCategories();
  sheet.getRange("C8").setValue(budgeted.length > 0 ? budgeted[0] : "Makan dan minum");
  sheet.getRange("D8").setValue("");
  sheet.getRange("E8").setValue("Seabank");
  sheet.getRange("F8").setValue("");
  sheet.getRange("G8").setValue(false);
  ss.toast("🧹 Formulir baris 8 telah di-reset!", "Reset Form", 2);
}

function onEdit(e) {
  if (!e) return;
  var range = e.range;
  var sheet = range.getSheet();
  var ss = e.source || SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = sheet.getName();
  var row = range.getRow();
  var col = range.getColumn();
  var val = e.value;

  // 1. Jika pengguna mengedit alokasi Budget Bulanan di sheet BUDGET & KATEGORI (Kolom C, baris 6 s.d. 30)
  if (sheetName === "BUDGET & KATEGORI") {
    if (col === 3 && row >= 6 && row <= 30) {
      var inputSheet = ss.getSheetByName("INPUT TRANSAKSI");
      if (inputSheet) {
        var currentJenis = inputSheet.getRange("B8").getValue() || "Pengeluaran";
        if (currentJenis === "Pengeluaran") {
          updateCategoryValidation(inputSheet, "Pengeluaran");
        }
      }
    }
    return;
  }

  if (sheetName !== "INPUT TRANSAKSI") return;

  // 2. Tombol Checkbox Pilihan Cepat di Baris 5
  if (row === 5 && (val === "TRUE" || val === true || val === "true")) {
    range.setValue(false); // reset tombol
    if (col === 1) applyTemplate("kopi");
    else if (col === 2) applyTemplate("makan");
    else if (col === 3) applyTemplate("bensin");
    else if (col === 4) applyTemplate("parkir");
    else if (col === 5) applyTemplate("internet");
    else if (col === 6) applyTemplate("nongkrong");
    else if (col === 7) applyTemplate("rokok");
    else if (col === 8) resetFormRow8();
    return;
  }

  // 3. Perubahan Jenis Transaksi di sel B8 (Pemasukan vs Pengeluaran vs Transfer)
  if (row === 8 && col === 2) {
    updateCategoryValidation(sheet, val);
    ss.toast("🔄 Kategori disesuaikan untuk " + val + "!", "Kategori Otomatis", 2);
    return;
  }

  // 4. Checkbox Simpan di G8
  if (row === 8 && col === 7 && (val === "TRUE" || val === true || val === "true")) {
    simpanTransaksiForm();
    return;
  }

  // 5. Perubahan Jenis Transaksi di Recent Transactions (kolom B, baris >= 13)
  if (col === 2 && row >= 13) {
    var jVal = val || sheet.getRange(row, 2).getValue();
    var catList = (jVal === "Pemasukan") ? KAT_PEMASUKAN : (jVal === "Transfer" ? KAT_TRANSFER : getBudgetedCategories());
    var rRule = SpreadsheetApp.newDataValidation().requireValueInList(catList, true).build();
    sheet.getRange(row, 3).setDataValidation(rRule);
    var curC = sheet.getRange(row, 3).getValue();
    if (!curC || catList.indexOf(curC) === -1) {
      sheet.getRange(row, 3).setValue(catList[0] || "Makan dan minum");
    }
    return;
  }

  // 6. Checkbox Gunakan Ulang (Repeat) di kolom G (G13+)
  if (col === 7 && row >= 13 && (val === "TRUE" || val === true || val === "true")) {
    sheet.getRange(row, 7).setValue(false);
    var rTgl = new Date();
    var rJenis = sheet.getRange(row, 2).getValue() || "Pengeluaran";
    var rKat = sheet.getRange(row, 3).getValue();
    var rKet = sheet.getRange(row, 4).getValue();
    var rAkun = sheet.getRange(row, 5).getValue() || "Seabank";
    var rNominal = sheet.getRange(row, 6).getValue();

    if (!rNominal) return;

    sheet.getRange("A8").setValue(rTgl);
    sheet.getRange("B8").setValue(rJenis);
    updateCategoryValidation(sheet, rJenis);
    sheet.getRange("C8").setValue(rKat);
    sheet.getRange("D8").setValue(rKet);
    sheet.getRange("E8").setValue(rAkun);
    sheet.getRange("F8").setValue(rNominal);
    sheet.getRange("G8").setValue(false);

    ss.toast("🔁 Transaksi  + rKet +  (" + rKat + ") dimuat ke formulir! Centang Simpan (G8) untuk menyimpan.", "Ulangi Transaksi", 3);
    return;
  }
}

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("⚡ Smart Tracker")
    .addItem("💾 Simpan Transaksi (Form Row 8)", "simpanTransaksiForm")
    .addSeparator()
    .addItem("☕ Kopi - Seabank (Rp 13.000)", "templateKopi")
    .addItem("🍱 Makan - Seabank (Rp 20.000)", "templateMakan")
    .addItem("⛽ Bensin - Seabank (Rp 20.000)", "templateBensin")
    .addItem("🅿️ Parkir - Seabank (Rp 2.000)", "templateParkir")
    .addItem("📶 Internet - Seabank (Rp 85.000)", "templateInternet")
    .addItem("☕ Nongkrong - Seabank (Rp 50.000)", "templateNongkrong")
    .addSeparator()
    .addItem("👫 Mode: Titip Uang ke Audy", "setModeTitipAudy")
    .addItem("📲 Mode: Terima Transfer dari Audy", "setModeTerimaAudy")
    .addItem("🤝 Mode: Pinjamkan Uang (Piutang)", "setModePinjamkan")
    .addItem("🍕 Mode: Traktir Teman / Saudara", "setModeTraktir")
    .addSeparator()
    .addItem("💰 Set ke Mode Pemasukan", "setModePemasukan")
    .addItem("💸 Set ke Mode Pengeluaran", "setModePengeluaran")
    .addItem("🔄 Sinkronkan Kategori & Validasi", "setupInitialValidation")
    .addItem("💳 Perbaiki Dropdown Akun di Semua Sheet", "fixAllAccountValidations")
    .addToUi();

  setupInitialValidation();
}

function setModeTitipAudy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("B8").setValue("Transfer");
  updateCategoryValidation(sheet, "Transfer");
  sheet.getRange("C8").setValue("Titip uang ke Audy");
  sheet.getRange("D8").setValue("Titip uang belanja / tabungan ke Audy");
  sheet.getRange("E8").setValue("Seabank");
  ss.toast("👫 Mode Titip Uang ke Audy aktif! Masukkan nominal lalu centang Simpan.", "Titip ke Audy", 4);
}

function setModeTerimaAudy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("B8").setValue("Transfer");
  updateCategoryValidation(sheet, "Transfer");
  sheet.getRange("C8").setValue("Tarik uang dari Audy");
  sheet.getRange("D8").setValue("Minta transfer dari Audy untuk belanja");
  sheet.getRange("E8").setValue("Audy Salsabilla");
  ss.toast("📲 Mode Tarik dari Audy aktif! Masukkan nominal lalu centang Simpan.", "Tarik dari Audy", 4);
}

function setModePinjamkan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("B8").setValue("Transfer");
  updateCategoryValidation(sheet, "Transfer");
  sheet.getRange("C8").setValue("Transfer lainnya");
  sheet.getRange("D8").setValue("Pinjamkan uang ke [Nama]");
  sheet.getRange("E8").setValue("Seabank");
  ss.toast("🤝 Mode Pinjamkan Uang aktif! Tulis nama peminjam di keterangan.", "Pinjamkan Uang", 4);
}

function setModeTraktir() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("B8").setValue("Pengeluaran");
  updateCategoryValidation(sheet, "Pengeluaran");
  sheet.getRange("C8").setValue("Nongkrong");
  sheet.getRange("D8").setValue("Traktir makan / nongkrong bareng");
  sheet.getRange("E8").setValue("Seabank");
  ss.toast("🍕 Mode Traktir aktif! Masukkan nominal traktir lalu centang Simpan.", "Traktir", 4);
}

function setModePemasukan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("B8").setValue("Pemasukan");
  updateCategoryValidation(sheet, "Pemasukan");
  sheet.getRange("D8").setValue("Gaji / Pemasukan");
  ss.toast("💰 Mode Pemasukan aktif! Kategori telah disesuaikan.", "Mode Pemasukan", 3);
}

function setModePengeluaran() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (!sheet) return;
  sheet.getRange("B8").setValue("Pengeluaran");
  updateCategoryValidation(sheet, "Pengeluaran");
  sheet.getRange("D8").setValue("");
  ss.toast("💸 Mode Pengeluaran aktif! Kategori telah disesuaikan dengan budget aktif.", "Mode Pengeluaran", 3);
}

function setupInitialValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (sheet) {
    var jenis = sheet.getRange("B8").getValue() || "Pengeluaran";
    updateCategoryValidation(sheet, jenis);
    
    // Sinkronkan juga Recent Transactions C13:C50
    var budgeted = getBudgetedCategories();
    var allowedAll = budgeted.concat(KAT_PEMASUKAN).concat(KAT_TRANSFER);
    var ruleKatRecent = SpreadsheetApp.newDataValidation().requireValueInList(allowedAll, true).build();
    sheet.getRange("C13:C50").setDataValidation(ruleKatRecent);
  }
  
  // Sinkronkan dropdown akun di seluruh sheet (RIWAYAT & INPUT)
  fixAllAccountValidations();
}


function fixAllAccountValidations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var setSheet = ss.getSheetByName("PENGATURAN");
  var histSheet = ss.getSheetByName("RIWAYAT TRANSAKSI");
  var inputSheet = ss.getSheetByName("INPUT TRANSAKSI");

  var ruleAkun;
  if (setSheet) {
    // Kolom B pada sheet PENGATURAN adalah Nama Akun resmi (B3:B11)
    var accountRange = setSheet.getRange("B3:B11");
    ruleAkun = SpreadsheetApp.newDataValidation()
      .requireValueInRange(accountRange, true)
      .setAllowInvalid(false)
      .build();
  } else {
    ruleAkun = SpreadsheetApp.newDataValidation()
      .requireValueInList(ACCOUNTS, true)
      .setAllowInvalid(false)
      .build();
  }

  // 1. Perbaiki kolom Akun di RIWAYAT TRANSAKSI (Kolom F, baris 5 s.d. 500)
  if (histSheet) {
    histSheet.getRange("F5:F500").setDataValidation(ruleAkun);
  }

  // 2. Perbaiki dropdown Akun di INPUT TRANSAKSI (E8 dan E13:E50)
  if (inputSheet) {
    inputSheet.getRange("E8").setDataValidation(ruleAkun);
    inputSheet.getRange("E13:E50").setDataValidation(ruleAkun);
  }

  ss.toast("✅ Dropdown Akun di RIWAYAT TRANSAKSI & INPUT berhasil disinkronkan ke Nama Akun resmi!", "Sinkronisasi Akun", 4);
}


function formatAndAlignPengaturanSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PENGATURAN");
  if (!sheet) {
    sheet = ss.insertSheet("PENGATURAN");
  }

  // 1. Unmerge existing areas in columns A to O from row 1 to 25 to avoid merge conflicts
  sheet.getRange("A1:O25").breakApart();

  // 2. Clear contents and formats in columns A to O (rows 1 to 25)
  sheet.getRange("A1:O25").clear();

  // 3. Set column widths for clean symmetry
  sheet.setColumnWidth(1, 40);  // No
  sheet.setColumnWidth(2, 140); // Nama Akun
  sheet.setColumnWidth(3, 130); // Tipe Akun
  sheet.setColumnWidth(4, 110); // Saldo Awal
  sheet.setColumnWidth(5, 75);  // Status
  // Spacer 1
  sheet.setColumnWidth(6, 25);  // Blank spacer
  // Table 2 (Quick Expense): G to J
  sheet.setColumnWidth(7, 160); // Quick Expense
  sheet.setColumnWidth(8, 140); // Kategori Otomatis
  sheet.setColumnWidth(9, 100); // Akun Standar
  sheet.setColumnWidth(10, 110); // Nominal Default
  // Spacer 2
  sheet.setColumnWidth(11, 25); // Blank spacer
  // Table 3 (Transaksi Rutin): L to O
  sheet.setColumnWidth(12, 160); // Transaksi Rutin
  sheet.setColumnWidth(13, 140); // Kategori
  sheet.setColumnWidth(14, 110); // Nominal Rutin
  sheet.setColumnWidth(15, 120); // Akun Pembayar

  // 4. Main Header Banner (Row 1)
  sheet.getRange("A1:O1").merge();
  var titleCell = sheet.getRange("A1");
  titleCell.setValue("⚙️ PENGATURAN SISTEM, AKUN & TEMPLATE TRANSAKSI");
  titleCell.setFontWeight("bold").setFontSize(11).setFontColor("#FFFFFF");
  titleCell.setBackground("#1E293B");
  titleCell.setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // Set Row Heights
  sheet.setRowHeight(2, 28);
  for (var r = 3; r <= 12; r++) {
    sheet.setRowHeight(r, 24);
  }

  // 5. Table Headers (Row 2)
  var headersT1 = [["No", "Nama Akun", "Tipe Akun", "Saldo Awal", "Status"]];
  var headersT2 = [["Quick Expense", "Kategori Otomatis", "Akun Standar", "Nominal Default"]];
  var headersT3 = [["Transaksi Rutin", "Kategori", "Nominal Rutin", "Akun Pembayar"]];

  sheet.getRange("A2:E2").setValues(headersT1);
  sheet.getRange("G2:J2").setValues(headersT2);
  sheet.getRange("L2:O2").setValues(headersT3);

  sheet.getRange("A2:E2").setBackground("#334155");
  sheet.getRange("G2:J2").setBackground("#334155");
  sheet.getRange("L2:O2").setBackground("#334155");

  sheet.getRange("A2:E2").setFontWeight("bold").setFontSize(9).setFontColor("#FFFFFF").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("G2:J2").setFontWeight("bold").setFontSize(9).setFontColor("#FFFFFF").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("L2:O2").setFontWeight("bold").setFontSize(9).setFontColor("#FFFFFF").setHorizontalAlignment("center").setVerticalAlignment("middle");

  // 6. Data Table 1: DAFTAR AKUN (Rows 3 - 11)
  var accountsData = [
    [1, "Cash", "Dompet Tunai", 0, "Aktif"],
    [2, "BCA", "Rekening Bank", 35782, "Aktif"],
    [3, "Mandiri", "Rekening Bank", 25000, "Aktif"],
    [4, "BRI", "Rekening Bank", 0, "Aktif"],
    [5, "Seabank", "Rekening Bank", 3894, "Aktif"],
    [6, "GoPay", "E-Wallet", 0, "Aktif"],
    [7, "OVO", "E-Wallet", 0, "Aktif"],
    [8, "ShopeePay", "E-Wallet", 0, "Aktif"],
    [9, "Audy Salsabilla", "Dompet Titipan", 0, "Aktif"]
  ];
  sheet.getRange("A3:E11").setValues(accountsData);

  // Row 12: Total Saldo Awal
  sheet.getRange("A12:C12").merge();
  sheet.getRange("A12").setValue("Total Saldo Awal").setFontWeight("bold").setHorizontalAlignment("right").setVerticalAlignment("middle");
  sheet.getRange("D12").setFormula("=SUM(D3:D11)").setFontWeight("bold").setNumberFormat("Rp #,##0");
  sheet.getRange("E12").setValue("-").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.getRange("A12:E12").setBackground("#F1F5F9");
  sheet.getRange("A12:E12").setBorder(true, null, true, null, null, null, "#94A3B8", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Formatting Table 1
  sheet.getRange("A3:A11").setHorizontalAlignment("center");
  sheet.getRange("B3:C11").setHorizontalAlignment("left");
  sheet.getRange("D3:D11").setNumberFormat("Rp #,##0").setHorizontalAlignment("right");
  sheet.getRange("E3:E11").setHorizontalAlignment("center");
  sheet.getRange("A3:E11").setFontSize(9).setVerticalAlignment("middle");

  // 7. Data Table 2: QUICK EXPENSE TEMPLATES (Rows 3 - 12)
  var quickExpenseData = [
    ["Kopi 13rb", "Makan dan minum", "Seabank", 13000],
    ["Makan 20rb", "Makan dan minum", "Seabank", 20000],
    ["Bensin 20rb", "Bensin", "Seabank", 20000],
    ["Parkir 2rb", "Parkir dan tol", "Seabank", 2000],
    ["Internet 85rb", "Internet rumah", "Seabank", 85000],
    ["Nongkrong 50rb", "Nongkrong", "Seabank", 50000],
    ["Transport Online", "Transportasi online", "Seabank", 35000],
    ["Belanja Sayur & Buah", "Belanja bulanan", "Seabank", 75000],
    ["Kebutuhan Rumah", "Kebutuhan rumah", "Seabank", 100000],
    ["Traktir Saudara / Teman", "Traktir dan sosial", "Seabank", 50000]
  ];
  sheet.getRange("G3:J12").setValues(quickExpenseData);
  sheet.getRange("G3:H12").setHorizontalAlignment("left");
  sheet.getRange("I3:I12").setHorizontalAlignment("center");
  sheet.getRange("J3:J12").setNumberFormat("Rp #,##0").setHorizontalAlignment("right");
  sheet.getRange("G3:J12").setFontSize(9).setVerticalAlignment("middle");

  // 8. Data Table 3: TRANSAKSI RUTIN (Rows 3 - 12)
  var routineData = [
    ["Gaji Bulanan", "Gaji pokok", 15000000, "BCA"],
    ["Internet WiFi Rumah", "Internet rumah", 450000, "BCA"],
    ["Token Listrik PLN", "Listrik dan air", 500000, "GoPay"],
    ["Tagihan Air PDAM", "Kebutuhan rumah", 120000, "Mandiri"],
    ["Netflix Streaming", "Langganan aplikasi", 186000, "Mandiri"],
    ["Spotify Premium", "Langganan aplikasi", 86000, "GoPay"],
    ["Iuran Tabungan Rutin", "Investasi dan dividen", 3000000, "Mandiri"],
    ["Titip Uang ke Audy", "Titip uang ke Audy", 1000000, "BCA"],
    ["Paket Data Darurat", "Internet rumah", 50000, "Seabank"],
    ["Sedekah / Donasi", "Donasi dan sedekah", 100000, "Cash"]
  ];
  sheet.getRange("L3:O12").setValues(routineData);
  sheet.getRange("L3:M12").setHorizontalAlignment("left");
  sheet.getRange("N3:N12").setNumberFormat("Rp #,##0").setHorizontalAlignment("right");
  sheet.getRange("O3:O12").setHorizontalAlignment("center");
  sheet.getRange("L3:O12").setFontSize(9).setVerticalAlignment("middle");

  // Borders
  sheet.getRange("A3:E11").setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("G3:J12").setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("L3:O12").setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange("A2:E12").setBorder(true, true, true, true, null, null, "#94A3B8", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("G2:J12").setBorder(true, true, true, true, null, null, "#94A3B8", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("L2:O12").setBorder(true, true, true, true, null, null, "#94A3B8", SpreadsheetApp.BorderStyle.SOLID);

  // 9. Adjust Dependent Formulas
  var dashSheet = ss.getSheetByName("DASHBOARD");
  if (dashSheet) {
    dashSheet.getRange("A6").setFormula("=PENGATURAN!D12 + C6 - E6");
  }

  // 10. Update Dropdowns on INPUT TRANSAKSI
  var inputSheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (inputSheet) {
    var ACCOUNTS_LIST = ["Seabank", "Audy Salsabilla", "BCA", "Mandiri", "BRI", "Cash", "GoPay", "OVO", "ShopeePay"];
    var ruleAkun = SpreadsheetApp.newDataValidation().requireValueInList(ACCOUNTS_LIST, true).build();
    inputSheet.getRange("E8").setDataValidation(ruleAkun);
    inputSheet.getRange("E13:E50").setDataValidation(ruleAkun);
  }

  ss.toast("✅ Sheet PENGATURAN dan rumus DASHBOARD berhasil dirapihkan sempurna!", "Selesai", 5);
}


// ==========================================
// REST API WEB APP ENDPOINTS (doGet & doPost)
// ==========================================

var API_SECRET = "POCKET_FINANCE_SECRET_2026";

function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = (params && params.action) ? params.action : "metadata";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Metadata & Dashboard KPI
    if (action === "metadata" || action === "dashboard") {
      var setSheet = ss.getSheetByName("PENGATURAN");
      var dashSheet = ss.getSheetByName("DASHBOARD");
      var budgetSheet = ss.getSheetByName("BUDGET & KATEGORI");

      // Active Accounts
      var accounts = [];
      if (setSheet) {
        var accData = setSheet.getRange("A3:E11").getValues();
        for (var i = 0; i < accData.length; i++) {
          if (accData[i][4] === "Aktif" && accData[i][1]) {
            accounts.push({
              id: accData[i][0],
              name: String(accData[i][1]),
              type: String(accData[i][2]),
              initialBalance: Number(accData[i][3]) || 0
            });
          }
        }
      }

      // Quick Expense Templates
      var templates = [];
      if (setSheet) {
        var tData = setSheet.getRange("G3:J15").getValues();
        for (var j = 0; j < tData.length; j++) {
          if (tData[j][0]) {
            templates.push({
              name: String(tData[j][0]),
              category: String(tData[j][1]),
              defaultAccount: String(tData[j][2]),
              defaultAmount: Number(tData[j][3]) || 0
            });
          }
        }
      }

      // Categories
      var budgetedExp = getBudgetedCategories();
      var categories = {
        pengeluaran: budgetedExp,
        pemasukan: KAT_PEMASUKAN,
        transfer: KAT_TRANSFER
      };

      // Dashboard Metrics
      var dashboard = {
        totalSaldo: dashSheet ? (Number(dashSheet.getRange("A6").getValue()) || 0) : 0,
        pemasukanBulanIni: dashSheet ? (Number(dashSheet.getRange("C6").getValue()) || 0) : 0,
        pengeluaranBulanIni: dashSheet ? (Number(dashSheet.getRange("E6").getValue()) || 0) : 0,
        netCashFlow: dashSheet ? (Number(dashSheet.getRange("G6").getValue()) || 0) : 0,
        sisaBudget: dashSheet ? (Number(dashSheet.getRange("E10").getValue()) || 0) : 0,
        estimasiSaldoAkhir: dashSheet ? (Number(dashSheet.getRange("I10").getValue()) || 0) : 0,
        bulan: dashSheet ? String(dashSheet.getRange("B3").getValue()) : "November",
        tahun: dashSheet ? Number(dashSheet.getRange("D3").getValue()) : 2026
      };

      // Budget Breakdown
      var budgetSummary = [];
      if (budgetSheet) {
        var bData = budgetSheet.getRange("A6:G35").getValues();
        for (var k = 0; k < bData.length; k++) {
          var bKat = bData[k][1];
          var bVal = bData[k][2];
          var num = (typeof bVal === "number") ? bVal : 0;
          if (bKat && num > 0) {
            budgetSummary.push({
              group: String(bData[k][0]),
              category: String(bKat),
              budget: num,
              actual: bData[k][3] === "-" ? 0 : (Number(bData[k][3]) || 0),
              remaining: bData[k][4] === "-" ? 0 : (Number(bData[k][4]) || 0),
              percentage: Number(bData[k][5]) || 0,
              indicator: String(bData[k][6] || "🟢 Aman")
            });
          }
        }
      }

      return createJsonResponse({
        success: true,
        data: {
          accounts: accounts,
          categories: categories,
          templates: templates,
          dashboard: dashboard,
          budgetSummary: budgetSummary
        }
      });
    }

    // 2. Recent Transactions (last 10-20 transactions)
    if (action === "recent" || action === "history") {
      var limit = parseInt(params.limit || "10", 10);
      var histSheet = ss.getSheetByName("RIWAYAT TRANSAKSI");
      if (!histSheet) return createJsonResponse({ success: true, data: [] });

      var lastRow = histSheet.getLastRow();
      if (lastRow < 5) return createJsonResponse({ success: true, data: [] });

      var startRow = Math.max(5, lastRow - limit + 1);
      var numRows = lastRow - startRow + 1;
      var raw = histSheet.getRange(startRow, 1, numRows, 9).getValues();
      var items = [];

      for (var r = raw.length - 1; r >= 0; r--) {
        var row = raw[r];
        if (row[0] && row[0].toString().trim() !== "") {
          var tglStr = "";
          if (row[1] instanceof Date) {
            tglStr = Utilities.formatDate(row[1], "Asia/Jakarta", "yyyy-MM-dd");
          } else {
            tglStr = String(row[1]);
          }

          items.push({
            id: String(row[0]),
            date: tglStr,
            type: String(row[2]),
            category: String(row[3]),
            note: String(row[4] || ""),
            account: String(row[5]),
            amount: Number(row[6]) || 0,
            month: String(row[7]),
            year: Number(row[8])
          });
        }
      }

      return createJsonResponse({ success: true, data: items });
    }

    return createJsonResponse({ success: false, error: "Action tidak dikenal: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Tunggu antrean maks 10 detik
  } catch (lockErr) {
    return createJsonResponse({ success: false, error: "Sistem sibuk, silakan coba beberapa detik lagi." });
  }

  try {
    var rawBody = e && e.postData ? e.postData.contents : "{}";
    var payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      payload = (e && e.parameter) ? e.parameter : {};
    }

    // Security Check
    var reqKey = payload.key || (e && e.parameter ? e.parameter.key : "");
    if (reqKey !== API_SECRET) {
      return createJsonResponse({ success: false, error: "Akses ditolak: API Secret tidak valid." }, 401);
    }

    var action = payload.action || "createTransaction";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var histSheet = ss.getSheetByName("RIWAYAT TRANSAKSI");
    if (!histSheet) {
      return createJsonResponse({ success: false, error: "Sheet RIWAYAT TRANSAKSI tidak ditemukan." });
    }

    // Idempotency check via CacheService
    var requestId = payload.client_request_id || payload.transactionId || "";
    if (requestId) {
      var cache = CacheService.getScriptCache();
      var cachedRes = cache.get("TRX_" + requestId);
      if (cachedRes) {
        return createJsonResponse(JSON.parse(cachedRes));
      }
    }

    if (action === "createTransaction") {
      var t = payload.transaction || payload;
      var nominal = Number(t.nominal || t.amount || 0);
      if (isNaN(nominal) || nominal <= 0) {
        return createJsonResponse({ success: false, error: "Nominal harus berupa angka lebih dari 0." });
      }

      var jenis = t.jenis || t.type || "Pengeluaran";
      var kat = t.kategori || t.category || (jenis === "Pemasukan" ? "Gaji pokok" : "Makan dan minum");
      var ket = t.keterangan || t.note || kat;
      var akun = t.akun || t.account || "Seabank";

      // Parse Tanggal (Asia/Jakarta)
      var tglObj = new Date();
      if (t.tanggal || t.date) {
        var dParsed = new Date(t.tanggal || t.date);
        if (!isNaN(dParsed.getTime())) {
          tglObj = dParsed;
        }
      }

      var monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      var bln = monthNames[tglObj.getMonth()];
      var thn = tglObj.getFullYear();

      // 1. Tentukan ID Transaksi baru secara aman
      var nextRow = getFirstEmptyRow(histSheet, 5, 1);
      var trxId = "TRX-" + ("0000" + (nextRow - 4)).slice(-4);

      // 2. Simpan ke RIWAYAT TRANSAKSI
      histSheet.getRange(nextRow, 1, 1, 9).setValues([[
        trxId, tglObj, jenis, kat, ket, akun, nominal, bln, thn
      ]]);
      histSheet.getRange(nextRow, 2).setNumberFormat("dd/mm/yyyy");
      histSheet.getRange(nextRow, 7).setNumberFormat("Rp #,##0");

      // 3. Tambahkan juga ke Recent Transactions di INPUT TRANSAKSI (baris 13)
      var inputSheet = ss.getSheetByName("INPUT TRANSAKSI");
      if (inputSheet) {
        inputSheet.insertRowBefore(13);
        inputSheet.getRange(13, 1, 1, 6).setValues([[
          tglObj, jenis, kat, ket, akun, nominal
        ]]);
        inputSheet.getRange(13, 1).setNumberFormat("dd/mm/yyyy");
        inputSheet.getRange(13, 6).setNumberFormat("Rp #,##0");
        inputSheet.getRange(13, 7).insertCheckboxes();
        inputSheet.getRange(13, 7).setValue(false);
      }

      SpreadsheetApp.flush();

      // Get updated balance
      var dashSheet = ss.getSheetByName("DASHBOARD");
      var newSaldo = dashSheet ? dashSheet.getRange("A6").getValue() : 0;

      var responseData = {
        success: true,
        transactionId: trxId,
        message: "Transaksi ' + ket + ' berhasil dicatat!",
        totalSaldo: newSaldo,
        data: {
          id: trxId,
          date: Utilities.formatDate(tglObj, "Asia/Jakarta", "yyyy-MM-dd"),
          type: jenis,
          category: kat,
          note: ket,
          account: akun,
          amount: nominal,
          month: bln,
          year: thn
        }
      };

      // Cache for idempotency (10 minutes)
      if (requestId) {
        CacheService.getScriptCache().put("TRX_" + requestId, JSON.stringify(responseData), 600);
      }

      return createJsonResponse(responseData);
    }

    if (action === "deleteTransaction") {
      var delId = payload.id || payload.transactionId;
      if (!delId) return createJsonResponse({ success: false, error: "ID Transaksi wajib diisi." });

      var lastR = histSheet.getLastRow();
      var foundRow = -1;
      if (lastR >= 5) {
        var idList = histSheet.getRange(5, 1, lastR - 4, 1).getValues();
        for (var i = 0; i < idList.length; i++) {
          if (String(idList[i][0]) === String(delId)) {
            foundRow = 5 + i;
            break;
          }
        }
      }

      if (foundRow !== -1) {
        histSheet.deleteRow(foundRow);
        SpreadsheetApp.flush();
        var dSheet = ss.getSheetByName("DASHBOARD");
        var currSaldo = dSheet ? dSheet.getRange("A6").getValue() : 0;
        return createJsonResponse({
          success: true,
          message: "Transaksi " + delId + " berhasil dihapus.",
          totalSaldo: currSaldo
        });
      } else {
        return createJsonResponse({ success: false, error: "Transaksi dengan ID " + delId + " tidak ditemukan." });
      }
    }

    return createJsonResponse({ success: false, error: "Action tidak didukung: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


function inspectSheetStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bSheet = ss.getSheetByName("BUDGET & KATEGORI");
  var pSheet = ss.getSheetByName("PENGATURAN");
  var iSheet = ss.getSheetByName("INPUT TRANSAKSI");
  
  var bData = bSheet ? bSheet.getRange("A5:G32").getValues() : [];
  var pData = pSheet ? pSheet.getRange("G2:J14").getValues() : [];
  var iData = iSheet ? iSheet.getRange("A11:H13").getValues() : [];
  
  Logger.log("BUDGET_ROWS: " + JSON.stringify(bData));
  Logger.log("PENGATURAN_TEMPLATES: " + JSON.stringify(pData));
  Logger.log("INPUT_QUICK_BUTTONS: " + JSON.stringify(iData));
}


function inspectRow6Formulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bSheet = ss.getSheetByName("BUDGET & KATEGORI");
  var formulas = bSheet.getRange("A6:G6").getFormulas();
  Logger.log("ROW_6_FORMULAS: " + JSON.stringify(formulas));
}


function inspectInputButtons() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("INPUT TRANSAKSI");
  var r11 = sheet.getRange("A11:H11").getValues();
  var r12 = sheet.getRange("A12:H12").getValues();
  Logger.log("R11: " + JSON.stringify(r11));
  Logger.log("R12: " + JSON.stringify(r12));
}


function setupRokokFeature() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. UPDATE SHEET "BUDGET & KATEGORI"
  var bSheet = ss.getSheetByName("BUDGET & KATEGORI");
  if (bSheet) {
    var lastRow = bSheet.getLastRow();
    var valuesA = bSheet.getRange("A6:A" + lastRow).getValues();
    var valuesB = bSheet.getRange("B6:B" + lastRow).getValues();
    var totalRow = -1;
    var rokokRow = -1;

    for (var i = 0; i < valuesA.length; i++) {
      var rowNum = 6 + i;
      var aVal = String(valuesA[i][0] || "").trim();
      var bVal = String(valuesB[i][0] || "").trim();

      if (bVal.toLowerCase() === "rokok") {
        rokokRow = rowNum;
      }
      if (aVal.toUpperCase().indexOf("TOTAL") !== -1 && totalRow === -1) {
        totalRow = rowNum;
      }
    }

    if (rokokRow === -1 && totalRow !== -1) {
      bSheet.insertRowBefore(totalRow);
      rokokRow = totalRow;
      totalRow = totalRow + 1;

      bSheet.getRange(rokokRow, 1).setValue("Kategori Khusus");
      bSheet.getRange(rokokRow, 2).setValue("Rokok");
      bSheet.getRange(rokokRow, 3).setValue(150000);
      bSheet.getRange("D6:G6").copyTo(bSheet.getRange(rokokRow, 4, 1, 4), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

      bSheet.getRange(rokokRow, 3, 1, 3).setNumberFormat("Rp #,##0");
      bSheet.getRange(rokokRow, 6).setNumberFormat("0.0%");
      bSheet.getRange(rokokRow, 1, 1, 7).setFontFamily("Quattrocento Sans").setFontSize(10);
      bSheet.getRange(rokokRow, 1, 1, 7).setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
    } else if (rokokRow !== -1) {
      bSheet.getRange(rokokRow, 1).setValue("Kategori Khusus");
      bSheet.getRange(rokokRow, 2).setValue("Rokok");
      if (bSheet.getRange(rokokRow, 3).getValue() <= 0 || bSheet.getRange(rokokRow, 3).getValue() === "-") {
        bSheet.getRange(rokokRow, 3).setValue(150000);
      }
    }

    var lastCatRow = totalRow - 1;
    bSheet.getRange(totalRow, 3).setFormula("=SUM(C6:C" + lastCatRow + ")");
    bSheet.getRange(totalRow, 4).setFormula("=SUM(D6:D" + lastCatRow + ")");
    bSheet.getRange(totalRow, 5).setFormula('=IF(C' + totalRow + '="-", "-", C' + totalRow + '-D' + totalRow + ')');
    bSheet.getRange(totalRow, 6).setFormula('=IF(OR(C' + totalRow + '="-", C' + totalRow + '=0), 0, D' + totalRow + '/C' + totalRow + ')');
    bSheet.getRange(totalRow, 7).setFormula('=IF(F' + totalRow + '>1, "🔴 Overbudget", IF(F' + totalRow + '>=0.8, "🟡 Waspada", "🟢 Terkendali"))');

    bSheet.getRange("B4").setFormula("=C" + totalRow);
    bSheet.getRange("D4").setFormula("=D" + totalRow);
    bSheet.getRange("F4").setFormula("=E" + totalRow);
    bSheet.getRange("G4").setFormula("=F" + totalRow);
  }

  // 2. UPDATE SHEET "PENGATURAN"
  var pSheet = ss.getSheetByName("PENGATURAN");
  if (pSheet) {
    pSheet.getRange("G13:J13").setValues([["Rokok 5rb", "Rokok", "Seabank", 5000]]);
    pSheet.getRange("J13").setNumberFormat("Rp #,##0");
    pSheet.getRange("G13:J13").setFontFamily("Quattrocento Sans").setFontSize(10);
    pSheet.getRange("G13:J13").setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
  }

  // 3. UPDATE SHEET "INPUT TRANSAKSI" QUICK BUTTONS
  var iSheet = ss.getSheetByName("INPUT TRANSAKSI");
  if (iSheet) {
    try { iSheet.getRange("A1:G2").breakApart(); } catch(e) {}
    iSheet.getRange("A1:H2").merge().setValue("SMART QUICK INPUT – PENCATATAN KEUANGAN CEPAT");

    try { iSheet.getRange("A3:G3").breakApart(); } catch(e) {}
    iSheet.getRange("A3:H3").merge().setValue("⚡ TOMBOL PILIHAN CEPAT (KLIK / TAP KOTAK TOMBOL UNTUK MENGISI FORMULIR OTOMATIS)");

    iSheet.getRange("G4").setValue("🚬 Rokok\nSeabank Rp 5rb")
      .setBackground("#fff3e0")
      .setFontColor("#b45309")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setWrap(true);

    iSheet.getRange("G5").insertCheckboxes()
      .setValue(false)
      .setBackground("#fff3e0")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    iSheet.getRange("H4").setValue("🧹 Reset\nKosongkan Form")
      .setBackground("#f1f5f9")
      .setFontColor("#475569")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setWrap(true);

    iSheet.getRange("H5").insertCheckboxes()
      .setValue(false)
      .setBackground("#f1f5f9")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    iSheet.getRange("G4:H5").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

    try { iSheet.getRange("A6:G6").breakApart(); } catch(e) {}
    iSheet.getRange("A6:H6").merge().setValue("FORMULIR INPUT TRANSAKSI BARU (LANGSUNG TERCATAT KE RIWAYAT)");

    try { iSheet.getRange("A10:G10").breakApart(); } catch(e) {}
    iSheet.getRange("A10:H10").merge().setValue("DAFTAR TRANSAKSI TERAKHIR (RECENT TRANSACTIONS & DIRECT FAST LOG)");

    try { iSheet.getRange("A11:G11").breakApart(); } catch(e) {}
    iSheet.getRange("A11:H11").merge().setValue("Ketik atau gunakan kembali transaksi di bawah ini. Transaksi otomatis terhubung ke Riwayat dan memperbarui Dashboard.");

    updateCategoryValidation(iSheet, "Pengeluaran");
  }

  SpreadsheetApp.flush();
  Logger.log("SETUP_ROKOK_COMPLETED_SUCCESSFULLY");
}

function fixRokokFormulasNow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bSheet = ss.getSheetByName("BUDGET & KATEGORI");
  if (!bSheet) return;
  var lastRow = bSheet.getLastRow();
  var bValues = bSheet.getRange("B6:B" + lastRow).getValues();
  for (var i = 0; i < bValues.length; i++) {
    if (String(bValues[i][0] || "").toLowerCase() === "rokok") {
      var rRow = 6 + i;
      bSheet.getRange("D6:G6").copyTo(bSheet.getRange(rRow, 4, 1, 4), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
      bSheet.getRange(rRow, 3, 1, 3).setNumberFormat("Rp #,##0");
      bSheet.getRange(rRow, 6).setNumberFormat("0.0%");
      Logger.log("FIXED_ROKOK_ROW_AT_" + rRow);
      break;
    }
  }
}
