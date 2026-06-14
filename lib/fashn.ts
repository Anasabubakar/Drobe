// lib/fashn.ts
// Fashn.ai — Virtual Try-On API
// Docs: https://fashn.ai/docs
// Free tier: 20 try-ons/month, $0.05/try-on after that

const FASHN_BASE = "https://api.fashn.ai/v1";

type FashnCategory = "tops" | "bottoms" | "one-pieces";

interface FashnRunInput {
  model_image: string;    // URL of person's portrait
  garment_image: string;  // URL of clothing item (bg-removed preferred)
  category: FashnCategory;
  // Optional Fashn.ai params
  adjust_hands?: boolean;
  restore_background?: boolean;
  restore_clothes?: boolean;
  flat_lay?: boolean;
}

interface FashnStatus {
  id: string;
  status: "starting" | "in_queue" | "processing" | "completed" | "failed";
  output?: string[];  // array of result image URLs when completed
  error?: string;
}

// ---- Map our category to Fashn category ----
function mapCategoryToFashn(category: string): FashnCategory {
  const map: Record<string, FashnCategory> = {
    top: "tops",
    bottom: "bottoms",
    dress: "one-pieces",
    outerwear: "tops",
    shoes: "tops",      // Fashn doesn't support shoes, use tops as fallback
    accessory: "tops",
  };
  return map[category] || "tops";
}

// ---- Start a try-on job ----
export async function startTryOn(
  portraitUrl: string,
  garmentUrl: string,
  category: string
): Promise<string> {  // returns job ID
  const body: FashnRunInput = {
    model_image: portraitUrl,
    garment_image: garmentUrl,
    category: mapCategoryToFashn(category),
    adjust_hands: true,
    restore_background: true,
    restore_clothes: false,
  };

  const res = await fetch(`${FASHN_BASE}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FASHN_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Fashn.ai run failed: ${err}`);
  }

  const data = await res.json();
  return data.id;  // job ID to poll
}

// ---- Poll job status ----
export async function getTryOnStatus(jobId: string): Promise<FashnStatus> {
  const res = await fetch(`${FASHN_BASE}/status/${jobId}`, {
    headers: {
      "Authorization": `Bearer ${process.env.FASHN_API_KEY}`,
    },
  });

  if (!res.ok) throw new Error(`Fashn.ai status check failed`);
  return res.json();
}

// ---- Wait for job to complete (polls every 2s, max 60s) ----
export async function waitForTryOn(jobId: string): Promise<string> {  // returns image URL
  const maxAttempts = 30;

  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTryOnStatus(jobId);

    if (status.status === "completed" && status.output?.[0]) {
      return status.output[0];
    }

    if (status.status === "failed") {
      throw new Error(`Fashn.ai try-on failed: ${status.error}`);
    }

    // Wait 2 seconds before next poll
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("Fashn.ai try-on timed out after 60 seconds");
}

// ---- Full try-on in one call (run + wait) ----
export async function generateTryOn(
  portraitUrl: string,
  garmentUrl: string,
  category: string
): Promise<string> {
  const jobId = await startTryOn(portraitUrl, garmentUrl, category);
  return waitForTryOn(jobId);
}
