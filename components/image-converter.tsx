"use client";

import { saveAs } from "file-saver";
import heic2any from "heic2any";
import JSZip from "jszip";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileImage,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useId, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type FileStatus = "queued" | "converting" | "done" | "failed" | "skipped";

interface ConvertedFile {
  id: string;
  originalFile: File;
  status: FileStatus;
  outputBlob?: Blob;
  downloadUrl?: string;
  fileName: string;
  error?: string;
}

type OutputFormat = "jpeg" | "png";

// Generate a unique ID that works in both client and server environments
const generateId = () => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Generate output filename for converted file
const generateOutputFileName = (originalName: string, format: OutputFormat) => {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  const extension = format === "jpeg" ? "jpeg" : "png";
  return `${baseName}.${extension}`;
};

interface DropZoneProps {
  outputFormat: OutputFormat;
  onFilesAdded: (files: ConvertedFile[]) => void;
}

const DropZone = React.memo(({ outputFormat, onFilesAdded }: DropZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      rejectedFiles.forEach((rejection) => {
        toast.error(
          `File "${rejection.file.name}" was rejected: ${
            rejection.errors[0]?.message || "Invalid file type"
          }`
        );
      });

      const newFiles: ConvertedFile[] = acceptedFiles.map((file) => {
        const isHeicFile =
          file.type === "image/heic" ||
          file.type === "image/heif" ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif");

        return {
          id: generateId(),
          originalFile: file,
          status: isHeicFile ? "queued" : "skipped",
          fileName: generateOutputFileName(file.name, outputFormat),
        };
      });

      onFilesAdded(newFiles);

      const skippedCount = newFiles.filter(
        (f) => f.status === "skipped"
      ).length;
      if (skippedCount > 0) {
        toast.info(
          `${skippedCount} non-HEIC file(s) skipped. Only HEIC/HEIF files are converted.`
        );
      }
    },
    [outputFormat, onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "image/heic": [".heic"],
        "image/heif": [".heif"],
        "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
      },
      multiple: true,
      onDrop,
      onDragEnter: undefined,
      onDragOver: undefined,
      onDragLeave: undefined,
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Images
        </CardTitle>
        <CardDescription>
          Drag and drop HEIC/HEIF files or click to select. Other image formats
          will be skipped.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive && !isDragReject && "border-primary bg-primary/5",
            isDragReject && "border-red-500 bg-red-50",
            !isDragActive &&
              "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          <input {...getInputProps()} />
          <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragReject ? (
            <p className="text-red-500">Some files are not supported</p>
          ) : isDragActive ? (
            <p className="text-primary">Drop files here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                Drag & drop HEIC/HEIF files here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supports .heic and .heif files. Other formats will be skipped.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

DropZone.displayName = "DropZone";

interface ProgressSectionProps {
  progress: number;
}

const ProgressSection = React.memo(({ progress }: ProgressSectionProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
});

ProgressSection.displayName = "ProgressSection";

interface ConversionSettingsProps {
  outputFormat: OutputFormat;
  quality: number[];
  isConverting: boolean;
  queuedCount: number;
  completedCount: number;
  progress: number;
  onOutputFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number[]) => void;
  onConvert: () => void;
  onCancel: () => void;
  onDownloadAll: () => void;
  onClearFiles: () => void;
}

const ConversionSettings = React.memo(
  ({
    outputFormat,
    quality,
    isConverting,
    queuedCount,
    completedCount,
    progress,
    onOutputFormatChange,
    onQualityChange,
    onConvert,
    onCancel,
    onDownloadAll,
    onClearFiles,
  }: ConversionSettingsProps) => {
    const outputFormatId = useId();
    const qualitySliderId = useId();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversion Settings</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFiles}
              disabled={isConverting}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={outputFormatId} className="text-sm font-medium">
                Output Format
              </label>
              <Select
                value={outputFormat}
                onValueChange={(value: OutputFormat) =>
                  onOutputFormatChange(value)
                }
                disabled={isConverting}
              >
                <SelectTrigger id={outputFormatId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {outputFormat === "jpeg" && (
              <div className="space-y-2">
                <label
                  htmlFor={qualitySliderId}
                  className="text-sm font-medium"
                >
                  Quality: {quality[0]}%
                </label>
                <Slider
                  id={qualitySliderId}
                  value={quality}
                  onValueChange={onQualityChange}
                  max={100}
                  min={10}
                  step={5}
                  disabled={isConverting}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onConvert}
              disabled={isConverting || queuedCount === 0}
              className="flex-1"
            >
              {isConverting
                ? "Converting..."
                : `Convert ${queuedCount} File${queuedCount !== 1 ? "s" : ""}`}
            </Button>

            {isConverting && (
              <Button variant="destructive" onClick={onCancel}>
                Cancel
              </Button>
            )}

            {completedCount > 0 && (
              <Button variant="outline" onClick={onDownloadAll}>
                <Download className="h-4 w-4 mr-1" />
                Download All
              </Button>
            )}
          </div>

          {isConverting && <ProgressSection progress={progress} />}
        </CardContent>
      </Card>
    );
  }
);

ConversionSettings.displayName = "ConversionSettings";

interface FileItemProps {
  file: ConvertedFile;
  onDownload: (file: ConvertedFile) => void;
}

const FileItem = React.memo(({ file, onDownload }: FileItemProps) => {
  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "converting":
        return (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "skipped":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: FileStatus) => {
    switch (status) {
      case "queued":
        return "Queued";
      case "converting":
        return "Converting...";
      case "done":
        return "Complete";
      case "failed":
        return "Failed";
      case "skipped":
        return "Skipped";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {getStatusIcon(file.status)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {file.originalFile.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {getStatusText(file.status)}
            {file.status === "done" && ` → ${file.fileName}`}
            {file.status === "failed" && file.error && ` (${file.error})`}
            {file.status === "skipped" && " (Non-HEIC file)"}
          </p>
        </div>
      </div>

      {file.status === "done" && (
        <Button variant="outline" size="sm" onClick={() => onDownload(file)}>
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

FileItem.displayName = "FileItem";

interface FileListProps {
  files: ConvertedFile[];
  onDownloadFile: (file: ConvertedFile) => void;
}

const FileList = React.memo(({ files, onDownloadFile }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {files.map((file) => (
              <FileItem key={file.id} file={file} onDownload={onDownloadFile} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

FileList.displayName = "FileList";

export default function ImageConverter() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState([100]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelConversion, setCancelConversion] = useState(false);

  const handleFilesAdded = useCallback((newFiles: ConvertedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const convertFiles = useCallback(async () => {
    if (isConverting) return;

    const queuedFiles = files.filter((f) => f.status === "queued");
    if (queuedFiles.length === 0) {
      toast.error("No files to convert");
      return;
    }

    setIsConverting(true);
    setCancelConversion(false);
    setProgress(0);

    const toType = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
    const qualityValue = quality[0] / 100;

    for (let i = 0; i < queuedFiles.length; i++) {
      if (cancelConversion) {
        toast.info("Conversion cancelled");
        break;
      }

      const file = queuedFiles[i];

      // Update status to converting
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "converting" as FileStatus } : f
        )
      );

      try {
        const outputBlob = await heic2any({
          blob: file.originalFile,
          toType,
          quality: outputFormat === "jpeg" ? qualityValue : undefined,
        });

        const blob = Array.isArray(outputBlob) ? outputBlob[0] : outputBlob;
        const downloadUrl = URL.createObjectURL(blob);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "done" as FileStatus,
                  outputBlob: blob,
                  downloadUrl,
                  fileName: generateOutputFileName(
                    f.originalFile.name,
                    outputFormat
                  ),
                }
              : f
          )
        );
      } catch (error) {
        console.error("Conversion failed:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "failed" as FileStatus,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : f
          )
        );
        toast.error(`Failed to convert ${file.originalFile.name}`);
      }

      setProgress(((i + 1) / queuedFiles.length) * 100);
    }

    setIsConverting(false);
    setCancelConversion(false);

    if (!cancelConversion) {
      toast.success("Conversion completed!");
    }
  }, [files, outputFormat, quality, isConverting, cancelConversion]);

  const downloadFile = useCallback((file: ConvertedFile) => {
    if (!file.downloadUrl) return;

    const a = document.createElement("a");
    a.href = file.downloadUrl;
    a.download = file.fileName;
    a.click();
  }, []);

  const downloadAll = useCallback(async () => {
    const completedFiles = files.filter(
      (f) => f.status === "done" && f.outputBlob
    );

    if (completedFiles.length === 0) {
      toast.error("No files to download");
      return;
    }

    if (completedFiles.length === 1) {
      downloadFile(completedFiles[0]);
      return;
    }

    try {
      const zip = new JSZip();

      completedFiles.forEach((file) => {
        if (file.outputBlob) {
          zip.file(file.fileName, file.outputBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "converted-images.zip");
      toast.success("All files downloaded as ZIP");
    } catch (error) {
      console.error("Failed to create ZIP:", error);
      toast.error("Failed to create ZIP file");
    }
  }, [files, downloadFile]);

  const clearFiles = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    files.forEach((file) => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
    setProgress(0);
    toast.info("Files cleared");
  }, [files]);

  const cancelConvert = useCallback(() => {
    setCancelConversion(true);
  }, []);

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const completedCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            HEIC to JPEG/PNG Converter
          </h1>
          <p className="text-muted-foreground">
            Convert HEIC/HEIF images to JPEG or PNG format entirely in your
            browser
          </p>
        </header>

        <DropZone outputFormat={outputFormat} onFilesAdded={handleFilesAdded} />

        {files.length > 0 && (
          <ConversionSettings
            outputFormat={outputFormat}
            quality={quality}
            isConverting={isConverting}
            queuedCount={queuedCount}
            completedCount={completedCount}
            progress={progress}
            onOutputFormatChange={setOutputFormat}
            onQualityChange={setQuality}
            onConvert={convertFiles}
            onCancel={cancelConvert}
            onDownloadAll={downloadAll}
            onClearFiles={clearFiles}
          />
        )}

        <FileList files={files} onDownloadFile={downloadFile} />

        <footer className="text-center text-md text-muted-foreground">
          All processing happens in your browser. No files are uploaded to any
          server.
        </footer>
      </div>
    </div>
  );
}
