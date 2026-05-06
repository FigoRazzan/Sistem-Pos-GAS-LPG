import { createWorker } from "tesseract.js";
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import os from "os";

export const runtime = "nodejs";

const normalizeText = (text: string) => {
  return text
    .toUpperCase()
    .replace(/[\s\r\n\t]+/g, " ")
    .replace(/[0]/g, "O")
    .replace(/[1!|]/g, "I")
    .replace(/[5]/g, "S")
    .replace(/[8]/g, "B")
    .replace(/[^A-Z\s]/g, "");
};

const detectMainan = (rawText: string) => {
  const text = rawText.toUpperCase();
  const cleanText = normalizeText(rawText);
  const compact = cleanText.replace(/\s+/g, "");

  const patterns = [
    "MAINAN",
    "UANG MAINAN",
    "MAINAN SAJA",
    "BUKAN UANG",
    "UANG MAINAN KITA",
    "MAINAN KITA",
  ];

  for (const pattern of patterns) {
    if (text.includes(pattern) || cleanText.includes(pattern)) {
      return { found: true, pattern };
    }
  }

  if (compact.includes("UANGMAINAN") || compact.includes("MAINAN")) {
    return { found: true, pattern: "MAINAN (compact)" };
  }

  const fuzzy = /M[A4][I1!|][N][A4][N]/g;
  if (fuzzy.test(text) || fuzzy.test(cleanText)) {
    return { found: true, pattern: "MAINAN (fuzzy)" };
  }

  return { found: false, pattern: "" };
};

export async function POST(request: NextRequest) {
  let worker: any = null;
  let tempPaths: string[] = [];
  let fullPath = "";

  try {
    const { imagePath } = await request.json();
    console.log("[OCR API] Processing:", imagePath);

    if (!imagePath) {
      return NextResponse.json(
        { error: "Image path required", success: false },
        { status: 400 }
      );
    }

    // Validate path to prevent directory traversal
    fullPath = path.join(process.cwd(), "public/deteksi_uang_palsu", path.basename(imagePath));
    console.log("[OCR API] Full path:", fullPath);
    
    // Check if file exists
    try {
      await readFile(fullPath);
    } catch {
      console.log("[OCR API] File not found:", fullPath);
      return NextResponse.json(
        { error: "Image file not found", success: false },
        { status: 404 }
      );
    }

    // Preprocess image untuk meningkatkan text detection
    console.log("[OCR API] Preprocessing image for better text detection...");
    const baseName = `ocr_processed_${Date.now()}`;
    const tmpDir = os.tmpdir();

    const variantPaths = {
      original: fullPath,
      normalized: path.join(tmpDir, `${baseName}_norm.png`),
      threshold: path.join(tmpDir, `${baseName}_thresh.png`),
      inverted: path.join(tmpDir, `${baseName}_inv.png`),
    } as const;

    try {
      await sharp(fullPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .normalize()
        .modulate({ brightness: 1.1, contrast: 1.2 })
        .sharpen()
        .toFile(variantPaths.normalized);

      await sharp(fullPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .grayscale()
        .normalize()
        .threshold(160)
        .toFile(variantPaths.threshold);

      await sharp(fullPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .grayscale()
        .normalize()
        .threshold(160)
        .negate()
        .toFile(variantPaths.inverted);

      tempPaths = [variantPaths.normalized, variantPaths.threshold, variantPaths.inverted];
      console.log("[OCR API] Image preprocessing completed");
    } catch (preprocessError) {
      console.error("[OCR API] Image preprocessing failed, using original:", preprocessError);
      tempPaths = [];
    }

    // OCR processing dengan konfigurasi lebih baik
    console.log("[OCR API] Starting Tesseract recognition with Indonesian + English...");
    const workerPath = path.resolve(
      process.cwd(),
      "node_modules",
      "tesseract.js",
      "src",
      "worker-script",
      "node",
      "index.js"
    );
    process.env.TESSERACT_WORKER_PATH = workerPath;
    console.log("[OCR API] Worker path:", workerPath);
    worker = await createWorker(
      "ind+eng",
      1,
      {
        workerPath,
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            console.log(`[OCR API] Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    await worker.loadLanguage("ind+eng");
    await worker.initialize("ind+eng");
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ",
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: "6",
    });

    const candidatePaths = [fullPath, ...tempPaths];
    let finalText = "";
    let isCounterfeit = false;
    let detectedPattern = "";

    for (const candidate of candidatePaths) {
      console.log("[OCR API] Recognizing:", candidate);
      const { data } = await worker.recognize(candidate);
      const text = (data.text || "").toUpperCase().trim();
      finalText = text;

      console.log("[OCR API] Detected text length:", text.length);
      console.log("[OCR API] Text preview:", text.substring(0, 200));

      const result = detectMainan(text);
      if (result.found) {
        isCounterfeit = true;
        detectedPattern = result.pattern;
        console.log("[OCR API] ✓ Pattern FOUND:", detectedPattern);
        break;
      }
    }

    if (!isCounterfeit) {
      console.log("[OCR API] ✗ No counterfeit patterns detected in text");
    }

    const response = {
      success: true,
      isCounterfeit,
      detectedText: finalText.substring(0, 300),
      confidence: isCounterfeit ? 95 : 0,
      detectedPattern,
    };

    console.log("[OCR API] Final Response:", {
      success: response.success,
      isCounterfeit: response.isCounterfeit,
      detectedPattern: response.detectedPattern,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[OCR API] Error:", error.message || error);
    return NextResponse.json(
      { 
        error: "OCR processing failed",
        success: false,
        isCounterfeit: false,
        detectedText: "",
        confidence: 0,
        errorDetails: error.message,
      },
      { status: 500 }
    );
  } finally {
    // Cleanup
    if (worker) {
      try {
        console.log("[OCR API] Terminating worker...");
        await worker.terminate();
      } catch (e) {
        console.error("[OCR API] Error terminating worker:", e);
      }
    }

    // Delete temp file
    if (tempPaths.length > 0) {
      try {
        const fs = await import("fs/promises");
        await Promise.all(tempPaths.map((p) => fs.unlink(p).catch(() => undefined)));
      } catch (e) {
        console.error("[OCR API] Error deleting temp files:", e);
      }
    }
  }
}
