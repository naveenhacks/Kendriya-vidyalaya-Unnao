import { UploadedFile } from "../types.ts";

/**
 * MOCK FILE SERVICE
 * 
 * This service replaces the original Firebase implementation.
 * It uses the browser's FileReader API to convert files to Data URLs (Base64)
 * which are then stored in localStorage via the respective Contexts.
 * 
 * No actual backend or cloud storage is used.
 */

export const uploadHomeworkFile = async (file: File, homeworkId: string): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: reader.result as string, // Store as Base64 in local storage
            });
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
     return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};

export const deleteFile = async (url: string) => {
    // No-op for local storage mock as data is embedded in JSON
    return Promise.resolve();
};

// Mock Helpers for legacy compatibility
export const getCollection = () => { console.warn("Backend disabled: getCollection called"); };
export const getDocument = async () => null;
export const addDocument = async () => { console.warn("Backend disabled: addDocument called"); };
export const setDocument = async () => { console.warn("Backend disabled: setDocument called"); };
export const updateDocument = async () => { console.warn("Backend disabled: updateDocument called"); };
export const deleteDocument = async () => { console.warn("Backend disabled: deleteDocument called"); };