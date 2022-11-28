import { fileOpen, fileSave, supported } from 'browser-fs-access';
import type { FileSystemHandle } from 'browser-fs-access';
import { get as getFromIdb, set as setToIdb } from 'idb-keyval';
import { FILE_EXTENSION, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '@tldr/constants';
import type { TDDocument, TDFile } from '@tldr/types';

const options = { mode: 'readwrite' as const };

const checkPermissions = async (handle: FileSystemFileHandle) => {
  return (
    (await (handle as unknown as FileSystemHandle).queryPermission(options)) === 'granted' ||
    (await (handle as unknown as FileSystemHandle).requestPermission(options)) === 'granted'
  );
};

export async function loadFileHandle() {
  if (typeof Window === 'undefined' || !('_location' in Window)) return;
  const fileHandle = await getFromIdb(`Tldraw_file_handle_${window.location.origin}`);
  if (!fileHandle) return null;
  return fileHandle;
}

export async function saveFileHandle(fileHandle: FileSystemFileHandle | null) {
  return await setToIdb(`Tldraw_file_handle_${window.location.origin}`, fileHandle);
}

export async function saveToFileSystem(document: TDDocument, fileHandle: FileSystemFileHandle | null, name?: string) {
  // Create the saved file data
  const file: TDFile = {
    name: document.name || 'New Document',
    fileHandle: fileHandle ?? null,
    document,
    assets: {},
  };

  // Serialize to JSON
  const json = process.env.NODE_ENV === 'production' ? JSON.stringify(file) : JSON.stringify(file, null, 2);

  // Create blob
  const blob = new Blob([json], {
    type: 'application/vnd.Tldraw+json',
  });

  if (fileHandle != undefined) {
    const hasPermissions = await checkPermissions(fileHandle);
    if (!hasPermissions) return null;
  }
  const filename = !supported && name?.length ? name : `${file.name}`;
  // Save to file system
  const newFileHandle = await fileSave(
    blob,
    {
      fileName: `${filename}${FILE_EXTENSION}`,
      description: 'Tldraw File',
      extensions: [`${FILE_EXTENSION}`],
    },
    fileHandle,
  );

  await saveFileHandle(newFileHandle);

  // Return true
  return newFileHandle;
}

export async function openFromFileSystem(): Promise<null | {
  document: TDDocument;
  fileHandle: FileSystemFileHandle | null;
}> {
  // Get the blob
  const blob = await fileOpen({
    description: 'Tldraw File',
    extensions: [`${FILE_EXTENSION}`],
    multiple: false,
  });

  if (!blob) return null;

  // Get JSON from blob
  const json: string = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState === FileReader.DONE) {
        resolve(reader.result as string);
      }
    };
    reader.readAsText(blob, 'utf8');
  });

  // Parse
  const file: TDFile = JSON.parse(json);

  const fileHandle = blob.handle ?? null;

  await saveFileHandle(fileHandle);

  return {
    fileHandle,
    document: file.document,
  };
}

export async function openAssetsFromFileSystem() {
  return await fileOpen({
    description: 'Image or Video',
    extensions: [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS],
    multiple: true,
  });
}

export async function fileToBase64(file: Blob): Promise<string | ArrayBuffer | null> {
  return await new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.onabort = (error) => reject(error);
    }
  });
}

export async function fileToText(file: Blob): Promise<string | ArrayBuffer | null> {
  return await new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.onabort = (error) => reject(error);
    }
  });
}

export async function getImageSizeFromSrc(source: string): Promise<number[]> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve([img.width, img.height]);
    img.onerror = () => reject(new Error('Could not get image size'));
    img.src = source;
  });
}

export async function getVideoSizeFromSrc(source: string): Promise<number[]> {
  return await new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => resolve([video.videoWidth, video.videoHeight]);
    video.onerror = () => reject(new Error('Could not get video size'));
    video.src = source;
  });
}
