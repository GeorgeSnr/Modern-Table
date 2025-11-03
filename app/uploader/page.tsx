"use client";

import { UploadButton } from "@/utils/uploadthing";

export default function ExcelUploader() {
  return (
    <main className="flex w-[25%] border-2 rounded-lg flex-col items-center justify-between p-3 cursor-pointer">
      <UploadButton
        endpoint="excelUploader" // Changed from imageUploader
        onClientUploadComplete={(res) => {
          // `res` is an array of uploaded files
          console.log("Excel uploaded:", res);
          alert(`Excel uploaded successfully!`);
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          alert(`Upload failed: ${error.message}`);
        }}
        // Optional: Customize appearance
        appearance={{
          button:
            "ut-button:bg-green-600 ut-button:hover:bg-green-700 ut-button:text-white ut-button:font-medium ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:text-sm",
          allowedContent: "text-xs text-gray-600 mt-1",
        }}
        content={{
          // Customize button text
          button: ({ ready, isUploading }) => {
            if (!ready) return "Initializing...";
            if (isUploading) return "Uploading...";
            return "Upload Excel";
          },
          // Customize allowed files message
          allowedContent: "Max 16MB: .xlsx, .xls, .csv",
        }}
      />
    </main>
  );
}