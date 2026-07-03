import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Platform } from 'react-native';

import { getFirebaseStorage } from '@/src/firebase/config';

export type ReceiptRecordType = 'revenues' | 'expenses';

export interface ReceiptAttachment {
  receiptName: string;
  receiptPath: string;
  receiptUrl: string;
}

interface UploadReceiptInput {
  branchId: string;
  recordType: ReceiptRecordType;
  userId: string;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      input.remove();
      resolve(file);
    };

    input.oncancel = () => {
      input.remove();
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header?.match(/data:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(data || '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

async function compressImageAsDataUrl(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return dataUrl;

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.58;
  let compressed = canvas.toDataURL('image/jpeg', quality);
  while (compressed.length > 850_000 && quality > 0.34) {
    quality -= 0.08;
    compressed = canvas.toDataURL('image/jpeg', quality);
  }

  return compressed;
}

async function prepareUploadFile(file: File): Promise<{ body: Blob | File; contentType: string; safeName: string; inlineUrl: string }> {
  const safeName = sanitizeFileName(file.name || 'receipt.jpg');

  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return {
      body: file,
      contentType: file.type || 'image/jpeg',
      safeName,
      inlineUrl: await readFileAsDataUrl(file),
    };
  }

  try {
    const inlineUrl = await compressImageAsDataUrl(file);
    return {
      body: dataUrlToBlob(inlineUrl),
      contentType: 'image/jpeg',
      safeName: safeName.replace(/\.[^.]+$/, '') + '.jpg',
      inlineUrl,
    };
  } catch {
    return {
      body: file,
      contentType: file.type || 'image/jpeg',
      safeName,
      inlineUrl: await readFileAsDataUrl(file),
    };
  }
}

export async function pickAndUploadReceipt({
  branchId,
  recordType,
  userId,
}: UploadReceiptInput): Promise<ReceiptAttachment | null> {
  const file = await pickImageFile();
  if (!file) return null;

  const uploadFile = await prepareUploadFile(file);
  const receiptPath = `receipts/${branchId}/${recordType}/${Date.now()}-${uploadFile.safeName}`;
  try {
    const receiptRef = ref(getFirebaseStorage(), receiptPath);

    await uploadBytes(receiptRef, uploadFile.body, {
      contentType: uploadFile.contentType,
      customMetadata: { uploadedBy: userId },
    });

    const receiptUrl = await getDownloadURL(receiptRef);

    return {
      receiptName: file.name || uploadFile.safeName,
      receiptPath,
      receiptUrl,
    };
  } catch {
    return {
      receiptName: file.name || uploadFile.safeName,
      receiptPath: `inline/${branchId}/${recordType}/${Date.now()}-${uploadFile.safeName}`,
      receiptUrl: uploadFile.inlineUrl,
    };
  }
}
